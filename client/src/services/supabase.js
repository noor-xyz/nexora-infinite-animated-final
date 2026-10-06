import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const hasPlaceholderValue = value => !value || /YOUR[_-]|PLACEHOLDER|REPLACE/i.test(value)

const normalizeSupabaseUrl = value => {
  if (!value || hasPlaceholderValue(value)) return null
  try {
    const parsedUrl = new URL(value)
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) return null
    return parsedUrl.origin
  } catch {
    return null
  }
}

const url = normalizeSupabaseUrl(rawUrl)
const key = !hasPlaceholderValue(rawKey) ? rawKey.trim() : null

export const isSupabaseConfigured = Boolean(url && key)
export const supabase = isSupabaseConfigured ? createClient(url, key) : null

export async function getWorlds() {
  if (!supabase) throw new Error('Connect Supabase to load the learning worlds.')
  const { data: worlds, error } = await supabase.from('worlds').select('id,name,icon,description,color,sort_order').eq('is_active', true).order('sort_order')
  if (error) throw error
  return Promise.all((worlds || []).map(async world => {
    const [chapters, levels] = await Promise.all([
      supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('world_id', world.id),
      supabase.from('levels').select('id', { count: 'exact', head: true }).eq('world_id', world.id).eq('is_active', true),
    ])
    if (chapters.error) throw chapters.error
    if (levels.error) throw levels.error
    return { ...world, chapters: chapters.count || 0, lessons: levels.count || 0, mastery: 0 }
  }))
}

export async function getWorldPath(worldId) {
  if (!supabase) throw new Error('Connect Supabase to load this learning path.')
  const [worldResult, chaptersResult] = await Promise.all([
    supabase.from('worlds').select('id,name,icon,description,color').eq('id', worldId).eq('is_active', true).maybeSingle(),
    supabase.from('chapters').select('id,world_id,chapter_number,title,description').eq('world_id', worldId).order('chapter_number'),
  ])
  for (const result of [worldResult, chaptersResult]) if (result.error) throw result.error
  const levels = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from('levels')
      .select('id,world_id,level_number,chapter_id,title,topic,difficulty,xp_reward,challenge_count,is_active')
      .eq('world_id', worldId).eq('is_active', true).order('level_number').range(from, from + pageSize - 1)
    if (error) throw error
    levels.push(...(data || []))
    if (!data || data.length < pageSize) break
  }
  return { world: worldResult.data, chapters: chaptersResult.data || [], levels }
}

export async function getAchievementCatalog() {
  if (!supabase) throw new Error('Connect Supabase to load achievements.')
  const { data, error } = await supabase
    .from('achievements')
    .select('id,title,description,icon')
  if (error) throw error
  return data || []
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in client/.env, then restart Vite.')
  }
  return supabase
}

export async function signUp({ email, password, username }) {
  const { data, error } = await requireSupabase().auth.signUp({ email: email.trim(), password, options: { data: { username } } })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}
