'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DhikrState {
  presetId: string
  /** progress per preset: current step index + count inside the step */
  progress: Record<string, { step: number; count: number }>
  /** target override per preset (0 = unlimited) */
  targets: Record<string, number>
  setPreset: (id: string) => void
  setProgress: (id: string, p: { step: number; count: number }) => void
  setTarget: (id: string, n: number) => void
}

export const useDhikr = create<DhikrState>()(
  persist(
    (set) => ({
      presetId: 'fatima',
      progress: {},
      targets: {},
      setPreset: (presetId) => set({ presetId }),
      setProgress: (id, p) => set((s) => ({ progress: { ...s.progress, [id]: p } })),
      setTarget: (id, n) => set((s) => ({ targets: { ...s.targets, [id]: n } })),
    }),
    { name: 'noor-dhikr' },
  ),
)
