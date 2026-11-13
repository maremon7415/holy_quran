/**
 * Date maths for the Islamic-events pages (pure, client + server safe).
 *
 * "Saudi" dates come from the Umm al-Qura calendar via Intl ('islamic-umalqura', see lib/places/hijri.ts).
 * "Bangladesh" dates are an EXPECTATION, not an announcement: countries that start months from local crescent
 * sighting (Bangladesh, India, Pakistan) are usually one day behind Saudi Arabia, so the expected date is Saudi + 1 day.
 */
import { addDays, cmpYmd, type Ymd } from '@/lib/places/dates'
import { gregorianOf } from '@/lib/places/hijri'

export const EVENT_SLUGS = ['ramadan-start', 'laylatul-qadr', 'eid-al-fitr', 'day-of-arafah', 'eid-al-adha', 'islamic-new-year', 'ashura', 'white-days'] as const
export type EventSlug = (typeof EVENT_SLUGS)[number]
export const isEventSlug = (s: string): s is EventSlug => (EVENT_SLUGS as readonly string[]).includes(s)

/** Bangladesh / South Asia is usually this many days after Saudi Arabia (moon sighting). */
export const BD_OFFSET_DAYS = 1

export interface EventRule {
  slug: EventSlug
  /** 'day' = one calendar day; 'night' = the night that begins at sunset of the listed date; 'monthly' = every Hijri month */
  kind: 'day' | 'night' | 'monthly'
  /** Hijri month of the headline day (monthly: unused) */
  month: number
  /** Hijri day of the headline day */
  day: number
  /** All Hijri days that belong to the event (ashura 9 & 10, white days 13–15, Laylatul Qadr: the odd nights) */
  days: number[]
  /** Hijri months skipped for monthly events (see content: Ramadan is already fasted; 13 Dhu al-Hijjah is a day of Tashreeq) */
  skipMonths?: number[]
}

export const RULES: Record<EventSlug, EventRule> = {
  'ramadan-start': { slug: 'ramadan-start', kind: 'day', month: 9, day: 1, days: [1] },
  // the 27th night begins at sunset on the evening of 26 Ramadan; the other odd nights likewise one day earlier
  'laylatul-qadr': { slug: 'laylatul-qadr', kind: 'night', month: 9, day: 27, days: [21, 23, 25, 27, 29] },
  'eid-al-fitr': { slug: 'eid-al-fitr', kind: 'day', month: 10, day: 1, days: [1] },
  'day-of-arafah': { slug: 'day-of-arafah', kind: 'day', month: 12, day: 9, days: [9] },
  'eid-al-adha': { slug: 'eid-al-adha', kind: 'day', month: 12, day: 10, days: [10] },
  'islamic-new-year': { slug: 'islamic-new-year', kind: 'day', month: 1, day: 1, days: [1] },
  ashura: { slug: 'ashura', kind: 'day', month: 1, day: 10, days: [9, 10] },
  'white-days': { slug: 'white-days', kind: 'monthly', month: 0, day: 13, days: [13, 14, 15], skipMonths: [9, 12] },
}

export interface EventDay {
  /** Hijri day-of-month (for night events: the night number, e.g. 27 = "27th night") */
  hijriDay: number
  /** Gregorian date by Umm al-Qura. For night events: the evening on which that night begins. */
  saudi: Ymd
  /** Expected Gregorian date in Bangladesh / South Asia (Saudi + 1 day) */
  bangladesh: Ymd
}

export interface EventOccurrence {
  slug: EventSlug
  hijriYear: number
  hijriMonth: number
  /** The headline day (e.g. 10 Dhu al-Hijjah; 27th night; 13th of the month) */
  primary: EventDay
  /** Every day of the event in order (primary included) */
  days: EventDay[]
  /** Saudi range (first → last day) */
  start: Ymd
  end: Ymd
  /** Bangladesh range (expected) */
  bdStart: Ymd
  bdEnd: Ymd
}

/** Bangladesh (expected) date for a Saudi date — usually one day later because of local moon sighting. */
export const bangladeshExpected = (saudi: Ymd): Ymd => addDays(saudi, BD_OFFSET_DAYS)

const dateOf = (rule: EventRule, hy: number, hm: number, hd: number): Ymd | null => {
  // a "night" begins at sunset of the previous Gregorian day
  const g = gregorianOf(hy, hm, rule.kind === 'night' ? hd - 1 : hd)
  return g
}

function build(rule: EventRule, hy: number, hm: number): EventOccurrence | null {
  const days: EventDay[] = []
  for (const hd of rule.days) {
    const saudi = dateOf(rule, hy, hm, hd)
    if (!saudi) return null
    days.push({ hijriDay: hd, saudi, bangladesh: bangladeshExpected(saudi) })
  }
  const primary = days.find((d) => d.hijriDay === rule.day)!
  return { slug: rule.slug, hijriYear: hy, hijriMonth: hm, primary, days, start: days[0].saudi, end: days[days.length - 1].saudi, bdStart: days[0].bangladesh, bdEnd: days[days.length - 1].bangladesh }
}

/** The occurrence of a (non-monthly) event in Hijri year `hy`. */
export function occurrenceInHijriYear(slug: EventSlug, hy: number, hm?: number): EventOccurrence | null {
  const rule = RULES[slug]
  return build(rule, hy, rule.kind === 'monthly' ? hm! : rule.month)
}

const hijriGuess = (gy: number) => Math.round((gy - 621.5744) / 0.970229)

/**
 * All occurrences whose headline day falls in Gregorian year `gy` (Saudi dates). A lunar year is ~11 days shorter than a
 * solar one, so every Gregorian year has at least one occurrence and a few (e.g. Ramadan 2030) have two. Monthly events: 10–11 rows.
 */
export function occurrencesInYear(slug: EventSlug, gy: number): EventOccurrence[] {
  const rule = RULES[slug]
  const g = hijriGuess(gy)
  const out: EventOccurrence[] = []
  for (let hy = g - 1; hy <= g + 1; hy++) {
    const months = rule.kind === 'monthly' ? Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => !rule.skipMonths?.includes(m)) : [rule.month]
    for (const hm of months) {
      const o = build(rule, hy, hm)
      if (o && o.primary.saudi.y === gy) out.push(o)
    }
  }
  return out.sort((a, b) => cmpYmd(a.primary.saudi, b.primary.saudi))
}

/** First occurrence of `slug` that has not fully passed on `from` (judged by the Bangladesh range, which ends later). */
export function nextOccurrence(slug: EventSlug, from: Ymd): EventOccurrence {
  for (let y = from.y; y <= from.y + 2; y++) {
    for (const o of occurrencesInYear(slug, y)) if (cmpYmd(o.bdEnd, from) >= 0) return o
  }
  throw new Error(`no upcoming ${slug}`)
}

/** The next `n` occurrences that have not fully passed on `from` (default 5: “the next 5 years”; the monthly white days use 6). */
export function futureOccurrences(slug: EventSlug, from: Ymd, n = slug === 'white-days' ? 6 : 5): EventOccurrence[] {
  const out: EventOccurrence[] = []
  for (let y = from.y; out.length < n && y <= from.y + 8; y++) for (const o of occurrencesInYear(slug, y)) if (cmpYmd(o.bdEnd, from) >= 0 && out.length < n) out.push(o)
  return out
}

/** Occurrences from today to `months` months ahead (white days: only the next one), sorted by Saudi date. */
export function upcomingTimeline(from: Ymd, months = 12): EventOccurrence[] {
  const limit = addDays(from, Math.round(months * 30.44))
  const out: EventOccurrence[] = []
  for (const slug of EVENT_SLUGS) {
    if (slug === 'white-days') { out.push(nextOccurrence(slug, from)); continue }
    for (const o of [...occurrencesInYear(slug, from.y), ...occurrencesInYear(slug, from.y + 1)]) {
      if (cmpYmd(o.bdEnd, from) >= 0 && cmpYmd(o.start, limit) <= 0) out.push(o)
    }
  }
  return out.sort((a, b) => cmpYmd(a.start, b.start))
}

/** Event year pages exist for the current Gregorian year −1 … +4; everything else is a 404. */
export const YEARS_BACK = 1
export const YEARS_AHEAD = 4
export const validEventYear = (y: number, currentYear: number) => Number.isInteger(y) && y >= currentYear - YEARS_BACK && y <= currentYear + YEARS_AHEAD
export const eventYears = (currentYear: number) => Array.from({ length: YEARS_BACK + YEARS_AHEAD + 1 }, (_, i) => currentYear - YEARS_BACK + i)

export const daysBetween = (a: Ymd, b: Ymd) => Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 864e5)

/** Absolute instant for a Gregorian date in a fixed-offset zone (Dhaka +06:00, Riyadh +03:00). `hour` = local hour (0 = start of the day, 18 = evening). */
export const ZONES = { saudi: { name: 'Asia/Riyadh', offset: '+03:00' }, bangladesh: { name: 'Asia/Dhaka', offset: '+06:00' } } as const
export function instantIso(d: Ymd, zone: keyof typeof ZONES, hour = 0) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.y}-${p(d.m)}-${p(d.d)}T${p(hour)}:00:00${ZONES[zone].offset}`
}
