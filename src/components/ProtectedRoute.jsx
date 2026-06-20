import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="app-main">
        <p className="muted">Cargando…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
