import { getSupabaseForToken, supabaseConfigured } from '../lib/supabase.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' })
  if (!supabaseConfigured) return res.status(503).json({ error: 'Supabase is not configured on the backend' })

  try {
    const client = getSupabaseForToken(token)
    const { data, error } = await client.auth.getUser(token)
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session' })
    req.user = data.user
    req.supabase = client
    next()
  } catch (error) {
    next(error)
  }
}
