import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.SUPABASE_URL
const rawKey = process.env.SUPABASE_PUBLISHABLE_KEY

const hasPlaceholder = value => !value || /YOUR[_-]|PLACEHOLDER|REPLACE/i.test(value)

const normalizeUrl = value => {
  if (!value || hasPlaceholder(value)) return null
  try {
    const parsed = new URL(value)
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.origin : null
  } catch {
    return null
  }
}

const url = normalizeUrl(rawUrl)
const key = !hasPlaceholder(rawKey) ? rawKey.trim() : null

export const supabaseConfigured = Boolean(url && key)

export function getSupabaseForToken(accessToken) {
  if (!supabaseConfigured) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  })
}

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey || hasPlaceholder(serviceKey)) return null
  return createClient(url, serviceKey.trim(), { auth: { persistSession: false, autoRefreshToken: false } })
}
