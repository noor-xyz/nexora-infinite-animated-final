import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const { signup, authError } = useAuth()
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await signup(form)
      if (result.session) {
        navigate('/onboarding')
      } else {
        setConfirmationEmail(form.email)
      }
    } catch (signupError) {
      setError(signupError.message || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="auth-page"><div className="auth-card"><Link to="/" className="auth-logo">NEXORA</Link><p className="login-tagline">Learn. Play. Level Up.</p><h1>Create Account</h1><p className="login-description">Start your learning adventure today.</p>{(error || authError)&&<div className="error-note" role="alert">{error || authError}</div>}{confirmationEmail ? <div className="demo-note" role="status">Check your email at {confirmationEmail} to confirm your account, then <Link to="/login">log in</Link>.</div> : <form onSubmit={submit} className="login-form"><div className="input-group"><label htmlFor="signup-username">Username</label><input id="signup-username" autoComplete="username" required minLength="3" value={form.username} onChange={event=>setForm({...form,username:event.target.value})} placeholder="Choose a username" /></div><div className="input-group"><label htmlFor="signup-email">Email</label><input id="signup-email" autoComplete="email" required type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="you@example.com" /></div><div className="input-group"><label htmlFor="signup-password">Password</label><input id="signup-password" autoComplete="new-password" required minLength="6" type="password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="At least 6 characters" /></div><button disabled={busy} className="login-submit">{busy?'Creating…':'Create Account →'}</button></form>}<p className="signup-text">Already have an account? <Link to="/login">Login</Link></p><Link to="/" className="back-home">← Back</Link></div></div>
}
