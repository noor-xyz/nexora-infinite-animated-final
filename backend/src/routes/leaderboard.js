import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await req.supabase.rpc('get_leaderboard', { limit_count: 50 })
    if (error) throw error
    res.json({ leaderboard: data || [] })
  } catch (e) { next(e) }
})
export default router
