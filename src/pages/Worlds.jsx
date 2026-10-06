import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import WorldCard from '../components/game/WorldCard'
import { getWorlds } from '../services/supabase'
import { getGameSummary } from '../services/api'

export default function Worlds() {
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [progressError, setProgressError] = useState('')

  useEffect(() => {
    let active = true
    getWorlds().then(data => { if (active) setWorlds(data) })
      .catch(err => { if (active) setError(err.message || 'Could not load learning worlds.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    getGameSummary()
      .then(summary => { if (active) setProgress(summary.progress || []) })
      .catch(err => { if (active) setProgressError(err.message || 'Saved progress is unavailable.') })
    return () => { active = false }
  }, [])

  return <AppShell><header className="page-header worlds-page-header"><div><span className="eyebrow">CHOOSE YOUR WORLD</span><h1>Where will you explore?</h1><p>Choose a skill world and continue along its learning path.</p></div></header>
    {progressError && <p role="status">Progress could not be loaded, so world completion indicators are unavailable.</p>}
    {loading ? <p role="status">Loading worlds…</p> : error ? <p role="alert">{error}</p> : worlds.length ? <div className="worlds-large">{worlds.map(world => <WorldCard key={world.id} world={world} progress={progress === null ? undefined : progress.filter(item => item.world_id === world.id)}/>)}</div> : <p>No active worlds are available yet.</p>}
  </AppShell>
}
