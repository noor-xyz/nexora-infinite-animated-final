import { Router } from 'express'
import { getSupabaseForToken, supabaseConfigured } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const base = {
    ok: true,
    service: 'nexora-backend',
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  }

  if (!supabaseConfigured) {
    return res.json({ ...base, databaseConnected: false, databaseMessage: 'Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to backend/.env' })
  }

  try {
    const client = getSupabaseForToken(null)
    const { error } = await client.from('worlds').select('id').limit(1)
    if (error) throw error
    return res.json({ ...base, databaseConnected: true, databaseMessage: 'Supabase database is reachable.' })
  } catch (error) {
    return res.status(503).json({ ...base, databaseConnected: false, databaseMessage: error.message })
  }
})

export default router
