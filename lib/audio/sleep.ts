'use client'
import { create } from 'zustand'

export type SleepMode = null | 'end' | 15 | 30 | 60
interface SleepState {
  mode: SleepMode
  /** epoch ms when a timed sleep ends */
  endsAt: number | null
  set: (m: SleepMode) => void
}
export const useSleep = create<SleepState>((set) => ({
  mode: null,
  endsAt: null,
  set: (mode) => set({ mode, endsAt: typeof mode === 'number' ? Date.now() + mode * 60_000 : null }),
}))
