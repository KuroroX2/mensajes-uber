import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getTemplate, saveTemplate, emptyTemplate } from '../lib/db'
import { minutesToHHMM, hhmmToMinutes } from '../lib/messageEngine'

const newId = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`

export default function TemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [t, setT] = useState(() => (id ? null : emptyTemplate()))
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (!id) return
    let alive = true
    getTemplate(id).then((found) => {
      if (!alive) return
      setT(found || emptyTemplate())
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [id])

  if (loading || !t) {
    return (
      <>
        <header className="app-header">
          <h1>Editar plantilla</h1>
        </header>
        <main className="app-main">
          <p className="muted">Cargando…</p>
        </main>
      </>
    )
  }

  const patch = (p) => setT((prev) => ({ ...prev, ...p }))

  // ---- Campos ----
  function addField(type) {
    const field =
      type === 'toggle'
        ? { id: newId(), label: 'Nueva opción sí/no', type: 'toggle' }
        : {
            id: newId(),
            label: 'Nueva lista de opciones',
            type: 'select',
            options: [{ value: newId(), label: 'Opción 1' }],
          }
    patch({ fields: [...(t.fields || []), field] })
  }

  function updateField(fid, p) {
    patch({ fields: t.fields.map((f) => (f.id === fid ? { ...f, ...p } : f)) })
  }

  function removeField(fid) {
    patch({
      fields: t.fields.filter((f) => f.id !== fid),
      // Limpia condiciones que apuntaban al campo borrado
      fragments: t.fragments.map((fr) => ({
        ...fr,
        conditions: (fr.conditions || []).filter((c) => c.fieldId !== fid),
      })),
    })
  }

  function addOption(fid) {
    updateField(fid, {
      options: [
        ...(t.fields.find((f) => f.id === fid).options || []),
        { value: newId(), label: 'Nueva opción' },
      ],
    })
  }

  function updateOption(fid, optValue, p) {
    const f = t.fields.find((x) => x.id === fid)
    updateField(fid, {
      options: f.options.map((o) => (o.value === optValue ? { ...o, ...p } : o)),
    })
  }

  function removeOption(fid, optValue) {
    const f = t.fields.find((x) => x.id === fid)
    updateField(fid, { options: f.options.filter((o) => o.value !== optValue) })
  }

  // ---- Fragmentos ----
  function addFragment() {
    patch({
      fragments: [
        ...(t.fragments || []),
        { id: newId(), text: '', order: (t.fragments?.length || 0), conditions: [] },
      ],
    })
  }

  function updateFragment(frid, p) {
    patch({ fragments: t.fragments.map((fr) => (fr.id === frid ? { ...fr, ...p } : fr)) })
  }

  function removeFragment(frid) {
    patch({ fragments: t.fragments.filter((fr) => fr.id !== frid) })
  }

  function moveFragment(frid, dir) {
    const ordered = [...t.fragments].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const idx = ordered.findIndex((f) => f.id === frid)
    const swap = idx + dir
    if (swap < 0 || swap >= ordered.length) return
    ;[ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]]
    patch({ fragments: ordered.map((f, i) => ({ ...f, order: i })) })
  }

  function addCondition(frid) {
    const firstField = t.fields?.[0]
    if (!firstField) {
      alert('Primero crea al menos una opción arriba.')
      return
    }
    const fr = t.fragments.find((x) => x.id === frid)
    updateFragment(frid, {
      conditions: [
        ...(fr.conditions || []),
        { fieldId: firstField.id, value: defaultValueFor(firstField) },
      ],
    })
  }

  function updateCondition(frid, idx, p) {
    const fr = t.fragments.find((x) => x.id === frid)
    updateFragment(frid, {
      conditions: fr.conditions.map((c, i) => (i === idx ? { ...c, ...p } : c)),
    })
  }

  function removeCondition(frid, idx) {
    const fr = t.fragments.find((x) => x.id === frid)
    updateFragment(frid, { conditions: fr.conditions.filter((_, i) => i !== idx) })
  }

  function defaultValueFor(field) {
    if (field.type === 'toggle') return true
    return field.options?.[0]?.value ?? ''
  }

  async function handleSave() {
    if (!t.name.trim()) {
      alert('Ponle un nombre a la plantilla.')
      return
    }
    await saveTemplate({ ...t, name: t.name.trim() })
    navigate('/plantillas')
  }

  const orderedFragments = [...(t.fragments || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/plantillas" className="back-link">
            ←
          </Link>
          <h1>{id ? 'Editar plantilla' : 'Nueva plantilla'}</h1>
        </div>
      </header>

      <main className="app-main">
        <div className="field">
          <label className="field-label">Nombre de la plantilla</label>
          <input
            type="text"
            value={t.name}
            placeholder="Ej. Mi casa"
            onChange={(e) => patch({ name: e.target.value })}
          />
        </div>

        <div className="field">
          <label className="field-label">Saludo inicial</label>
          <input
            type="text"
            value={t.greeting}
            placeholder="Ej. Hola."
            onChange={(e) => patch({ greeting: e.target.value })}
          />
          <p className="inline-hint">Se antepone al mensaje generado.</p>
        </div>

        {/* ---------- OPCIONES (FIELDS) ---------- */}
        <div className="section-title">Opciones que eliges al generar</div>
        {(t.fields || []).map((f) => (
          <div className="card" key={f.id}>
            <div className="field">
              <label className="field-label">Etiqueta</label>
              <input
                type="text"
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
              />
            </div>

            <div className="muted" style={{ marginBottom: 8 }}>
              Tipo: {f.type === 'toggle' ? 'Sí / No' : 'Lista de opciones'}
            </div>

            {f.type === 'select' && (
              <>
                <label className="field-label">Opciones</label>
                {(f.options || []).map((o) => (
                  <div className="row-2" key={o.value} style={{ marginBottom: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={o.label}
                      onChange={(e) => updateOption(f.id, o.value, { label: e.target.value })}
                    />
                    {f.autoTime && (
                      <input
                        type="time"
                        style={{ maxWidth: 120 }}
                        value={minutesToHHMM(o.fromMin)}
                        onChange={(e) =>
                          updateOption(f.id, o.value, { fromMin: hhmmToMinutes(e.target.value) })
                        }
                      />
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ maxWidth: 40, color: 'var(--red)' }}
                      onClick={() => removeOption(f.id, o.value)}
                      title="Quitar opción"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => addOption(f.id)}>
                  + Opción
                </button>

                <div className="toggle-row" style={{ marginTop: 12 }}>
                  <label htmlFor={`auto-${f.id}`}>⏰ Autodetectar según la hora</label>
                  <input
                    id={`auto-${f.id}`}
                    type="checkbox"
                    checked={!!f.autoTime}
                    onChange={(e) => updateField(f.id, { autoTime: e.target.checked })}
                  />
                </div>
                {f.autoTime && (
                  <p className="inline-hint">
                    Define la hora "desde" de cada opción; se elegirá automáticamente la que
                    corresponda al momento actual.
                  </p>
                )}
              </>
            )}

            <hr className="divider" />
            <button
              className="btn btn-danger btn-sm"
              onClick={() => removeField(f.id)}
            >
              Eliminar opción
            </button>
          </div>
        ))}

        <div className="btn-row">
          <button className="btn btn-outline btn-sm" onClick={() => addField('select')}>
            + Lista de opciones
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => addField('toggle')}>
            + Sí / No
          </button>
        </div>

        {/* ---------- FRAGMENTOS ---------- */}
        <div className="section-title">Fragmentos de texto</div>
        <p className="inline-hint" style={{ marginTop: -4, marginBottom: 12 }}>
          Cada fragmento se incluye en el mensaje solo si se cumplen TODAS sus condiciones.
          Sin condiciones = siempre se incluye.
        </p>

        {orderedFragments.map((fr, i) => (
          <div className="card" key={fr.id}>
            <div className="list-row" style={{ marginBottom: 8 }}>
              <span className="muted">Fragmento {i + 1}</span>
              <span>
                <button className="btn btn-ghost btn-sm" onClick={() => moveFragment(fr.id, -1)}>
                  ↑
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => moveFragment(fr.id, 1)}>
                  ↓
                </button>
              </span>
            </div>

            <textarea
              rows={3}
              value={fr.text}
              placeholder="Texto del fragmento…"
              onChange={(e) => updateFragment(fr.id, { text: e.target.value })}
            />

            <label className="field-label" style={{ marginTop: 12 }}>
              Condiciones
            </label>
            {(fr.conditions || []).map((c, ci) => {
              const field = t.fields.find((x) => x.id === c.fieldId)
              return (
                <div className="row-2" key={ci} style={{ marginBottom: 8, alignItems: 'center' }}>
                  <select
                    value={c.fieldId}
                    onChange={(e) => {
                      const nf = t.fields.find((x) => x.id === e.target.value)
                      updateCondition(fr.id, ci, {
                        fieldId: e.target.value,
                        value: defaultValueFor(nf),
                      })
                    }}
                  >
                    {t.fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  {field?.type === 'toggle' ? (
                    <select
                      value={String(c.value)}
                      onChange={(e) =>
                        updateCondition(fr.id, ci, { value: e.target.value === 'true' })
                      }
                    >
                      <option value="true">Activado</option>
                      <option value="false">Desactivado</option>
                    </select>
                  ) : (
                    <select
                      value={c.value}
                      onChange={(e) => updateCondition(fr.id, ci, { value: e.target.value })}
                    >
                      {field?.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ maxWidth: 40, color: 'var(--red)' }}
                    onClick={() => removeCondition(fr.id, ci)}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
            <button className="btn btn-outline btn-sm" onClick={() => addCondition(fr.id)}>
              + Condición
            </button>

            <hr className="divider" />
            <button className="btn btn-danger btn-sm" onClick={() => removeFragment(fr.id)}>
              Eliminar fragmento
            </button>
          </div>
        ))}

        <button className="btn btn-outline btn-sm" onClick={addFragment}>
          + Fragmento
        </button>

        <hr className="divider" />
        <button className="btn" onClick={handleSave}>
          Guardar plantilla
        </button>
      </main>
    </>
  )
}
