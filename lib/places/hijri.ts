import { addDays, parseYmd, ymdKey, type Ymd } from './dates'

export interface Hijri { y: number; m: number; d: number }

const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' })

/** Umm al-Qura Hijri date of a Gregorian calendar day (valid for ~1300–1600 AH). */
export function hijriOf(v: Ymd): Hijri {
  const p = Object.fromEntries(fmt.formatToParts(Date.UTC(v.y, v.m - 1, v.d, 12)).map((x) => [x.type, x.value]))
  // Intl may append an era ("1448 AH") to the year part; parseInt handles that
  return { y: parseInt(p.year, 10), m: +p.month, d: +p.day }
}

export const HIJRI_MONTHS = {
  en: ['Muharram', 'Safar', 'Rabi’ al-Awwal', 'Rabi’ al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha’ban', 'Ramadan', 'Shawwal', 'Dhu al-Qa’dah', 'Dhu al-Hijjah'],
  bn: ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'],
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
}

const BN = '০১২৩৪৫৬৭৮৯'
const bnD = (n: number) => String(n).replace(/\d/g, (d) => BN[+d])
const arD = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])

export function fmtHijri(h: Hijri, lang: 'en' | 'bn' | 'ar' = 'en') {
  if (lang === 'bn') return `${bnD(h.d)} ${HIJRI_MONTHS.bn[h.m - 1]} ${bnD(h.y)} হিজরি`
  if (lang === 'ar') return `${arD(h.d)} ${HIJRI_MONTHS.ar[h.m - 1]} ${arD(h.y)} هـ`
  return `${h.d} ${HIJRI_MONTHS.en[h.m - 1]} ${h.y} AH`
}

const eq = (a: Hijri, b: Hijri) => a.y === b.y && a.m === b.m && a.d === b.d

/** Gregorian day of a Hijri date (Umm al-Qura), or null when that day does not exist (e.g. day 30 of a 29-day month). */
export function gregorianOf(hy: number, hm: number, hd: number): Ymd | null {
  let t = Date.UTC(Math.round(hy * 0.970229 + 621.5744), 0, 1, 12) + Math.round(((hm - 1) * 29.53 + (hd - 1)) * 864e5)
  for (let i = 0; i < 14; i++) {
    const g = new Date(t)
    const v = { y: g.getUTCFullYear(), m: g.getUTCMonth() + 1, d: g.getUTCDate() }
    const cur = hijriOf(v)
    if (eq(cur, { y: hy, m: hm, d: hd })) return v
    const diff = (hy - cur.y) * 354.367 + (hm - cur.m) * 29.531 + (hd - cur.d)
    const step = Math.abs(diff) < 1 ? Math.sign(diff) : Math.round(diff)
    if (step === 0) break
    t += step * 864e5
  }
  return null
}

export interface RamadanRange {
  hijriYear: number
  /** Umm al-Qura 1 Ramadan */
  start: Ymd
  /** last day of Ramadan (29 or 30 Ramadan) */
  end: Ymd
  days: 29 | 30
  /** 1 Shawwal — Eid al-Fitr */
  eid: Ymd
}

const cache = new Map<number, RamadanRange>()
/** Ramadan of Hijri year `hy`, by the Umm al-Qura calendar (Saudi). Other countries may start a day later or earlier (moon sighting). */
export function ramadanOf(hy: number): RamadanRange {
  const hit = cache.get(hy)
  if (hit) return hit
  const start = gregorianOf(hy, 9, 1)!
  const eid = gregorianOf(hy, 10, 1)!
  const days = Math.round((Date.UTC(eid.y, eid.m - 1, eid.d) - Date.UTC(start.y, start.m - 1, start.d)) / 864e5) as 29 | 30
  const r = { hijriYear: hy, start, end: addDays(eid, -1), days, eid }
  cache.set(hy, r)
  return r
}

/**
 * Every Ramadan that STARTS in Gregorian year `gy`, earliest first. Usually one; the Hijri year is ~11 days shorter than
 * the Gregorian one, so now and then (first: 2030 = 1451 on 5 Jan and 1452 on 26 Dec) a year holds two.
 */
export function ramadansInGregorianYear(gy: number): RamadanRange[] {
  const guess = Math.round((gy - 621.5744) / 0.970229)
  const out: RamadanRange[] = []
  for (const hy of [guess - 2, guess - 1, guess, guess + 1, guess + 2]) {
    const r = ramadanOf(hy)
    if (r.start.y === gy) out.push(r)
  }
  return out.sort((a, b) => a.hijriYear - b.hijriYear)
}

/**
 * URL slug of a Ramadan page (`/ramadan/{slug}`), chosen for SEO ("Ramadan 2027"):
 *  - the only Ramadan starting in a Gregorian year → that year (`2027`);
 *  - one of two in the same year → its Hijri year (`1452-ah`), while `/ramadan/2030` becomes a chooser page.
 */
export function ramadanSlug(r: RamadanRange): string {
  return ramadansInGregorianYear(r.start.y).length > 1 ? `${r.hijriYear}-ah` : String(r.start.y)
}
export const ramadanPath = (r: RamadanRange) => `/ramadan/${ramadanSlug(r)}`

export type RamadanSlug = { kind: 'year'; year: number } | { kind: 'ah'; hijriYear: number }
/** Parses `2030` / `1452-ah` (anything else → null). Hijri years are limited to the range Intl can convert. */
export function parseRamadanSlug(s: string): RamadanSlug | null {
  if (/^\d{4}$/.test(s)) return { kind: 'year', year: +s }
  const m = /^(\d{4})-ah$/.exec(s)
  return m && +m[1] >= 1300 && +m[1] <= 1600 ? { kind: 'ah', hijriYear: +m[1] } : null
}

/** The Ramadan a bare Gregorian year should lead to on `today`: the one running, else the next to start, else the last of that year. */
export function ramadanForYear(gy: number, today: Ymd): RamadanRange | null {
  const list = ramadansInGregorianYear(gy)
  const t = Date.UTC(today.y, today.m - 1, today.d)
  return list.find((r) => t <= Date.UTC(r.end.y, r.end.m - 1, r.end.d)) ?? list[list.length - 1] ?? null
}

/** Short title fragment: `2027`, or `2030 (1452 AH)` when the Gregorian year holds two Ramadans. */
export function ramadanLabel(r: RamadanRange, lang: 'en' | 'bn' | 'ar' = 'en'): string {
  const n = (v: number) => (lang === 'bn' ? bnD(v) : String(v))
  if (ramadansInGregorianYear(r.start.y).length < 2) return n(r.start.y)
  return `${n(r.start.y)} (${n(r.hijriYear)} ${lang === 'bn' ? 'হিজরি' : lang === 'ar' ? 'هـ' : 'AH'})`
}

/** Ramadan currently running, else the next one, relative to `today`. */
export function currentOrNextRamadan(today: Ymd): { range: RamadanRange; running: boolean } {
  const hy = hijriOf(today).y
  for (const y of [hy - 1, hy, hy + 1]) {
    const r = ramadanOf(y)
    const t = Date.UTC(today.y, today.m - 1, today.d)
    if (t <= Date.UTC(r.end.y, r.end.m - 1, r.end.d)) return { range: r, running: t >= Date.UTC(r.start.y, r.start.m - 1, r.start.d) }
  }
  return { range: ramadanOf(hy + 1), running: false }
}

export { parseYmd, ymdKey }
