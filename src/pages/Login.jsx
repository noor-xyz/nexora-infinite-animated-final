import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.from?.pathname || '/dashboard'

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form)
      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="auth-page"><div className="auth-card"><Link to="/" className="auth-logo">NEXORA</Link><p className="login-tagline">Learn. Play. Level Up.</p><h1>Welcome Back</h1><p className="login-description">Continue your learning adventure.</p>{(error || authError)&&<div className="error-note" role="alert">{error || authError}</div>}<form onSubmit={submit} className="login-form"><div className="input-group"><label htmlFor="login-email">Email</label><input id="login-email" autoComplete="email" required type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="you@example.com" /></div><div className="input-group"><label htmlFor="login-password">Password</label><input id="login-password" autoComplete="current-password" required minLength="6" type="password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="Your password" /></div><button disabled={busy} className="login-submit">{busy?'Entering…':'Login →'}</button></form><p className="signup-text">Don't have an account? <Link to="/signup">Create one</Link></p><Link to="/" className="back-home">← Back to NEXORA</Link></div></div>
}
