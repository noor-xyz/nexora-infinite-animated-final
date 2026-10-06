import { supabase } from './supabase'

const rawApiUrl = import.meta.env.VITE_API_URL
const API_URL = (rawApiUrl !== undefined && rawApiUrl !== '')
  ? rawApiUrl.replace(/\/+$/, '')
  : (import.meta.env.DEV ? '' : 'http://localhost:4000')

async function authHeaders() {
  if (!supabase) return { 'Content-Type': 'application/json' }
  const { data } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
  }
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(await authHeaders()), ...(options.headers || {}) }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = `${API_URL}${cleanPath}`
  const response = await fetch(url, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'NEXORA API request failed')
  return body
}

export function getApiHealth() {
  return apiRequest('/api/health')
}

export function askMentor(payload) {
  return apiRequest('/api/mentor', { method: 'POST', body: JSON.stringify(payload) })
}

export function getGameSummary() {
  return apiRequest('/api/game/summary')
}

export function saveProfile(payload) {
  return apiRequest('/api/profile', { method: 'PUT', body: JSON.stringify(payload) })
}

export function recordMasteryAttempt(payload) {
  return apiRequest('/api/game/mastery/attempt', { method: 'POST', body: JSON.stringify(payload) })
}

export function getLevelChallenges(worldId, levelNumber) {
  return apiRequest(`/api/game/levels/${encodeURIComponent(worldId)}/${levelNumber}/challenges`)
}

export function submitChallengeAnswer(payload) {
  return apiRequest('/api/game/challenges/answer', { method: 'POST', body: JSON.stringify(payload) })
}

export function getLeaderboard() {
  return apiRequest('/api/leaderboard')
}
