import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { getApiHealth, getGameSummary } from '../services/api'
import { isSupabaseConfigured } from '../services/supabase'

const GameContext = createContext(null)
const initial = { xp: 0, level: 1, coins: 0, streak: 0, hearts: 5, completed: 0 }

export function GameProvider({ children }) {
  const { user } = useAuth()
  const [statsState, setStatsState] = useState({ userId: null, stats: initial })
  const [apiStatus, setApiStatus] = useState('checking')
  const [syncState, setSyncState] = useState({ userId: null, error: '' })
  const stats = statsState.userId === user?.id ? statsState.stats : initial
  const syncError = syncState.userId === user?.id ? syncState.error : ''

  useEffect(() => {
    let active = true
    const checkHealth = async () => {
      try {
        await getApiHealth()
        if (active) setApiStatus('online')
      } catch {
        if (active) setApiStatus('offline')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30_000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return
    let active = true
    getGameSummary()
      .then(({ profile, streak, progress }) => {
        if (!active) return
        if (!profile) {
          setSyncState({ userId: user.id, error: 'Your player profile could not be found in Supabase.' })
          return
        }
        setSyncState({ userId: user.id, error: '' })
        setStatsState({ userId: user.id, stats: {
          ...initial,
          xp: profile.total_xp ?? initial.xp,
          level: profile.level ?? initial.level,
          coins: profile.coins ?? initial.coins,
          streak: streak?.current_streak ?? initial.streak,
          completed: progress?.filter(item => item.status === 'completed').length ?? initial.completed,
        } })
      })
      .catch(error => {
        if (!active) return
        console.error('Failed to sync game data with the backend:', error)
        setSyncState({ userId: user.id, error: error.message })
      })
    return () => { active = false }
  }, [user])

  const syncProfile = useCallback(profile => {
    if (!user?.id) return
    setStatsState(current => ({ userId: user.id, stats: {
      ...(current.userId === user.id ? current.stats : initial),
      xp: profile.total_xp,
      level: profile.level,
      coins: profile.coins,
    } }))
    setSyncState({ userId: user.id, error: '' })
  }, [user])
  const value = useMemo(() => ({ stats, apiStatus, syncError, syncProfile }), [stats, apiStatus, syncError, syncProfile])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
export function useGame() { return useContext(GameContext) }
