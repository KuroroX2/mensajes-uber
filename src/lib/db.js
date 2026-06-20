// Capa de datos sobre Supabase.
// Tabla `templates`: { id uuid, user_id uuid, name text, content jsonb, timestamps }.
// El RLS garantiza que cada usuario solo ve/edita lo suyo (ver supabase/schema.sql).

import { supabase } from './supabase'
import { buildSeedTemplate } from './seed'

// --- mapeo fila <-> objeto plantilla ---
function rowToTemplate(row) {
  const content = row.content || {}
  return {
    id: row.id,
    name: row.name || '',
    greeting: content.greeting || '',
    fields: content.fields || [],
    fragments: content.fragments || [],
  }
}

function templateToRow(t, userId) {
  return {
    ...(t.id ? { id: t.id } : {}),
    user_id: userId,
    name: t.name,
    content: {
      greeting: t.greeting || '',
      fields: t.fields || [],
      fragments: t.fragments || [],
    },
    updated_at: new Date().toISOString(),
  }
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// Evita sembrar dos veces (StrictMode dispara los effects dos veces en dev).
const seedInFlight = new Map()

async function ensureSeed(userId) {
  if (seedInFlight.has(userId)) return seedInFlight.get(userId)
  const p = (async () => {
    const { count } = await supabase
      .from('templates')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if ((count ?? 0) === 0) {
      const seed = buildSeedTemplate()
      await supabase.from('templates').insert(
        templateToRow(
          { name: seed.name, greeting: seed.greeting, fields: seed.fields, fragments: seed.fragments },
          userId
        )
      )
    }
  })()
  seedInFlight.set(userId, p)
  try {
    await p
  } finally {
    seedInFlight.delete(userId)
  }
  return p
}

export async function listTemplates() {
  const userId = await currentUserId()
  if (!userId) return []
  await ensureSeed(userId)
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToTemplate)
}

export async function getTemplate(id) {
  const { data, error } = await supabase.from('templates').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToTemplate(data) : null
}

export async function saveTemplate(template) {
  const userId = await currentUserId()
  if (!userId) throw new Error('No hay sesión activa.')
  const row = templateToRow(template, userId)
  const { data, error } = await supabase
    .from('templates')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return rowToTemplate(data)
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from('templates').delete().eq('id', id)
  if (error) throw error
}

export function emptyTemplate() {
  return {
    id: '',
    name: '',
    greeting: 'Hola.',
    fields: [],
    fragments: [],
  }
}
