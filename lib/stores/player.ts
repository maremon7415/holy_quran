'use client'
/**
 * Global audio player state — CONTRACT shared by the reader and the player UI.
 * The player feature (components/player/*, lib/audio/*) owns the <audio> element and implements
 * playback; everything else only calls these actions / reads this state.
 */
import { create } from 'zustand'
import { chapters } from '@/lib/quran/chapters'
import { audioBridge } from '@/lib/audio/bridge'
import { useClock } from '@/lib/audio/clock'

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
  /** restart the queue from its first ayah when it ends (range / hifz loop) */
  loop: boolean
  /** bumped on every explicit seek request so the engine re-seeks even to the same key */
  seekNonce: number

  /** Play a whole surah (optionally starting at an ayah) */
  playSurah: (surah: number, fromAyah?: number) => void
  /** Play a single ayah or a range within one surah */
  playRange: (surah: number, from: number, to?: number) => void
  toggle: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  /** next / previous ayah */
  next: () => void
  prev: () => void
  /** jump to an ayah of the current surah */
  goToAyah: (ayah: number) => void
  /** seek over the whole surah, 0..1 */
  seekFraction: (f: number) => void
  /** change the played range of the current surah (keeps playing); to = MAX for "to the end" */
  setRange: (from: number, to: number) => void
  setLoop: (loop: boolean) => void
  setExpanded: (e: boolean) => void

  /** internal — used by the player engine only */
  _set: (p: Partial<Omit<PlayerState, '_set'>>) => void
}

const parse = (key: string) => {
  const [s, a] = key.split(':').map(Number)
  return { surah: s, ayah: a }
}
export const ayahCount = (surah: number) => chapters[surah - 1]?.versesCount ?? 1

export const usePlayer = create<PlayerState>((set, get) => {
  const go = (surah: number, ayah: number) => {
    const s = get()
    set({ currentKey: `${surah}:${ayah}`, currentWord: null, seekNonce: s.seekNonce + 1, status: s.status === 'paused' ? 'playing' : s.status })
  }
  return {
    queue: null,
    currentKey: null,
    currentWord: null,
    status: 'idle',
    expanded: false,
    loop: false,
    seekNonce: 0,
    playSurah: (surah, fromAyah = 1) =>
      set((s) => ({ queue: { surah, from: fromAyah, to: Number.MAX_SAFE_INTEGER }, currentKey: `${surah}:${fromAyah}`, currentWord: null, status: 'loading', seekNonce: s.seekNonce + 1 })),
    playRange: (surah, from, to = from) =>
      set((s) => ({ queue: { surah, from, to }, currentKey: `${surah}:${from}`, currentWord: null, status: 'loading', seekNonce: s.seekNonce + 1 })),
    toggle: () => {
      const s = get().status
      set({ status: s === 'playing' ? 'paused' : s === 'paused' || s === 'error' ? 'playing' : s })
    },
    pause: () => set({ status: 'paused' }),
    resume: () => set({ status: 'playing' }),
    stop: () => set({ queue: null, currentKey: null, currentWord: null, status: 'idle', expanded: false, loop: false }),
    next: () => {
      const { queue, currentKey } = get()
      if (!queue || !currentKey) return
      const { surah, ayah } = parse(currentKey)
      const last = Math.min(queue.to, ayahCount(surah))
      if (ayah < last) go(surah, ayah + 1)
      else if (get().loop) go(surah, queue.from)
      else if (queue.to >= ayahCount(surah) && surah < 114) get().playSurah(surah + 1, 1)
    },
    prev: () => {
      const { queue, currentKey } = get()
      if (!queue || !currentKey) return
      const { surah, ayah } = parse(currentKey)
      // within the first moments of an ayah → previous ayah, otherwise restart this one
      const restart = useClock.getState().ayahFraction > 0.12
      if (restart || ayah <= 1) return go(surah, ayah)
      if (ayah > queue.from) return go(surah, ayah - 1)
      // whole-surah queues may walk back before their start
      if (queue.to >= ayahCount(surah)) {
        set({ queue: { ...queue, from: ayah - 1 } })
        return go(surah, ayah - 1)
      }
      go(surah, ayah)
    },
    goToAyah: (ayah) => {
      const { queue } = get()
      if (!queue) return
      const n = Math.max(1, Math.min(ayah, ayahCount(queue.surah)))
      if (n < queue.from || n > queue.to) set({ queue: { surah: queue.surah, from: Math.min(queue.from, n), to: Math.max(queue.to, n) } })
      go(queue.surah, n)
    },
    seekFraction: (f) => audioBridge.seekFraction?.(Math.max(0, Math.min(1, f))),
    setRange: (from, to) => {
      const { queue, currentKey } = get()
      if (!queue) return
      const max = ayahCount(queue.surah)
      const a = Math.max(1, Math.min(from, max))
      const b = to >= max ? to : Math.max(a, to)
      const cur = currentKey ? parse(currentKey).ayah : a
      set({ queue: { surah: queue.surah, from: a, to: b } })
      if (cur < a || cur > Math.min(b, max)) go(queue.surah, a)
    },
    setLoop: (loop) => set({ loop }),
    setExpanded: (expanded) => set({ expanded }),
    _set: (p) => set(p),
  }
})

/** Selector helper: is this ayah the one being recited? */
export const useIsCurrentAyah = (key: string) => usePlayer((s) => s.currentKey === key && s.status !== 'idle')
/** Selector helper: current word position if this ayah is being recited, else null */
export const useCurrentWord = (key: string) => usePlayer((s) => (s.currentKey === key ? s.currentWord : null))
