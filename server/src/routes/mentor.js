import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { mentorSchema } from '../utils/validation.js'
import { generateMentorReply } from '../services/mentor.js'
const router = Router()
router.use(requireAuth)
router.post('/', async (req, res, next) => {
  try {
    const payload = mentorSchema.parse(req.body)
    const result = await generateMentorReply(payload)
    res.json(result)
  } catch (e) {
    if (e.expose) return res.status(e.statusCode).json({ error: e.message })
    next(e)
  }
})
export default router
