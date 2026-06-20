import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listTemplates, deleteTemplate } from '../lib/db'

export default function TemplatesList() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    listTemplates().then((ts) => {
      setTemplates(ts)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar la plantilla "${name}"?`)) return
    await deleteTemplate(id)
    setTemplates((ts) => ts.filter((t) => t.id !== id))
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/" className="back-link">
            ←
          </Link>
          <h1>Mis plantillas</h1>
        </div>
        <button className="btn-ghost" onClick={() => navigate('/plantillas/nueva')}>
          + Nueva
        </button>
      </header>

      <main className="app-main">
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : templates.length === 0 ? (
          <div className="empty">
            <p>Aún no tienes plantillas.</p>
            <Link to="/plantillas/nueva" className="btn btn-sm">
              Crear plantilla
            </Link>
          </div>
        ) : (
          templates.map((t) => (
            <div className="card" key={t.id}>
              <div className="list-row">
                <div>
                  <p className="card-title">{t.name || 'Sin nombre'}</p>
                  <p className="card-sub">
                    {(t.fields?.length || 0)} opciones · {(t.fragments?.length || 0)} fragmentos
                  </p>
                </div>
              </div>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate(`/plantillas/${t.id}`)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(t.id, t.name)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </>
  )
}
