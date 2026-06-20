import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authStore'

const FEATURES = [
  {
    icon: '📝',
    title: 'Tus plantillas, a tu medida',
    desc: 'Define una vez tus direcciones, condiciones y textos. La app arma el mensaje por ti.',
  },
  {
    icon: '⏰',
    title: 'Se adapta a la hora',
    desc: 'Detecta el momento del día y elige el mensaje correcto (de día, de noche, etc.).',
  },
  {
    icon: '⚡',
    title: 'Listo en un toque',
    desc: 'Genera el mensaje y cópialo al instante para pegarlo en el chat del conductor.',
  },
  {
    icon: '☁️',
    title: 'Te sigue a todos lados',
    desc: 'Tus plantillas se guardan en la nube: entra desde el móvil o el computador.',
  },
]

export default function Login() {
  const { user, loading, isConfigured, signInWithGoogle } = useAuth()

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <>
      <header className="app-header">
        <h1>🚕 Mensajes Uber</h1>
      </header>

      <main className="app-main">
        <section className="landing">
          <div className="hero-emoji">📍🚕</div>
          <h1>Que tu Uber te encuentre a la primera</h1>
          <p className="tagline">
            Deja de escribir las mismas indicaciones cada vez. Crea tu mensaje perfecto una
            vez y envíalo en segundos.
          </p>

          <div className="chat">
            <p className="chat-label">Así se ve tu mensaje 👇</p>
            <div className="bubble">
              Hola. Los pasajes de mi calle están cerrados; entra por la calle de atrás, hay un
              portón abierto junto al número 12. ¡Gracias! 🙌
              <span className="bubble-meta">9:41 ✓✓</span>
            </div>
          </div>
        </section>

        <div className="features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <div>
                <p className="feature-title">{f.title}</p>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {!isConfigured ? (
          <div className="card" style={{ textAlign: 'left' }}>
            <p className="card-title">⚙️ Falta configurar Supabase</p>
            <p className="card-sub">
              Crea un archivo <code>.env</code> con <code>VITE_SUPABASE_URL</code> y{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> (ver <code>.env.example</code>) y reinicia el
              servidor.
            </p>
          </div>
        ) : (
          <>
            <button className="btn btn-outline btn-google" onClick={signInWithGoogle}>
              <GoogleIcon />
              Entrar con Google
            </button>
            <p className="cta-note">
              Gratis · Sin contraseñas · Sin spam. Solo entras con tu cuenta de Google. 🔒
            </p>
          </>
        )}
      </main>
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
