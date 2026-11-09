'use client'
/**
 * Global audio player state — CONTRACT shared by the reader and the player UI.
 * The player feature (components/player/*) owns the <audio> element and implements
 * playback; everything else only calls these actions / reads this state.
 */
import { create } from 'zustand'

export interface PlayerQueue {
  surah: number
  /** first & last ayah to play (inclusive) */
  from: number
  to: number
}

export interface PlayerState {
  queue: PlayerQueue | null
  /** currently playing ayah key, e.g. "2:255" */
  currentKey: string | null
  /** 1-based word position currently being recited inside currentKey (null if unknown) */
  currentWord: number | null
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error'
  /** expanded full-screen player */
  expanded: boolean

  /** Play a whole surah (optionally starting at an ayah) */
  playSurah: (surah: number, fromAyah?: number) => void
  /** Play a single ayah or a range within one surah */
  playRange: (surah: number, from: number, to?: number) => void
  toggle: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  prev: () => void
  setExpanded: (e: boolean) => void

  /** internal — used by the player engine only */
  _set: (p: Partial<Omit<PlayerState, '_set'>>) => void
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: null,
  currentKey: null,
  currentWord: null,
  status: 'idle',
  expanded: false,
  playSurah: (surah, fromAyah = 1) => set({ queue: { surah, from: fromAyah, to: Number.MAX_SAFE_INTEGER }, currentKey: `${surah}:${fromAyah}`, currentWord: null, status: 'loading' }),
  playRange: (surah, from, to = from) => set({ queue: { surah, from, to }, currentKey: `${surah}:${from}`, currentWord: null, status: 'loading' }),
  toggle: () => { const s = get().status; set({ status: s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s }) },
  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'playing' }),
  stop: () => set({ queue: null, currentKey: null, currentWord: null, status: 'idle', expanded: false }),
  next: () => {},
  prev: () => {},
  setExpanded: (expanded) => set({ expanded }),
  _set: (p) => set(p),
}))

/** Selector helper: is this ayah the one being recited? */
export const useIsCurrentAyah = (key: string) => usePlayer((s) => s.currentKey === key && s.status !== 'idle')
/** Selector helper: current word position if this ayah is being recited, else null */
export const useCurrentWord = (key: string) => usePlayer((s) => (s.currentKey === key ? s.currentWord : null))
