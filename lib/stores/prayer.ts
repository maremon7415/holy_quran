'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PrayerPrefs {
  madhab: 'shafi' | 'hanafi'
  setMadhab: (m: 'shafi' | 'hanafi') => void
  /** IANA timezone of the chosen location (null = device) */
  tz: string | null
  setTz: (tz: string | null) => void
}

export const usePrayerPrefs = create<PrayerPrefs>()(
  persist((set) => ({ madhab: 'hanafi', setMadhab: (madhab) => set({ madhab }), tz: null, setTz: (tz) => set({ tz }) }), { name: 'noor-prayer-prefs' }),
)
