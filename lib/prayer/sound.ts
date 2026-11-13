'use client'
/** Synthesised reminder sounds (WebAudio) — no audio files are shipped, so there is no licensing concern.
 *  `azan` is a gentle, slow ascending call-tone (NOT a recording of the adhan); `chime` is a soft two-note bell. */
import type { ReminderSound } from '@/lib/stores/prayer'

let ctx: AudioContext | null = null
const getCtx = () => {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  return ctx
}

function tone(c: AudioContext, freq: number, start: number, dur: number, gain = 0.18, type: OscillatorType = 'sine') {
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(g).connect(c.destination)
  o.start(start)
  o.stop(start + dur + 0.05)
  // soft overtone for a bell-like timbre
  const o2 = c.createOscillator()
  const g2 = c.createGain()
  o2.type = 'sine'
  o2.frequency.value = freq * 2.01
  g2.gain.setValueAtTime(0.0001, start)
  g2.gain.exponentialRampToValueAtTime(gain * 0.25, start + 0.03)
  g2.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.7)
  o2.connect(g2).connect(c.destination)
  o2.start(start)
  o2.stop(start + dur + 0.05)
}

/** Resolves true if it actually played (autoplay policy may block it until the user has interacted with the page). */
export async function playReminderSound(kind: ReminderSound): Promise<boolean> {
  if (kind === 'silent') return false
  const c = getCtx()
  if (!c) return false
  try {
    if (c.state === 'suspended') await c.resume()
    if (c.state !== 'running') return false
    const t = c.currentTime + 0.05
    if (kind === 'chime') {
      tone(c, 880, t, 1.6)
      tone(c, 1320, t + 0.35, 1.8, 0.14)
    } else {
      // slow phrase in a maqam-Hijaz-flavoured scale: D E♭ F♯ G A (Hz)
      const notes: [number, number, number][] = [[293.66, 0, 1.3], [311.13, 0.9, 1.1], [369.99, 1.7, 1.5], [440, 2.7, 1.6], [392, 3.9, 1.2], [369.99, 4.8, 1.2], [311.13, 5.6, 1.3], [293.66, 6.5, 2.4]]
      for (const [f, off, d] of notes) tone(c, f, t + off, d, 0.16, 'triangle')
    }
    return true
  } catch {
    return false
  }
}

/** Unlock audio on first user gesture so a later timer-driven sound is allowed to play. */
export function primeAudioOnGesture() {
  if (typeof window === 'undefined') return () => {}
  const h = () => { const c = getCtx(); if (c && c.state === 'suspended') void c.resume().catch(() => {}) }
  window.addEventListener('pointerdown', h, { once: true })
  window.addEventListener('keydown', h, { once: true })
  return () => { window.removeEventListener('pointerdown', h); window.removeEventListener('keydown', h) }
}
