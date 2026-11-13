/** Formatting helpers for event dates (pure, en/bn). */
import { bnDigits, MONTHS, WEEKDAYS, weekdayOf, ymdKey, type Ymd } from '@/lib/places/dates'
import { HIJRI_MONTHS } from '@/lib/places/hijri'
import type { EventDay, EventOccurrence } from './calendar'

type Loc = 'en' | 'bn'
const nm = (n: number | string, l: Loc) => (l === 'bn' ? bnDigits(n) : String(n))

/** “Tuesday, 18 May 2027” / “মঙ্গলবার, ১৮ মে ২০২৭” */
export function dateText(v: Ymd, l: Loc, weekday = true) {
  const wd = weekday ? `${WEEKDAYS[l][weekdayOf(v)]}, ` : ''
  return `${wd}${nm(v.d, l)} ${MONTHS[l][v.m - 1]} ${nm(v.y, l)}`
}

/** “13–15 June 2027”, “30 Dec 2027 – 1 January 2028” */
export function rangeText(a: Ymd, b: Ymd, l: Loc, weekday = false) {
  if (ymdKey(a) === ymdKey(b)) return dateText(a, l, weekday)
  if (a.y === b.y && a.m === b.m) return `${nm(a.d, l)}–${nm(b.d, l)} ${MONTHS[l][a.m - 1]} ${nm(a.y, l)}`
  return `${dateText(a, l, false)} – ${dateText(b, l, false)}`
}

/** “10 Dhu al-Hijjah 1448 AH”; ranges “9–10 Muharram 1448 AH”; nights “Night of 27 Ramadan 1448 AH”. */
export function hijriText(o: EventOccurrence, l: Loc, day: EventDay = o.primary): string {
  const month = HIJRI_MONTHS[l][o.hijriMonth - 1]
  const y = nm(o.hijriYear, l)
  const multi = o.days.length > 1 && o.days[0].hijriDay !== o.days[o.days.length - 1].hijriDay
  const night = o.slug === 'laylatul-qadr'
  const d = night || !multi || day !== o.primary ? nm(day.hijriDay, l) : `${nm(o.days[0].hijriDay, l)}–${nm(o.days[o.days.length - 1].hijriDay, l)}`
  if (l === 'bn') return night ? `${d} ${month} ${y} হিজরির রাত` : `${d} ${month} ${y} হিজরি`
  return night ? `Night of ${d} ${month} ${y} AH` : `${d} ${month} ${y} AH`
}

/** Saudi + Bangladesh date strings of the headline (single day, or the whole range for ashura / white days). */
export function occDates(o: EventOccurrence, l: Loc, weekday = true) {
  const multi = o.slug === 'ashura' || o.slug === 'white-days'
  return multi
    ? { saudi: rangeText(o.start, o.end, l, false), bangladesh: rangeText(o.bdStart, o.bdEnd, l, false) }
    : { saudi: dateText(o.primary.saudi, l, weekday), bangladesh: dateText(o.primary.bangladesh, l, weekday) }
}

export const isoDate = ymdKey
