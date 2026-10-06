import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { challengeAnswerSchema, masterySchema } from '../utils/validation.js'
const router = Router()
router.use(requireAuth)

router.get('/levels/:worldId/:levelNumber/challenges', async (req, res, next) => {
  try {
    const levelNumber = Number(req.params.levelNumber)
    if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10000) {
      return res.status(400).json({ error: 'Invalid level number' })
    }
    const level = await req.supabase.from('levels')
      .select('id,world_id,level_number,title,topic,xp_reward')
      .eq('world_id', req.params.worldId)
      .eq('level_number', levelNumber)
      .eq('is_active', true)
      .maybeSingle()
    if (level.error) throw level.error
    if (!level.data) return res.status(404).json({ error: 'Level not found' })

    const challenges = await req.supabase.from('challenges')
      .select('id,challenge_number,type,prompt,options,xp_reward')
      .eq('level_id', level.data.id)
      .order('challenge_number')
    if (challenges.error) throw challenges.error

    const rows = challenges.data || []
    const attempts = rows.length
      ? await req.supabase.from('user_challenge_attempts')
        .select('challenge_id,selected_answer,correct,explanation,xp_awarded')
        .eq('user_id', req.user.id)
        .in('challenge_id', rows.map(challenge => challenge.id))
      : { data: [], error: null }
    if (attempts.error) throw attempts.error

    const attemptsByChallenge = new Map((attempts.data || []).map(attempt => [attempt.challenge_id, attempt]))
    const progress = await req.supabase.from('user_progress')
      .select('status,completed_at')
      .eq('user_id', req.user.id)
      .eq('world_id', level.data.world_id)
      .eq('level_number', level.data.level_number)
      .maybeSingle()
    if (progress.error) throw progress.error

    res.json({
      level: level.data,
      progress: progress.data,
      challenges: rows.map(challenge => ({
        ...challenge,
        attempt: attemptsByChallenge.get(challenge.id) || null,
      })),
    })
  } catch (e) { next(e) }
})

router.post('/challenges/answer', async (req, res, next) => {
  try {
    const payload = challengeAnswerSchema.parse(req.body)
    const { data, error } = await req.supabase.rpc('submit_challenge_answer', {
      p_challenge_id: payload.challenge_id,
      p_answer: payload.answer,
    })
    if (error) throw error
    res.json(data)
  } catch (e) { next(e) }
})

router.get('/summary', async (req, res, next) => {
  try {
    const [profile, streak, progress, mastery, achievements] = await Promise.all([
      req.supabase.from('profiles').select('*').eq('id', req.user.id).maybeSingle(),
      req.supabase.from('streaks').select('*').eq('user_id', req.user.id).maybeSingle(),
      req.supabase.from('user_progress').select('*').eq('user_id', req.user.id),
      req.supabase.from('user_skill_mastery').select('*').eq('user_id', req.user.id),
      req.supabase.from('user_achievements').select('achievement_id,unlocked_at').eq('user_id', req.user.id),
    ])
    for (const result of [profile, streak, progress, mastery, achievements]) if (result.error) throw result.error
    res.json({ profile: profile.data, streak: streak.data, progress: progress.data || [], mastery: mastery.data || [], achievements: achievements.data || [] })
  } catch (e) { next(e) }
})

router.post('/mastery/attempt', async (req, res, next) => {
  try {
    const payload = masterySchema.parse(req.body)
    const existing = await req.supabase.from('user_skill_mastery').select('*').match({ user_id: req.user.id, world_id: payload.world_id, topic: payload.topic }).maybeSingle()
    if (existing.error) throw existing.error
    const row = existing.data || { user_id: req.user.id, world_id: payload.world_id, topic: payload.topic, mastery_score: 0, correct_count: 0, wrong_count: 0, attempts: 0, average_time_ms: 0 }
    const attempts = row.attempts + 1
    const correctCount = row.correct_count + (payload.correct ? 1 : 0)
    const wrongCount = row.wrong_count + (payload.correct ? 0 : 1)
    const masteryScore = Math.max(0, Math.min(100, Math.round((correctCount / attempts) * 100)))
    const avgTime = payload.time_ms == null ? row.average_time_ms : Math.round(((row.average_time_ms * row.attempts) + payload.time_ms) / attempts)
    const { data, error } = await req.supabase.from('user_skill_mastery').upsert({ ...row, correct_count: correctCount, wrong_count: wrongCount, attempts, mastery_score: masteryScore, average_time_ms: avgTime, updated_at: new Date().toISOString() }, { onConflict: 'user_id,world_id,topic' }).select().single()
    if (error) throw error
    res.json({ mastery: data })
  } catch (e) { next(e) }
})

export default router
