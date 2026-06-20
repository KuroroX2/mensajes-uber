import { useEffect, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase'
import { AuthContext } from './authStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Si no hay credenciales, no hay nada que cargar.
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    if (!isConfigured) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signOut() {
    if (!isConfigured) return
    await supabase.auth.signOut()
  }

  const value = { user, loading, isConfigured, signInWithGoogle, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
