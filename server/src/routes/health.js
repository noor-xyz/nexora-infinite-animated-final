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
    return res.json({ ...base, databaseConnected: false, databaseMessage: 'Supabase is not configured.' })
  }

  try {
    const client = getSupabaseForToken(null)
    const { error } = await client.from('worlds').select('id').limit(1)
    if (error) throw error
    return res.json({ ...base, databaseConnected: true, databaseMessage: 'Supabase database is reachable.' })
  } catch {
    return res.json({ ...base, databaseConnected: false, databaseMessage: 'Supabase database is unreachable.' })
  }
})

export default router
