import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  return <nav className="navbar">
    <Link to="/" className="logo">NEXORA</Link>
    <div className="nav-actions">
      {user ? <Link to="/dashboard" className="login-btn">Dashboard</Link> : <Link to="/login" className="login-btn">Login</Link>}
    </div>
  </nav>
}
