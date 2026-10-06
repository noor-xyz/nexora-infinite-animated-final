import { Router } from 'express'
import { profileSchema } from '../utils/validation.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await req.supabase.from('profiles').select('*').eq('id', req.user.id).maybeSingle()
    if (error) throw error
    res.json({ profile: data })
  } catch (e) { next(e) }
})

router.put('/', async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body)
    const { data, error } = await req.supabase.from('profiles').upsert({ id: req.user.id, ...payload }, { onConflict: 'id' }).select().single()
    if (error) throw error
    res.json({ profile: data })
  } catch (e) { next(e) }
})
export default router
