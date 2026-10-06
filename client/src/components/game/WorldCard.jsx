import { Link } from 'react-router-dom'
export default function WorldCard({ world, progress }) {
  const completedLevels = new Set(
    progress?.filter(item => item.status === 'completed').map(item => item.level_number),
  )
  const current = progress?.filter(item => item.status === 'in_progress')
    .sort((a, b) => a.level_number - b.level_number)[0]
  const hasProgress = Array.isArray(progress)
  const totalLevels = world.lessons || 0
  const completed = Math.min(totalLevels, completedLevels.size)
  const progressPercent = totalLevels ? Math.round((completed / totalLevels) * 100) : 0

  return <Link to={`/worlds/${world.id}`} className={`world-card world-selection-card world-theme-${world.color || 'default'}`} aria-label={`Enter ${world.name} world`}>
    <div className="world-card-glow" aria-hidden="true" />
    <div className="world-card-top"><div className={`world-icon ${world.color || ''}`} aria-hidden="true">{world.icon || '◈'}</div>{hasProgress && <span className={`world-state ${completed >= totalLevels && totalLevels ? 'complete' : current ? 'current' : ''}`}>{completed >= totalLevels && totalLevels ? 'CLEARED' : current ? `LEVEL ${current.level_number} · ACTIVE` : 'AVAILABLE'}</span>}</div>
    <div className="world-card-head"><h3>{world.name}</h3></div>
    <p className="world-card-description">{world.description}</p>
    {hasProgress && <div className="world-progress" aria-label={`${completed} of ${totalLevels} levels completed`}>
      <div className="world-progress-copy"><span>{completed} / {totalLevels} levels cleared</span><strong>{progressPercent}%</strong></div>
      <div className="progress-bar" role="progressbar" aria-label={`${world.name} levels cleared`} aria-valuemin="0" aria-valuemax={Math.max(1, totalLevels)} aria-valuenow={completed}><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
    </div>}
    <footer><span>{world.chapters} chapters</span><span>{totalLevels} levels</span><strong className="enter-world-action">{current ? 'Continue World' : 'Enter World'} <span aria-hidden="true">→</span></strong></footer>
  </Link>
}
