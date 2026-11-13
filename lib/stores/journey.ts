'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dateStr } from '@/lib/hifz/srs'

export type KhatamKind = 'days' | 'date' | 'ramadan' | 'pages'

export interface Khatam {
  id: string
  kind: KhatamKind
  /** YYYY-MM-DD */
  start: string
  /** total days of the plan */
  days: number
  /** last mushaf page completed (0..604) */
  donePage: number
  /** pages-per-day recorded when kind = 'pages' */
  pagesPerDay?: number
  /** per-day completion log: date → page reached */
  log: Record<string, number>
  createdAt: string
  finishedAt: string | null
  archived?: boolean
}

interface JourneyStore {
  khatams: Khatam[]
  activeId: string | null
  create: (k: { kind: KhatamKind; days: number; pagesPerDay?: number; startPage?: number }) => void
  setDonePage: (id: string, page: number) => void
  extend: (id: string, days: number) => void
  archive: (id: string) => void
  remove: (id: string) => void
  setActive: (id: string) => void
}

export const useJourney = create<JourneyStore>()(
  persist(
    (set, get) => ({
      khatams: [],
      activeId: null,
      create: ({ kind, days, pagesPerDay, startPage = 0 }) => {
        const id = `k${Date.now().toString(36)}`
        const k: Khatam = {
          id, kind, days: Math.max(1, Math.round(days)), pagesPerDay, start: dateStr(), donePage: startPage,
          log: {}, createdAt: new Date().toISOString(), finishedAt: null,
        }
        // starting a new plan archives the previous unfinished one
        set({ khatams: [...get().khatams.map((x) => (x.id === get().activeId && !x.finishedAt ? { ...x, archived: true } : x)), k], activeId: id })
      },
      setDonePage: (id, page) =>
        set({
          khatams: get().khatams.map((k) => {
            if (k.id !== id) return k
            const p = Math.max(0, Math.min(604, Math.round(page)))
            return {
              ...k,
              donePage: p,
              log: { ...k.log, [dateStr()]: p },
              finishedAt: p >= 604 ? k.finishedAt ?? new Date().toISOString() : null,
            }
          }),
        }),
      extend: (id, days) => set({ khatams: get().khatams.map((k) => (k.id === id ? { ...k, days: k.days + days } : k)) }),
      archive: (id) => set({ khatams: get().khatams.map((k) => (k.id === id ? { ...k, archived: true } : k)), activeId: get().activeId === id ? null : get().activeId }),
      remove: (id) => set({ khatams: get().khatams.filter((k) => k.id !== id), activeId: get().activeId === id ? null : get().activeId }),
      setActive: (id) => set({ activeId: id }),
    }),
    { name: 'noor-journey', version: 1 }
  )
)
