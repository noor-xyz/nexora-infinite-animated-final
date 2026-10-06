const MUTED_KEY = 'nexora-audio-muted'
const VOLUME_KEY = 'nexora-audio-volume'
const DEFAULT_VOLUME = 0.35

let muted = false
let volume = DEFAULT_VOLUME
let audioContext

function readPreference(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value === null ? fallback : value
  } catch {
    return fallback
  }
}

export function getMuted() {
  muted = readPreference(MUTED_KEY, String(muted)) === 'true'
  return muted
}

export function setMuted(value) {
  muted = Boolean(value)
  try {
    window.localStorage.setItem(MUTED_KEY, String(muted))
  } catch {
    // Audio still works when browser storage is unavailable.
  }
  return muted
}

export function getVolume() {
  const saved = Number(readPreference(VOLUME_KEY, String(volume)))
  if (Number.isFinite(saved)) volume = Math.max(0, Math.min(1, saved))
  return volume
}

export function setVolume(value) {
  volume = Math.max(0, Math.min(1, Number(value) || 0))
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    // Audio still works when browser storage is unavailable.
  }
  return volume
}

function getAudioContext() {
  if (audioContext) return audioContext
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return null
  audioContext = new AudioContextConstructor()
  return audioContext
}

export function unlockAudio() {
  if (getMuted()) return
  try {
    const context = getAudioContext()
    if (context?.state === 'suspended') context.resume().catch(() => {})
  } catch {
    // Unsupported or blocked audio must not affect gameplay.
  }
}

function playSequence(notes) {
  if (getMuted() || getVolume() === 0) return
  try {
    const context = getAudioContext()
    if (!context || context.state !== 'running') return

    const start = context.currentTime
    for (const note of notes) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const noteStart = start + note.offset
      const noteEnd = noteStart + note.duration
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, noteStart)
      gain.gain.setValueAtTime(0, noteStart)
      gain.gain.linearRampToValueAtTime(getVolume() * 0.12, noteStart + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(noteStart)
      oscillator.stop(noteEnd + 0.01)
    }
  } catch {
    // Audio failures are intentionally isolated from the learning flow.
  }
}

export function playAnswerSound(correct) {
  playSequence(correct
    ? [{ frequency: 660, offset: 0, duration: 0.13 }, { frequency: 880, offset: 0.1, duration: 0.2 }]
    : [{ frequency: 294, offset: 0, duration: 0.13 }, { frequency: 220, offset: 0.1, duration: 0.18 }])
}

export function playCompletionSound() {
  playSequence([
    { frequency: 523, offset: 0, duration: 0.17 },
    { frequency: 659, offset: 0.12, duration: 0.2 },
    { frequency: 784, offset: 0.27, duration: 0.23 },
    { frequency: 1047, offset: 0.44, duration: 0.38 },
  ])
}
