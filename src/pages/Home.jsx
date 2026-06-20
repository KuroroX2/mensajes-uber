import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTemplates } from '../lib/db'
import { generateMessage, initSelections } from '../lib/messageEngine'
import { useAuth } from '../context/authStore'

export default function Home() {
  const [templates, setTemplates] = useState([])
  const [activeId, setActiveId] = useState('')
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { signOut } = useAuth()

  useEffect(() => {
    listTemplates().then((ts) => {
      setTemplates(ts)
      if (ts.length > 0) {
        setActiveId(ts[0].id)
        setSelections(initSelections(ts[0]))
      }
      setLoading(false)
    })
  }, [])

  const template = useMemo(
    () => templates.find((t) => t.id === activeId) || null,
    [templates, activeId]
  )

  function changeTemplate(id) {
    const t = templates.find((x) => x.id === id)
    setActiveId(id)
    if (t) setSelections(initSelections(t))
  }

  function setField(fieldId, value) {
    setSelections((s) => ({ ...s, [fieldId]: value }))
  }

  const message = useMemo(
    () => (template ? generateMessage(template, selections) : ''),
    [template, selections]
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
    } catch {
      // Fallback para navegadores/contextos sin Clipboard API
      const ta = document.createElement('textarea')
      ta.value = message
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <>
        <header className="app-header">
          <h1>📍 Mensajes Uber</h1>
        </header>
        <main className="app-main">
          <p className="muted">Cargando…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="app-header">
        <h1>📍 Mensajes Uber</h1>
        <span style={{ display: 'flex', gap: 4 }}>
          <Link to="/plantillas" className="btn-ghost">
            Plantillas
          </Link>
          <button className="btn-ghost" onClick={signOut}>
            Salir
          </button>
        </span>
      </header>

      <main className="app-main">
        {templates.length === 0 ? (
          <div className="empty">
            <p>No tienes plantillas todavía.</p>
            <Link to="/plantillas/nueva" className="btn btn-sm">
              Crear mi primera plantilla
            </Link>
          </div>
        ) : (
          <>
            {templates.length > 1 && (
              <div className="field">
                <label className="field-label">Plantilla</label>
                <select value={activeId} onChange={(e) => changeTemplate(e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {template?.fields?.map((f) => (
              <FieldControl
                key={f.id}
                field={f}
                value={selections[f.id]}
                onChange={(v) => setField(f.id, v)}
              />
            ))}

            <div className="field">
              <label className="field-label">Mensaje listo para enviar:</label>
              <textarea readOnly rows={7} value={message} />
            </div>

            <button className="btn" onClick={copy}>
              Copiar mensaje
            </button>
            <div className="toast">{copied ? '¡Copiado al portapapeles! ✓' : ''}</div>
          </>
        )}
      </main>
    </>
  )
}

function FieldControl({ field, value, onChange }) {
  if (field.type === 'toggle') {
    return (
      <div className="field">
        <div className="toggle-row">
          <label htmlFor={field.id}>{field.label}</label>
          <input
            id={field.id}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={field.id}>
        {field.label}
        {field.autoTime && <span className="inline-hint"> (auto según la hora)</span>}
      </label>
      <select id={field.id} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
