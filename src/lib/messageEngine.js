// Motor de generación de mensajes.
// Una plantilla se compone de:
//   - greeting: texto inicial (ej. "Hola.")
//   - fields:   las opciones que el usuario elige al generar
//               { id, label, type: 'select' | 'toggle', autoTime?, options?: [{ value, label, fromMin? }] }
//   - fragments: trozos de texto con condiciones
//               { id, text, order, conditions: [{ fieldId, value }] }  // AND; vacío = siempre
//
// El mensaje final = greeting + los fragmentos cuya condición se cumple, en orden.

// Devuelve el valor autodetectado por hora para un campo select con autoTime.
// Cada opción puede tener `fromMin` (minutos desde medianoche). Se elige la última
// opción cuyo fromMin <= ahora; si la hora actual es menor que todas, envuelve a la
// última (caso "noche" que cruza la medianoche).
export function autoTimeValue(field, now = new Date()) {
  const opts = (field.options || []).filter((o) => typeof o.fromMin === 'number')
  if (opts.length === 0) return field.options?.[0]?.value ?? ''
  const sorted = [...opts].sort((a, b) => a.fromMin - b.fromMin)
  const mins = now.getHours() * 60 + now.getMinutes()
  let chosen = null
  for (const o of sorted) {
    if (o.fromMin <= mins) chosen = o
  }
  if (!chosen) chosen = sorted[sorted.length - 1] // envuelve (madrugada)
  return chosen.value
}

// Selecciones iniciales por defecto para una plantilla.
export function initSelections(template, now = new Date()) {
  const sel = {}
  for (const f of template.fields || []) {
    if (f.type === 'toggle') {
      sel[f.id] = false
    } else if (f.type === 'select') {
      sel[f.id] = f.autoTime ? autoTimeValue(f, now) : f.options?.[0]?.value ?? ''
    }
  }
  return sel
}

function conditionsMatch(conditions, selections) {
  if (!conditions || conditions.length === 0) return true
  return conditions.every((c) => {
    const current = selections[c.fieldId]
    // Normalizamos para comparar booleanos guardados como string.
    if (typeof current === 'boolean') {
      return String(current) === String(c.value)
    }
    return current === c.value
  })
}

// Genera el texto final.
export function generateMessage(template, selections) {
  const fragments = [...(template.fragments || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )
  const blocks = fragments
    .filter((f) => conditionsMatch(f.conditions, selections))
    .map((f) => f.text.trim())
    .filter(Boolean)

  const greeting = (template.greeting || '').trim()
  const body = blocks.join('\n\n')
  if (!greeting) return body
  if (!body) return greeting
  return `${greeting} ${body}`
}

export function minutesToHHMM(min) {
  if (typeof min !== 'number') return ''
  const h = String(Math.floor(min / 60) % 24).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

export function hhmmToMinutes(str) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(str?.trim() || '')
  if (!m) return undefined
  return Number(m[1]) * 60 + Number(m[2])
}
