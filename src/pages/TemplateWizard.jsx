import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveTemplate } from '../lib/db'
import { buildTemplateFromWizard, EXTRA_SUGGESTIONS } from '../lib/wizard'
import { generateMessage, initSelections } from '../lib/messageEngine'

const STEPS = ['Nombre', 'Situaciones', 'Extras', 'Revisar']
const emptySituation = () => ({ label: '', text: '', from: '' })

export default function TemplateWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('Hola.')
  const [autoTime, setAutoTime] = useState(false)
  const [situations, setSituations] = useState([emptySituation()])
  const [extras, setExtras] = useState([])

  const data = { name, greeting, autoTime, situations, extras }
  const preview = useMemo(() => {
    const t = buildTemplateFromWizard(data)
    return { template: t, message: generateMessage(t, initSelections(t)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, greeting, autoTime, situations, extras])

  const canNext =
    (step === 0 && name.trim()) ||
    (step === 1 && situations.some((s) => s.text.trim())) ||
    step === 2 ||
    step === 3

  // --- situaciones ---
  const updateSit = (i, p) => setSituations((arr) => arr.map((s, j) => (j === i ? { ...s, ...p } : s)))
  const addSit = () => setSituations((arr) => [...arr, emptySituation()])
  const removeSit = (i) => setSituations((arr) => arr.filter((_, j) => j !== i))

  // --- extras ---
  const addExtra = (ex) => setExtras((arr) => [...arr, ex || { label: '', text: '' }])
  const updateExtra = (i, p) => setExtras((arr) => arr.map((e, j) => (j === i ? { ...e, ...p } : e)))
  const removeExtra = (i) => setExtras((arr) => arr.filter((_, j) => j !== i))
  const usedSuggestions = extras.map((e) => e.label)

  async function handleCreate() {
    setSaving(true)
    try {
      await saveTemplate(buildTemplateFromWizard(data))
      navigate('/')
    } catch (e) {
      setSaving(false)
      alert('No se pudo crear la plantilla: ' + (e?.message || e))
    }
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/plantillas" className="back-link">
            ←
          </Link>
          <h1>Crear con asistente</h1>
        </div>
      </header>

      <main className="app-main">
        <div className="wizard-progress">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? 'active' : ''} title={s} />
          ))}
        </div>

        {/* STEP 0 — Nombre */}
        {step === 0 && (
          <div>
            <h2 className="wizard-q">¿Cómo se llama este lugar?</h2>
            <p className="wizard-help">Un nombre corto para reconocerlo. Podrás crear más después.</p>
            <div className="field">
              <input
                type="text"
                autoFocus
                placeholder="Ej. Mi casa, La oficina, Casa de mamá…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Saludo inicial</label>
              <input type="text" value={greeting} onChange={(e) => setGreeting(e.target.value)} />
              <p className="inline-hint">Se antepone al mensaje. Déjalo en "Hola." si dudas.</p>
            </div>
          </div>
        )}

        {/* STEP 1 — Situaciones */}
        {step === 1 && (
          <div>
            <h2 className="wizard-q">¿Cómo llega el conductor?</h2>
            <p className="wizard-help">
              Agrega cada situación distinta y escribe el mensaje para esa situación. Si solo hay
              una forma de llegar, deja una sola.
            </p>

            <div className="toggle-row" style={{ marginBottom: 16 }}>
              <label htmlFor="autotime">⏰ Elegir automáticamente según la hora</label>
              <input
                id="autotime"
                type="checkbox"
                checked={autoTime}
                onChange={(e) => setAutoTime(e.target.checked)}
              />
            </div>
            {autoTime && (
              <p className="inline-hint" style={{ marginTop: -8, marginBottom: 14 }}>
                Indica la hora "desde" de cada situación; la app elegirá sola la que corresponda.
              </p>
            )}

            {situations.map((s, i) => (
              <div className="card" key={i}>
                <div className="list-row" style={{ marginBottom: 10 }}>
                  <span className="muted">Situación {i + 1}</span>
                  {situations.length > 1 && (
                    <button
                      className="btn-ghost btn-sm"
                      style={{ color: 'var(--red)' }}
                      onClick={() => removeSit(i)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="row-2" style={{ marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder={autoTime ? 'Ej. De noche' : 'Ej. Desde abajo'}
                    value={s.label}
                    onChange={(e) => updateSit(i, { label: e.target.value })}
                  />
                  {autoTime && (
                    <input
                      type="time"
                      style={{ maxWidth: 130 }}
                      value={s.from}
                      onChange={(e) => updateSit(i, { from: e.target.value })}
                    />
                  )}
                </div>
                <textarea
                  rows={3}
                  placeholder="Mensaje para esta situación. Ej. Los pasajes están cerrados; entra por la calle de atrás, hay un portón abierto."
                  value={s.text}
                  onChange={(e) => updateSit(i, { text: e.target.value })}
                />
              </div>
            ))}

            <button className="btn btn-outline btn-sm" onClick={addSit}>
              + Agregar situación
            </button>
          </div>
        )}

        {/* STEP 2 — Extras */}
        {step === 2 && (
          <div>
            <h2 className="wizard-q">¿Algún aviso ocasional?</h2>
            <p className="wizard-help">
              Opciones de sí/no que activas solo cuando aplican (ej. viajar con bebé o equipaje).
              Toca una sugerencia para añadirla, o crea la tuya.
            </p>

            <div style={{ margin: '0 0 16px' }}>
              {EXTRA_SUGGESTIONS.filter((s) => !usedSuggestions.includes(s.label)).map((s) => (
                <button key={s.label} className="suggest-btn" onClick={() => addExtra(s)}>
                  + {s.label}
                </button>
              ))}
            </div>

            {extras.map((ex, i) => (
              <div className="card" key={i}>
                <div className="list-row" style={{ marginBottom: 10 }}>
                  <span className="muted">Opción {i + 1}</span>
                  <button
                    className="btn-ghost btn-sm"
                    style={{ color: 'var(--red)' }}
                    onClick={() => removeExtra(i)}
                  >
                    Quitar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nombre del botón. Ej. 🍼 Viajo con bebé"
                  value={ex.label}
                  style={{ marginBottom: 10 }}
                  onChange={(e) => updateExtra(i, { label: e.target.value })}
                />
                <textarea
                  rows={2}
                  placeholder="Frase que se agrega cuando lo activas."
                  value={ex.text}
                  onChange={(e) => updateExtra(i, { text: e.target.value })}
                />
              </div>
            ))}

            <button className="btn btn-outline btn-sm" onClick={() => addExtra()}>
              + Crear opción propia
            </button>
          </div>
        )}

        {/* STEP 3 — Revisar */}
        {step === 3 && (
          <div>
            <h2 className="wizard-q">¡Listo! Así quedó</h2>
            <p className="wizard-help">Esta es una vista previa del mensaje. Puedes volver a ajustar.</p>
            <div className="chat">
              <div className="bubble">
                {preview.message || '(escribe al menos una situación)'}
                <span className="bubble-meta">vista previa</span>
              </div>
            </div>
            <p className="inline-hint" style={{ textAlign: 'center', marginTop: 14 }}>
              {preview.template.fields.length} opciones · {preview.template.fragments.length} frases
            </p>
          </div>
        )}

        {/* nav */}
        <div className="btn-row" style={{ marginTop: 24 }}>
          {step > 0 && (
            <button className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Siguiente
            </button>
          ) : (
            <button className="btn" disabled={saving || !name.trim()} onClick={handleCreate}>
              {saving ? 'Creando…' : 'Crear plantilla'}
            </button>
          )}
        </div>

        <p className="cta-note" style={{ marginTop: 18 }}>
          ¿Prefieres control total?{' '}
          <Link to="/plantillas/nueva" style={{ color: 'var(--text)', fontWeight: 600 }}>
            Modo avanzado
          </Link>
        </p>
      </main>
    </>
  )
}
