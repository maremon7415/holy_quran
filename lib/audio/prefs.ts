'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Player-only preferences (reciter / speed / repeat live in useReader). */
interface PlayerPrefs {
  /** keep going into the next surah when a whole-surah queue ends */
  autoNext: boolean
  set: (p: Partial<Omit<PlayerPrefs, 'set'>>) => void
}
export const usePlayerPrefs = create<PlayerPrefs>()(
  persist((set) => ({ autoNext: true, set: (p) => set(p) }), { name: 'noor-player', version: 1 })
)
