import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { getGameSummary } from '../services/api'
import { getAchievementCatalog } from '../services/supabase'

export default function Profile() {
  const { user } = useAuth()
  const { stats, syncError } = useGame()
  const [savedData, setSavedData] = useState({ loading: true, error: '', achievements: [], catalog: [], mastery: [] })
  const name = user?.user_metadata?.username || user?.username || user?.email?.split('@')[0] || 'Player'
  useEffect(() => {
    let active = true
    Promise.all([getGameSummary(), getAchievementCatalog()])
      .then(([summary, catalog]) => {
        if (active) setSavedData({
          loading: false,
          error: '',
          achievements: summary.achievements || [],
          catalog,
          mastery: summary.mastery || [],
        })
      })
      .catch(error => {
        if (active) setSavedData(current => ({
          ...current,
          loading: false,
          error: error.message || 'Could not load saved achievements and mastery.',
        }))
      })
    return () => { active = false }
  }, [])
  const unlockedIds = new Set(savedData.achievements.map(item => item.achievement_id))
  const unlockedCount = savedData.achievements.length
  const mastery = [...savedData.mastery].sort((a, b) => b.mastery_score - a.mastery_score)

  return <AppShell>
    <header className="profile-hero player-profile-hero">
      <div className="avatar huge">{name[0]?.toUpperCase()}</div>
      <div>
        <span className="eyebrow">PLAYER PROFILE</span>
        <h1>{name}</h1>
        <p>Your NEXORA learning journey</p>
      </div>
      <div className="profile-level-badge"><span>PLAYER LEVEL</span><strong>{syncError ? '—' : stats.level}</strong></div>
    </header>
    <section className="profile-stats" aria-label="Player progress">
      <div><strong>{syncError ? '—' : stats.xp.toLocaleString()}</strong><span>Total XP</span></div>
      <div><strong>{syncError ? '—' : stats.completed}</strong><span>Levels cleared</span></div>
      <div><strong>{syncError ? '—' : stats.streak}</strong><span>Day streak</span></div>
    </section>
    <section className="profile-mastery" aria-labelledby="profile-mastery">
      <div className="section-inline">
        <div><span className="eyebrow">SKILLS IN PRACTICE</span><h2 id="profile-mastery">Mastery snapshot</h2></div>
        <span>{mastery.length} tracked {mastery.length === 1 ? 'topic' : 'topics'}</span>
      </div>
      {savedData.loading ? <p role="status">Loading saved mastery…</p>
        : savedData.error ? <p role="status">Saved mastery is unavailable right now.</p>
        : mastery.length ? <div className="profile-mastery-grid">{mastery.map(item => <article className="profile-mastery-card" key={`${item.world_id}-${item.topic}`}>
          <div><span>{item.world_id}</span><strong>{item.topic}</strong></div>
          <strong className="mastery-score">{item.mastery_score}%</strong>
          <div className="progress-bar" role="progressbar" aria-label={`${item.topic} mastery`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={item.mastery_score}><div className="progress-fill" style={{ width: `${item.mastery_score}%` }} /></div>
        </article>)}</div> : <p>Mastery details will appear after you practice a topic.</p>}
    </section>
    <section aria-labelledby="profile-achievements">
      <div className="section-inline">
        <div>
          <span className="eyebrow">SAVED REWARDS</span>
          <h2 id="profile-achievements">Achievements</h2>
        </div>
        {!savedData.loading && !savedData.error && <span>{unlockedCount} unlocked</span>}
      </div>
      {savedData.error ? <p role="alert">{savedData.error}</p>
        : savedData.loading ? <p role="status">Loading achievements…</p>
          : savedData.catalog.length ? <div className="achievement-grid">
            {savedData.catalog.map(achievement => {
              const unlocked = unlockedIds.has(achievement.id)
              return <article className={`achievement ${unlocked ? 'unlocked' : ''}`} key={achievement.id}>
                <span aria-hidden="true">{achievement.icon || '✦'}</span>
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
                <small>{unlocked ? 'Unlocked' : 'Locked'}</small>
              </article>
            })}
          </div> : <p>No achievements are available yet.</p>}
    </section>
  </AppShell>
}
