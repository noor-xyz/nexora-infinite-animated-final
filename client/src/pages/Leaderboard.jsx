import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { getLeaderboard } from '../services/api'
import { isSupabaseConfigured } from '../services/supabase'

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return
    let active = true
    getLeaderboard()
      .then(({ leaderboard: entries }) => {
        const username = user.user_metadata?.username || user.username || user.email?.split('@')[0]
        if (active) setLeaderboard(entries.map((entry, index) => ({
          rank: index + 1,
          name: entry.username || 'Player',
          xp: entry.total_xp,
          level: entry.level,
          me: Boolean(username) && entry.username === username,
        })))
      })
      .catch(requestError => {
        if (!active) return
        console.error('Failed to load the leaderboard:', requestError)
        setError(requestError.message)
      })
    return () => { active = false }
  }, [user])

  const entries = leaderboard || []
  const podium = [entries[1], entries[0], entries[2]].filter(Boolean)
  const loading = isSupabaseConfigured && Boolean(user?.id) && leaderboard === null && !error
  return <AppShell>
    <header className="page-header">
      <div><span className="eyebrow">NEXORA RANKINGS</span><h1>Climb the ranks.</h1><p>See how your real saved XP compares with other players.</p></div>
    </header>
    {error && <p className="error-note" role="alert">Couldn’t load the leaderboard: {error}</p>}
    {!isSupabaseConfigured && <p role="status">Player rankings are unavailable until the connected leaderboard service is configured.</p>}
    {loading ? <p role="status">Loading player rankings…</p>
      : error || !isSupabaseConfigured ? null
        : !entries.length ? <div className="panel leaderboard-empty"><h2>No rankings yet</h2><p>Player rankings will appear when there are saved leaderboard entries.</p></div>
          : <>
            <section className="leaderboard-podium" aria-label="Top three players">
              {podium.map(player => <article className={`podium-player podium-${player.rank} ${player.me ? 'me' : ''}`} key={player.rank}>
                <span className="podium-rank">{player.rank === 1 ? '♛' : `#${player.rank}`}</span>
                <div className="avatar">{player.name[0]?.toUpperCase() || '?'}</div>
                <strong>{player.name}</strong><span>Level {player.level}</span>
                <b>{Number(player.xp).toLocaleString()} XP</b>
                {player.me && <small>YOU</small>}
              </article>)}
            </section>
            <div className="leaderboard-card" aria-label="Player rankings">
              {entries.map(player => <div className={`leader-row ${player.me ? 'me' : ''} ${player.rank <= 3 ? 'top-ranked' : ''}`} key={player.rank}>
                <span className={`rank rank-${player.rank}`}>{player.rank}</span>
                <div className="avatar">{player.name[0]?.toUpperCase() || '?'}</div>
                <div className="leader-name"><strong>{player.name}</strong><small>Level {player.level}{player.me ? ' · You' : ''}</small></div>
                <strong className="leader-xp">{Number(player.xp).toLocaleString()} XP</strong>
              </div>)}
            </div>
          </>}
  </AppShell>
}
