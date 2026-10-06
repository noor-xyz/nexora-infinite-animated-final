import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { getLevelChallenges, submitChallengeAnswer } from '../services/api'
import { useGame } from '../context/GameContext'
import { playAnswerSound, playCompletionSound, unlockAudio } from '../services/audio'

export default function Quest() {
  const [searchParams] = useSearchParams()
  const worldId = searchParams.get('world')
  const levelNumber = Number(searchParams.get('level'))
  const hasLevel = Boolean(worldId) && Number.isInteger(levelNumber) && levelNumber > 0
  const { syncProfile } = useGame()
  const requestKey = `${worldId || ''}:${levelNumber}`
  const [gameData, setGameData] = useState({ key: null, level: null, challenges: [], answers: {}, error: '' })
  const [view, setView] = useState({ key: null, index: 0, done: false })
  const [submission, setSubmission] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)
  const completionSounds = useRef(new Set())

  useEffect(() => {
    if (!hasLevel) return
    let active = true
    getLevelChallenges(worldId, levelNumber)
      .then(result => {
        if (!active) return
        const challenges = result.challenges || []
        setGameData({
          key: requestKey,
          level: result.level,
          challenges,
          answers: Object.fromEntries(
          challenges
            .filter(challenge => challenge.attempt)
            .map(challenge => [challenge.id, challenge.attempt]),
          ),
          error: '',
        })
        setView({
          key: requestKey,
          index: Math.max(0, challenges.findIndex(challenge => !challenge.attempt)),
          done: result.progress?.status === 'completed',
        })
      })
      .catch(loadError => {
        if (active) setGameData({
          key: requestKey,
          level: null,
          challenges: [],
          answers: {},
          error: loadError.message || 'Could not load challenges for this level.',
        })
      })
    return () => { active = false }
  }, [hasLevel, worldId, levelNumber, requestKey])

  const loading = hasLevel && gameData.key !== requestKey
  const currentData = gameData.key === requestKey ? gameData : null
  const level = currentData?.level
  const challenges = currentData?.challenges || []
  const answers = currentData?.answers || {}
  const error = currentData?.error || ''
  const index = view.key === requestKey ? view.index : 0
  const done = view.key === requestKey && view.done
  const challenge = challenges[index]
  const answerResult = challenge ? answers[challenge.id] : null
  const submitting = Boolean(challenge && submission?.key === requestKey && submission.challengeId === challenge.id)
  const currentSubmissionError = challenge && submissionError?.key === requestKey && submissionError.challengeId === challenge.id
    ? submissionError.message
    : ''
  const upcoming = !loading && !error && Boolean(level) && challenges.length === 0
  const correctCount = Object.values(answers).filter(answer => answer.correct).length
  const xpEarned = Object.values(answers).reduce((total, answer) => total + (answer.xp_awarded || 0), 0)

  const answer = async selectedAnswer => {
    if (!challenge || answerResult || submitting) return
    unlockAudio()
    setSubmission({ key: requestKey, challengeId: challenge.id })
    setSubmissionError(null)
    try {
      const result = await submitChallengeAnswer({ challenge_id: challenge.id, answer: selectedAnswer })
      playAnswerSound(Boolean(result.correct))
      setGameData(current => current.key === requestKey
        ? { ...current, answers: { ...current.answers, [challenge.id]: result } }
        : current)
      if (result.profile) syncProfile(result.profile)
    } catch (submitError) {
      setSubmissionError({
        key: requestKey,
        challengeId: challenge.id,
        selectedAnswer,
        message: submitError.message || 'Could not confirm that your answer was saved.',
      })
    } finally {
      setSubmission(null)
    }
  }

  const next = () => {
    if (index === challenges.length - 1 && !completionSounds.current.has(requestKey)) {
      completionSounds.current.add(requestKey)
      unlockAudio()
      playCompletionSound()
    }
    setView({ key: requestKey, index: index === challenges.length - 1 ? index : index + 1, done: index === challenges.length - 1 })
  }

  return <AppShell>
    <header className="page-header compact quest-page-header">
      <div className="quest-heading">
        <span className="eyebrow">{upcoming ? '✦ LEVEL PREVIEW' : '⚡ ACTIVE LEVEL'} · {level?.world_id?.toUpperCase() || worldId?.toUpperCase() || 'LEARNING PATH'}</span>
        <h1>{level?.title || 'Level Challenges'}</h1>
        <p>{level?.topic ? `Target topic: ${level.topic}` : 'Answer challenges to earn XP and track level progress.'}</p>
      </div>
      {level && <div className="quest-level-reward"><span>LEVEL REWARD</span><strong>{level.xp_reward} XP</strong></div>}
    </header>

    {!hasLevel ? <div className="panel">
      <h2>Choose a level to begin</h2>
      <p>Challenges are loaded from the selected level in your learning map.</p>
      <Link to="/worlds" className="primary-btn">Open Learning Map →</Link>
    </div> : loading ? <p role="status">Loading level challenges…</p> : error && !challenges.length ? <p role="alert">{error}</p> : upcoming ? <section className="upcoming-card" aria-labelledby="upcoming-title">
      <div className="upcoming-glow" aria-hidden="true" />
      <div className="upcoming-content">
        <span className="upcoming-status"><span aria-hidden="true" /> UPCOMING UPDATE</span>
        <div className="upcoming-level">
          <span className="upcoming-level-number">{String(level.level_number).padStart(2, '0')}</span>
          <span className="eyebrow">NEXT FRONTIER · {level.world_id.toUpperCase()}</span>
        </div>
        <h2 id="upcoming-title">{level.title || level.topic || `Level ${level.level_number}`}</h2>
        {level.topic && level.topic !== level.title && <p className="upcoming-topic">{level.topic}</p>}
        <p className="upcoming-message">Level {level.level_number} is being prepared by the NEXORA learning system.</p>
        <p className="upcoming-description">More challenges, missions, and boss battles are coming soon. Your next adventure is on its way.</p>
        <Link to={`/worlds/${encodeURIComponent(worldId)}`} className="primary-btn">← Back to World</Link>
      </div>
      <div className="upcoming-emblem" aria-hidden="true"><span>✦</span><strong>NX</strong><small>IN PROGRESS</small></div>
    </section> : done ? <div className="victory-card">
      <div className="victory-icon">🏆</div>
      <span className="eyebrow">LEVEL COMPLETE</span>
      <h2>{level?.title || 'Level cleared.'}</h2>
      <p>You answered {correctCount} of {challenges.length} correctly and earned {xpEarned} XP.</p>
      <div>
        <Link to={`/worlds/${encodeURIComponent(worldId)}`} className="primary-btn">Return to Level Path</Link>
        <button onClick={() => setView({ key: requestKey, index: 0, done: false })} className="secondary-btn">Review Answers</button>
      </div>
    </div> : <div className="challenge-layout">
      <div className="challenge-main">
        <div className="challenge-progress quest-step-progress">
          <div><span className="eyebrow">QUEST PROGRESS</span><strong>Challenge {index + 1} <span>/ {challenges.length}</span></strong></div>
          <div className="progress-bar" role="progressbar" aria-label="Challenge progress" aria-valuemin="1" aria-valuemax={challenges.length} aria-valuenow={index + 1}><div className="progress-fill" style={{ width: `${((index + 1) / challenges.length) * 100}%` }} /></div>
        </div>
        <div key={challenge.id} className={`challenge-card ${answerResult ? answerResult.correct ? 'answered-correct' : 'answered-incorrect' : ''}`}>
          <span className="eyebrow">{challenge.type || 'CHALLENGE'} · REWARD {challenge.xp_reward} XP</span>
          <h2>{challenge.prompt}</h2>
          {!Array.isArray(challenge.options) || !challenge.options.length ? <p role="alert">This challenge has no answer choices configured.</p> : <div className="answers">
            {challenge.options.map((option, optionIndex) => {
              const label = typeof option === 'string' ? option : option?.label || option?.text || ''
              const selected = answerResult?.selected_answer === optionIndex
              const correct = answerResult?.correct && selected
              const wrong = answerResult && selected && !answerResult.correct
              return <button
                key={`${challenge.id}-${optionIndex}`}
                disabled={Boolean(answerResult) || submitting}
                onClick={() => answer(optionIndex)}
                className={correct ? 'correct' : wrong ? 'wrong' : ''}
              ><span>{String.fromCharCode(65 + optionIndex)}</span>{label}</button>
            })}
          </div>}
          {currentSubmissionError && <div className="answer-note" role="alert">
            <p>{currentSubmissionError} Your answer can be retried safely.</p>
            <button onClick={() => answer(submissionError.selectedAnswer)} className="secondary-btn">Retry Answer</button>
          </div>}
          {answerResult && <div className={answerResult.correct ? 'answer-note success' : 'answer-note'}>
            <strong>{answerResult.correct ? 'Correct!' : 'Not quite.'}</strong>
            <p>{answerResult.explanation || (answerResult.correct ? 'Your answer is correct.' : 'Review the challenge and keep going.')}</p>
            {answerResult.xp_awarded > 0 && <p className="xp-earned-feedback">+{answerResult.xp_awarded} XP saved to your profile.</p>}
            <button onClick={next} className="primary-btn">{index === challenges.length - 1 ? 'Finish Level' : 'Next Challenge →'}</button>
          </div>}
        </div>
      </div>
      <aside className="quest-side">
        <div><span className="eyebrow">LEVEL REWARD</span><strong>{level?.xp_reward ?? 0} XP</strong><small>Earn XP for correct answers</small></div>
        <div><span className="eyebrow">PROGRESS</span><strong>{Object.keys(answers).length} / {challenges.length}</strong><small>Answers saved to your account</small></div>
      </aside>
    </div>}
  </AppShell>
}
