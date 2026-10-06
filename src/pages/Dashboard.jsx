import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AIMentorCard from '../components/ai/AIMentorCard'
import AppShell from '../components/layout/AppShell'
import StatCard from '../components/common/StatCard'
import WorldCard from '../components/game/WorldCard'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { getWorldPath, getWorlds } from '../services/supabase'
import { getGameSummary } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const { stats, syncError } = useGame()
  const [worlds, setWorlds] = useState([])
  const [worldsError, setWorldsError] = useState('')
  const [worldsLoading, setWorldsLoading] = useState(true)
  const [progress, setProgress] = useState(null)
  const [continueQuest, setContinueQuest] = useState({ loading: true, error: '', progress: null, level: null })
  const [mastery, setMastery] = useState([])
  const [masteryError, setMasteryError] = useState('')
  const name = user?.user_metadata?.username || user?.username || user?.email?.split('@')[0] || 'Player'

  useEffect(() => {
    let active = true
    getWorlds()
      .then(data => { if (active) setWorlds(data) })
      .catch(error => { if (active) setWorldsError(error.message || 'Could not load worlds.') })
      .finally(() => { if (active) setWorldsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    getGameSummary()
      .then(async summary => {
        if (!active) return
        const savedProgress = summary.progress || []
        setProgress(savedProgress)
        setMastery(summary.mastery || [])
        setMasteryError('')
        const inProgress = savedProgress
          .filter(item => item.status === 'in_progress')
          .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0]
        if (!inProgress) {
          setContinueQuest({ loading: false, error: '', progress: null, level: null })
          return
        }
        try {
          const path = await getWorldPath(inProgress.world_id)
          if (!active) return
          const level = path.levels.find(item => item.level_number === inProgress.level_number)
          setContinueQuest({
            loading: false,
            error: level ? '' : 'Your current level is not available in this learning path.',
            progress: inProgress,
            level: level || null,
          })
        } catch (error) {
          if (active) setContinueQuest({
            loading: false,
            error: error.message || 'Could not load your current learning path.',
            progress: inProgress,
            level: null,
          })
        }
      })
      .catch(error => {
        if (active) {
          setMasteryError(error.message || 'Could not load saved skill mastery.')
          setContinueQuest({
            loading: false,
            error: error.message || 'Could not load your current quest.',
            progress: null,
            level: null,
          })
        }
      })
    return () => { active = false }
  }, [])

  const activeMastery = [...mastery].sort((a, b) => a.mastery_score - b.mastery_score).slice(0, 3)
  const currentWorld = worlds.find(world => world.id === continueQuest.progress?.world_id)

  return <AppShell showBackendStatus={false}>
    <header className="page-header dashboard-header">
      <div>
        <span className="eyebrow">NEXORA · PLAYER HOME</span>
        <h1>Welcome back, <span className="welcome-name">{name} 👋</span></h1>
        <p>Ready for your next quest?</p>
      </div>
      <div className="dashboard-actions">
        <Link to="/worlds" className="primary-btn">Explore Worlds →</Link>
      </div>
    </header>

    <section aria-label="Player progress" className="stats-grid">
      <StatCard icon="⚡" label="Total XP" value={syncError ? '—' : stats.xp.toLocaleString()} />
      <StatCard icon="🏅" label="Player Level" value={syncError ? '—' : stats.level} />
      <StatCard icon="🔥" label="Current Streak" value={syncError ? '—' : `${stats.streak} days`} />
      <StatCard icon="✓" label="Levels Cleared" value={syncError ? '—' : stats.completed} />
    </section>

    <section className="dashboard-feature-grid" aria-label="Your next quest and skill mastery">
      <div className="panel continue-quest-card">
        <span className="eyebrow">CONTINUE YOUR QUEST</span>
        {continueQuest.loading ? <p role="status">Finding your current level…</p>
          : continueQuest.error ? <><p role="alert">Your saved quest could not be loaded right now. You can still browse the available worlds.</p><Link to="/worlds" className="secondary-btn">Open Worlds →</Link></>
            : continueQuest.level && continueQuest.progress ? <>
              <div className="continue-world"><span className={`world-icon ${currentWorld?.color || ''}`}>{currentWorld?.icon || '◈'}</span><span>{currentWorld?.name || continueQuest.progress.world_id} · LEVEL {continueQuest.level.level_number}</span></div>
              <h2>{continueQuest.level.title}</h2>
              <p>{continueQuest.level.topic || 'Continue your current learning level.'}</p>
              <Link to={`/quest?world=${encodeURIComponent(continueQuest.progress.world_id)}&level=${continueQuest.level.level_number}`} className="primary-btn">Continue →</Link>
            </> : <>
              <h2>Choose your next path.</h2>
              <p>Your next quest will appear here as you make progress through a world.</p>
              <Link to="/worlds" className="primary-btn">Choose a World →</Link>
            </>}
      </div>
      <div className="dashboard-support">
        <AIMentorCard />
        <section className="panel mastery-panel" aria-labelledby="mastery-title">
          <div className="section-inline"><div><span className="eyebrow">SKILL SNAPSHOT</span><h2 id="mastery-title">Practice focus</h2></div><span className="mastery-spark" aria-hidden="true">✦</span></div>
          {masteryError ? <p role="status">Saved mastery is unavailable right now.</p>
            : activeMastery.length ? <div className="mastery-list">{activeMastery.map(item => <div className="mastery-item" key={`${item.world_id}-${item.topic}`}>
            <div><strong>{item.topic}</strong><span>{item.world_id}</span></div><strong>{item.mastery_score}%</strong>
          </div>)}</div> : <p>As you practice topics, your saved mastery snapshot will appear here.</p>}
        </section>
      </div>
    </section>

    <section className="dashboard-world-section" aria-labelledby="dashboard-worlds-title">
      <div className="section-inline">
        <div>
          <span className="eyebrow">YOUR LEARNING MAP</span>
          <h2 id="dashboard-worlds-title">Learning Worlds</h2>
        </div>
        <Link to="/worlds">All Worlds →</Link>
      </div>
      {worldsError ? <p role="alert">{worldsError}</p>
        : worldsLoading ? <p role="status">Loading your worlds…</p>
          : worlds.length ? <div className="world-grid dashboard-worlds">
            {worlds.slice(0, 4).map(world => <WorldCard key={world.id} world={world} progress={progress?.filter(item => item.world_id === world.id)} />)}
          </div>
            : <div className="panel"><p>No active learning worlds are available yet.</p></div>}
    </section>
  </AppShell>
}
