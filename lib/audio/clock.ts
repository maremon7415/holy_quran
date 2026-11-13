'use client'
import { create } from 'zustand'

/** Fast-changing playback position (updated ≤ ~12Hz by the engine, never by the reader). */
interface Clock {
  /** 0..1 over the whole surah */
  fraction: number
  /** 0..1 within the current ayah */
  ayahFraction: number
  /** seconds, chapter mode only */
  time: number
  duration: number
  /** fraction positions (0..1) of each ayah start — for seek-bar ticks */
  ticks: number[]
  mode: 'chapter' | 'ayah'
  buffering: boolean
  set: (p: Partial<Omit<Clock, 'set'>>) => void
}
export const useClock = create<Clock>((set) => ({
  fraction: 0, ayahFraction: 0, time: 0, duration: 0, ticks: [], mode: 'chapter', buffering: false,
  set: (p) => set(p),
}))
