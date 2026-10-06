import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { getMuted, getVolume, setMuted as saveMuted, setVolume as saveVolume, unlockAudio } from '../../services/audio'

const links = [
  ['dashboard', '⌂', 'Home'], ['worlds', '◈', 'Worlds'], ['quest', '⚡', 'Quest'], ['mentor', '✦', 'AI Mentor'], ['leaderboard', '♛', 'Leaderboard'], ['profile', '◉', 'Profile']
]
const mobileLinks = [
  links[0], links[1], links[2], ['leaderboard', '♛', 'Rank'], links[5],
]

export default function AppShell({ children, showBackendStatus = true }) {
  const { user, logout } = useAuth(); const { stats, apiStatus, syncError } = useGame()
  const [logoutError, setLogoutError] = useState('')
  const [muted, setMuted] = useState(getMuted)
  const [volume, setVolume] = useState(getVolume)
  const name = user?.user_metadata?.username || user?.username || user?.email?.split('@')[0] || 'Noor'
  const toggleAudio = () => {
    const nextMuted = saveMuted(!muted)
    setMuted(nextMuted)
    if (!nextMuted) unlockAudio()
  }
  const changeVolume = event => setVolume(saveVolume(event.target.value))
  const handleLogout = async () => {
    setLogoutError('')
    try {
      await logout()
    } catch (error) {
      console.error('Failed to sign out:', error)
      setLogoutError(error.message || 'Could not sign out. Please try again.')
    }
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/dashboard" className="brand">NEXORA<span>◆</span></Link>
      <div className="side-profile"><div className="avatar">{name[0]?.toUpperCase()}</div><div><strong>{name}</strong><small>Level {stats.level}</small></div></div>
      <nav className="side-nav" aria-label="Main navigation">{links.map(([to, icon, label]) => <NavLink key={to} to={`/${to}`} className={({isActive}) => isActive ? 'active' : ''}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="side-bottom"><div className="mini-xp"><span>⚡ {stats.xp.toLocaleString()} XP</span><span>🔥 {stats.streak}</span></div>{logoutError&&<small role="alert">{logoutError}</small>}<button onClick={handleLogout}>↪ Sign out</button></div>
    </aside>
    <nav className="mobile-nav" aria-label="Main navigation">{mobileLinks.map(([to, icon, label]) => <NavLink key={to} to={`/${to}`} className={({isActive}) => isActive ? 'active' : ''}><span>{icon}</span><small>{label}</small></NavLink>)}</nav>
    <main className="shell-content">
      <div className="shell-toolbar">
        {showBackendStatus && <small role="status" title={syncError || undefined} className={`backend-status ${apiStatus}`}>● Backend {apiStatus}{syncError?' · data sync failed':''}</small>}
        <div className="audio-control">
          <button type="button" onClick={toggleAudio} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'} aria-pressed={!muted}>
            <span aria-hidden="true">{muted ? '×' : '♫'}</span>{muted ? 'Sound off' : 'Sound on'}
          </button>
          <label>
            <span className="visually-hidden">Sound volume</span>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={changeVolume} aria-label="Sound volume" />
          </label>
        </div>
      </div>
      {children}
    </main>
  </div>
}
