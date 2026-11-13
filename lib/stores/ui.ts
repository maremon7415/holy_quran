'use client'
import { create } from 'zustand'

interface UiStore {
  paletteOpen: boolean
  setPaletteOpen: (o: boolean) => void
  moreOpen: boolean
  setMoreOpen: (o: boolean) => void
  /** Reader focus/immersive mode hides the app chrome */
  immersive: boolean
  setImmersive: (o: boolean) => void
}

export const useUi = create<UiStore>((set) => ({
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  moreOpen: false,
  setMoreOpen: (moreOpen) => set({ moreOpen }),
  immersive: false,
  setImmersive: (immersive) => set({ immersive }),
}))
