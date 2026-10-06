import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { getWorldPath } from '../services/supabase'
import { getGameSummary } from '../services/api'

export default function World() {
  const { id } = useParams()
  const [progressRefresh, setProgressRefresh] = useState(0)
  const [result, setResult] = useState({ id: null, path: { world: null, chapters: [], levels: [] }, error: '' })
  const [progressState, setProgressState] = useState({ id: null, refresh: -1, progress: [], error: '', loading: true })

  useEffect(() => {
    let active = true
    getWorldPath(id).then(data => { if (active) setResult({ id, path: data, error: '' }) })
      .catch(err => { if (active) setResult({ id, path: { world: null, chapters: [], levels: [] }, error: err.message || 'Could not load this learning path.' }) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    let active = true
    getGameSummary()
      .then(({ progress }) => {
        if (active) setProgressState({
          id,
          refresh: progressRefresh,
          progress: (progress || []).filter(item => item.world_id === id),
          error: '',
          loading: false,
        })
      })
      .catch(err => {
        if (active) setProgressState({
          id,
          refresh: progressRefresh,
          progress: [],
          error: err.message || 'Could not load saved level progress.',
          loading: false,
        })
      })
    return () => { active = false }
  }, [id, progressRefresh])

  const loading = result.id !== id
  const path = loading ? { world: null, chapters: [], levels: [] } : result.path
  const error = loading ? '' : result.error
  const progress = progressState.id === id
    ? {
      ...progressState,
      error: progressState.refresh === progressRefresh ? progressState.error : '',
      loading: progressState.refresh !== progressRefresh,
    }
    : { progress: [], error: '', loading: true }
  const progressByLevel = new Map(progress.progress.map(item => [item.level_number, item]))
  const byChapter = new Map(path.chapters.map(chapter => [chapter.id, { chapter, levels: [] }]))
  const unassigned = []
  path.levels.forEach(level => {
    const section = byChapter.get(level.chapter_id)
    if (section) section.levels.push(level)
    else unassigned.push(level)
  })
  const sections = [...byChapter.values()].filter(section => section.levels.length).concat(
    unassigned.length ? [{ chapter: null, levels: unassigned }] : [],
  )

  const world = path.world
  return <AppShell>
    <header className="page-header">
      <div className={`world-map-header world-theme-${world?.color || 'default'}`}><Link to="/worlds" className="back-link">← All Worlds</Link>
        {world && <div className="world-title"><div className={`world-icon ${world.color || ''}`}>{world.icon || '◈'}</div><div><span className="eyebrow">WORLD · LEARNING PATH</span><h1>{world.name}</h1><p>{world.description}</p></div></div>}
      </div>
      {world && <div className={`mastery-box world-theme-${world.color || 'default'}`}><strong>{path.levels.length}</strong><span>Levels in this path</span></div>}
    </header>
    {loading ? <p role="status">Loading chapters and levels…</p> : error ? <p role="alert">{error}</p> : !world ? <p>This world is unavailable.</p> : <>
      <div className={`infinite-banner world-path-banner world-theme-${world.color || 'default'}`}><div><span className="eyebrow">YOUR ADVENTURE MAP</span><h2>Choose your next step</h2><p>Follow the path, complete challenges, and keep building your skills. Every available level is open to explore.</p></div><div className="path-banner-icon" aria-hidden="true">{world.icon || '◈'}</div></div>
      {progress.error && <p role="alert">Saved progress could not be loaded. <button className="progress-retry" onClick={() => setProgressRefresh(value => value + 1)}>Retry</button></p>}
      {progress.loading && <p role="status">Loading saved progress…</p>}
      {!path.levels.length ? <p>No active levels are available in this world yet.</p> : sections.map(({ chapter, levels }) => <section className={`path-chapter world-theme-${world.color || 'default'}`} key={chapter?.id || 'unassigned'}>
        <div className="chapter-card"><div><span className="eyebrow">{chapter ? `CHAPTER ${String(chapter.chapter_number).padStart(2, '0')}` : 'LEARNING PATH'}</span><h2>{chapter?.title || 'Levels'}</h2>{chapter?.description && <p>{chapter.description}</p>}</div><span className="chapter-badge">{levels.length} {levels.length === 1 ? 'level' : 'levels'}</span></div>
        <div className={`level-list world-theme-${world.color || 'default'}`}>{levels.map((level, levelIndex) => {
          const status = progress.loading || progress.error ? null : progressByLevel.get(level.level_number)?.status
          const statusLabel = progress.loading ? 'Loading progress' : progress.error ? 'Progress unavailable' : status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started'
          const upcoming = Number(level.challenge_count) === 0
          const statusClass = status === 'completed' ? 'complete' : status === 'in_progress' ? 'in-progress' : 'not-started'
          const statusIcon = status === 'completed' ? '✓' : status === 'in_progress' ? '⚡' : '→'
          return <Link className={`level-row level-node ${statusClass} ${upcoming ? 'upcoming' : ''}`} key={level.id} style={{ '--node-index': levelIndex }} to={`/quest?world=${encodeURIComponent(id)}&level=${level.level_number}`} aria-label={`Level ${level.level_number}: ${level.title}. ${upcoming ? 'Upcoming update, preview available.' : statusLabel}. Open level.`}>
          <span className="level-number" aria-hidden="true">{status === 'completed' ? '✓' : String(level.level_number).padStart(2, '0')}</span>
          <span className="level-info"><strong>{level.title}</strong><span className="level-topic">{level.topic || 'Core skills'}</span><span className="level-metadata"><span>{level.xp_reward} XP</span><span className={`difficulty ${(level.difficulty || 'beginner').toLowerCase()}`}>{level.difficulty || 'Beginner'}</span></span></span>
          <span className={`level-node-status ${upcoming ? 'upcoming-status' : statusClass}`}><span className="level-state" aria-hidden="true">{upcoming ? '✦' : statusIcon}</span><span>{upcoming ? 'UPCOMING UPDATE' : statusLabel}</span></span>
        </Link>})}</div>
      </section>)}
    </>}
  </AppShell>
}
