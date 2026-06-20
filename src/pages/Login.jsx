import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authStore'

const FEATURES = [
  {
    icon: '📝',
    title: 'Tus plantillas',
    desc: 'Define tus direcciones, condiciones y textos una vez.',
    accent: '#60a5fa',
  },
  {
    icon: '⏰',
    title: 'Según la hora',
    desc: 'El mensaje correcto para cada momento del día.',
    accent: '#fbbf24',
  },
  {
    icon: '⚡',
    title: 'En un toque',
    desc: 'Genera y copia el mensaje al instante.',
    accent: '#34d399',
  },
  {
    icon: '☁️',
    title: 'En la nube',
    desc: 'Tus plantillas, en el móvil y el computador.',
    accent: '#a78bfa',
  },
]

export default function Login() {
  const { user, loading, isConfigured, signInWithGoogle } = useAuth()

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <div className="login-page">
      <section className="landing">
        <div className="hero-badge">
          <PinIcon />
        </div>
        <h1>Que tu Uber te encuentre a la primera</h1>
        <p className="tagline">
          Deja de escribir las mismas indicaciones cada vez. Crea tu mensaje perfecto una vez
          y envíalo en segundos.
        </p>

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
            <button className="btn btn-google" onClick={signInWithGoogle}>
              <GoogleIcon />
              Entrar con Google
            </button>
            <p className="cta-note">Gratis · Sin contraseñas · Sin spam 🔒</p>
          </>
        )}

        <div className="chat">
          <p className="chat-label">Así se ve tu mensaje 👇</p>
          <div className="bubble">
            Hola. Los pasajes de mi calle están cerrados; entra por la calle de atrás, hay un
            portón abierto junto al número 12. ¡Gracias! 🙌
            <span className="bubble-meta">9:41 ✓✓</span>
          </div>
        </div>
      </section>

      <p className="section-eyebrow">Por qué te va a gustar</p>
      <div className="features-grid">
        {FEATURES.map((f) => (
          <div
            className="feature-card"
            key={f.title}
            style={{ borderColor: `${f.accent}33`, boxShadow: `0 10px 32px ${f.accent}1f` }}
          >
            <div
              className="feature-badge"
              style={{ background: `${f.accent}26`, boxShadow: `0 0 18px ${f.accent}33` }}
            >
              {f.icon}
            </div>
            <p className="feature-title">{f.title}</p>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.25c-3.73 0-6.75 3.02-6.75 6.75 0 4.66 6.04 11.62 6.3 11.92a.6.6 0 0 0 .9 0c.26-.3 6.3-7.26 6.3-11.92 0-3.73-3.02-6.75-6.75-6.75Zm0 9.25a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
        fill="#ffffff"
      />
    </svg>
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
