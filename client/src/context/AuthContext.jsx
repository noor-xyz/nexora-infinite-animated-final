import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { signIn, signOut, signUp, supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!supabase) return
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setAuthError('')
    })
    let active = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        if (active) {
          setUser(data.session?.user || null)
          setAuthError('')
        }
      })
      .catch(error => {
        console.error('Failed to restore the Supabase session:', error)
        if (active) setAuthError(error.message || 'Could not restore your session.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    async login(credentials) {
      const result = await signIn(credentials)
      setUser(result.session?.user || null)
      return result
    },
    async signup(credentials) {
      const result = await signUp(credentials)
      setUser(result.session?.user || null)
      return result
    },
    async logout() {
      await signOut()
      setUser(null)
    },
  }), [user, loading, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
