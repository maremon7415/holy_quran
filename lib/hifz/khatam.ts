import { TOTAL_PAGES } from './pages'
import type { Khatam } from '@/lib/stores/journey'

const DAY = 86_400_000
const parse = (s: string) => new Date(`${s}T00:00:00`).getTime()

/** Cumulative last page that should be read by the end of plan day `d` (0-based). */
export const targetEnd = (d: number, days: number) =>
  d < 0 ? 0 : Math.min(TOTAL_PAGES, Math.round(((d + 1) * TOTAL_PAGES) / days))

/** Days needed to finish in a given number of days from a date string, inclusive. */
export const daysUntil = (dateISO: string, today = Date.now()) =>
  Math.max(1, Math.round((parse(dateISO) - parse(new Date(today).toLocaleDateString('en-CA'))) / DAY) + 1)

export const daysForPagesPerDay = (ppd: number) => Math.max(1, Math.ceil(TOTAL_PAGES / Math.max(1, ppd)))

export interface KhatamStatus {
  /** 0-based plan day for today (may exceed days-1 when overdue) */
  dayIndex: number
  /** today's portion [from..to] pages, or null when done for today / finished */
  portion: { from: number; to: number } | null
  doneToday: boolean
  behindPages: number
  aheadPages: number
  remainingPages: number
  remainingDays: number
  /** pages per day needed from today to finish on schedule */
  neededPerDay: number
  overdue: boolean
  finished: boolean
  percent: number
}

export function khatamStatus(k: Khatam, today = Date.now()): KhatamStatus {
  const dayIndex = Math.max(0, Math.round((parse(new Date(today).toLocaleDateString('en-CA')) - parse(k.start)) / DAY))
  const remainingPages = TOTAL_PAGES - k.donePage
  const finished = remainingPages <= 0
  const overdue = !finished && dayIndex >= k.days
  const remainingDays = Math.max(1, k.days - dayIndex)
  const endToday = targetEnd(Math.min(dayIndex, k.days - 1), k.days)
  const endYesterday = dayIndex > 0 ? targetEnd(Math.min(dayIndex - 1, k.days - 1), k.days) : 0
  const behindPages = Math.max(0, endYesterday - k.donePage)
  const aheadPages = Math.max(0, k.donePage - endToday)
  const doneToday = finished || k.donePage >= endToday
  const to = overdue ? TOTAL_PAGES : endToday
  return {
    dayIndex,
    portion: doneToday ? null : { from: k.donePage + 1, to: Math.max(to, k.donePage + 1) },
    doneToday,
    behindPages,
    aheadPages,
    remainingPages,
    remainingDays,
    neededPerDay: Math.ceil(remainingPages / remainingDays),
    overdue,
    finished,
    percent: Math.round((k.donePage / TOTAL_PAGES) * 100),
  }
}

export type DayState = 'done' | 'today' | 'missed' | 'future'
export function dayState(k: Khatam, d: number, dayIndex: number): DayState {
  if (k.donePage >= targetEnd(d, k.days)) return 'done'
  if (d === dayIndex) return 'today'
  return d < dayIndex ? 'missed' : 'future'
}
