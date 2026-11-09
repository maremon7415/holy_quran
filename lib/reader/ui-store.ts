'use client'
import { create } from 'zustand'

/** Ephemeral reader UI state (not persisted). */
interface ReaderUi {
  tafsirKey: string | null
  openTafsir: (key: string | null) => void
  shareKey: string | null
  openShare: (key: string | null) => void
  /** mobile "more actions" sheet */
  menuKey: string | null
  openMenu: (key: string | null) => void
  settingsOpen: boolean
  setSettingsOpen: (o: boolean) => void
  /** ayahs where word-by-word was toggled individually */
  wbwKeys: Record<string, true>
  toggleWbw: (key: string) => void
  /** ayah currently at the top of the viewport */
  inView: { key: string; juz: number; page: number } | null
  setInView: (v: ReaderUi['inView']) => void
}

export const useReaderUi = create<ReaderUi>((set) => ({
  tafsirKey: null,
  openTafsir: (tafsirKey) => set({ tafsirKey }),
  shareKey: null,
  openShare: (shareKey) => set({ shareKey }),
  menuKey: null,
  openMenu: (menuKey) => set({ menuKey }),
  settingsOpen: false,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  wbwKeys: {},
  toggleWbw: (key) =>
    set((s) => {
      const next = { ...s.wbwKeys }
      if (next[key]) delete next[key]
      else next[key] = true
      return { wbwKeys: next }
    }),
  inView: null,
  setInView: (inView) => set({ inView }),
}))
