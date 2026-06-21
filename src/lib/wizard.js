// Convierte las respuestas del asistente en la estructura de plantilla
// (fields + fragments) que entiende el motor (ver messageEngine.js).

import { hhmmToMinutes } from './messageEngine'

const newId = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`

// data = { name, greeting, autoTime, situations: [{label,text,from}], extras: [{label,text}] }
export function buildTemplateFromWizard(data) {
  const { name, greeting, autoTime } = data
  const fields = []
  const fragments = []
  let order = 0

  // 1) Extras (sí/no) -> toggles, se anteponen al cuerpo del mensaje
  for (const ex of data.extras || []) {
    if (!ex.label.trim() || !ex.text.trim()) continue
    const fid = newId()
    fields.push({ id: fid, label: ex.label.trim(), type: 'toggle' })
    fragments.push({
      id: newId(),
      text: ex.text.trim(),
      order: order++,
      conditions: [{ fieldId: fid, value: true }],
    })
  }

  // 2) Situaciones de llegada
  const situations = (data.situations || []).filter((s) => s.text.trim())

  if (situations.length <= 1 && !autoTime) {
    // Una sola indicación: fragmento siempre visible, sin selector
    if (situations.length === 1) {
      fragments.push({
        id: newId(),
        text: situations[0].text.trim(),
        order,
        conditions: [],
      })
    }
  } else {
    const sfid = newId()
    const field = {
      id: sfid,
      label: autoTime ? 'Horario' : '¿Por dónde viene el conductor?',
      type: 'select',
      options: [],
    }
    if (autoTime) field.autoTime = true

    for (const s of situations) {
      const val = newId()
      const opt = { value: val, label: s.label.trim() || 'Opción' }
      if (autoTime) {
        const mins = hhmmToMinutes(s.from)
        if (typeof mins === 'number') opt.fromMin = mins
      }
      field.options.push(opt)
      fragments.push({
        id: newId(),
        text: s.text.trim(),
        order: order++,
        conditions: [{ fieldId: sfid, value: val }],
      })
    }
    // El selector de situación va primero en el generador
    fields.unshift(field)
  }

  return {
    id: '',
    name: (name || '').trim(),
    greeting: (greeting || 'Hola.').trim(),
    fields,
    fragments,
  }
}

// Sugerencias rápidas de extras para mostrar en el asistente.
export const EXTRA_SUGGESTIONS = [
  {
    label: '🍼 Viajo con bebé (silla de coche)',
    text: '¿Tiene espacio en el maletero? Llevo un coche que se pliega y una bebé con su silla; la instalación toma solo unos segundos.',
  },
  {
    label: '🧳 Llevo equipaje grande',
    text: 'Llevo equipaje grande, ¿tiene espacio disponible en el maletero? ¡Gracias!',
  },
  {
    label: '🐶 Viajo con mascota',
    text: 'Viajo con una mascota pequeña y tranquila (va en transportín). ¿Sin problema?',
  },
  {
    label: '🛒 Llevo compras / bolsas',
    text: 'Llevo algunas bolsas de compras, ¿me ayuda con el maletero? ¡Gracias!',
  },
]
