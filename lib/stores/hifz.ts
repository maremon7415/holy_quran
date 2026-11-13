'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { newCard, review, dateStr, DAY, type Card, type Grade } from '@/lib/hifz/srs'

export interface HifzPrefs {
  surah: number
  from: number
  to: number
  /** ayahs per chunk */
  chunk: number
  /** listen loops */
  loops: number
  hints: boolean
}

interface DayLog {
  reviewed: number
  learned: number
}

interface HifzStore {
  cards: Record<string, Card>
  log: Record<string, DayLog>
  prefs: HifzPrefs
  milestones: string[]
  setPrefs: (p: Partial<HifzPrefs>) => void
  /** Grade a set of ayahs from a session. `isNew` marks first-time learning. */
  grade: (keys: string[], grade: Grade) => void
  removeCard: (key: string) => void
  addMilestone: (id: string) => void
  reset: () => void
}

export const defaultHifzPrefs: HifzPrefs = { surah: 112, from: 1, to: 4, chunk: 2, loops: 3, hints: true }

export const useHifz = create<HifzStore>()(
  persist(
    (set, get) => ({
      cards: {},
      log: {},
      prefs: defaultHifzPrefs,
      milestones: [],
      setPrefs: (p) => set({ prefs: { ...get().prefs, ...p } }),
      grade: (keys, g) => {
        const now = Date.now()
        const today = dateStr(now)
        const cards = { ...get().cards }
        let learned = 0
        for (const k of keys) {
          const existing = cards[k]
          if (!existing) learned++
          cards[k] = review(existing ?? newCard(k, now), g, now)
        }
        const day = get().log[today] ?? { reviewed: 0, learned: 0 }
        set({
          cards,
          log: { ...get().log, [today]: { reviewed: day.reviewed + keys.length - learned, learned: day.learned + learned } },
        })
      },
      removeCard: (key) => {
        const cards = { ...get().cards }
        delete cards[key]
        set({ cards })
      },
      addMilestone: (id) => set({ milestones: get().milestones.includes(id) ? get().milestones : [...get().milestones, id] }),
      reset: () => set({ cards: {}, log: {}, milestones: [] }),
    }),
    { name: 'noor-hifz', version: 1 }
  )
)

/** Consecutive days (ending today or yesterday) with hifz activity. */
export function hifzStreak(log: Record<string, DayLog>): number {
  // Step by calendar day (setDate) rather than a fixed 24h so DST changes never skip or repeat a day.
  let streak = 0
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  if (!log[dateStr(d.getTime())]) d.setDate(d.getDate() - 1)
  while (log[dateStr(d.getTime())]) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}
