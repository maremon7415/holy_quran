import { describe, it, expect } from 'vitest'
import { BD_OFFSET_DAYS, EVENT_SLUGS, RULES, bangladeshExpected, eventYears, instantIso, nextOccurrence, occurrencesInYear, upcomingTimeline, validEventYear, type EventSlug } from '@/lib/events/calendar'
import { EVENTS, eventTitle } from '@/lib/events/content'
import { EVENT_HADITH } from '@/lib/events/hadith-refs'
import { dateText, hijriText, occDates, rangeText } from '@/lib/events/format'
import { eventLd } from '@/lib/events/schema'
import { addDays, cmpYmd, ymdKey, type Ymd } from '@/lib/places/dates'
import { ramadanOf } from '@/lib/places/hijri'

// independent oracle: Intl Umm al-Qura, not the library's search routine
const oracle = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' })
const hijriAt = (v: Ymd) => {
  const p = Object.fromEntries(oracle.formatToParts(Date.UTC(v.y, v.m - 1, v.d, 12)).map((x) => [x.type, x.value]))
  return { y: parseInt(p.year, 10), m: +p.month, d: +p.day }
}
const YEARS = Array.from({ length: 10 }, (_, i) => 2024 + i)

describe('Islamic events: date maths vs Intl Umm al-Qura', () => {
  for (const slug of EVENT_SLUGS) {
    it(`${slug}: every day of every occurrence in ${YEARS[0]}–${YEARS[YEARS.length - 1]} has the right Hijri date`, () => {
      const rule = RULES[slug]
      for (const gy of YEARS) {
        const occs = occurrencesInYear(slug, gy)
        expect(occs.length, `${slug} ${gy}`).toBeGreaterThanOrEqual(1)
        for (const o of occs) {
          expect(o.primary.saudi.y).toBe(gy)
          for (const d of o.days) {
            // a night begins at sunset of the previous Gregorian day, so its Gregorian "evening" date is Hijri day − 1
            const h = hijriAt(d.saudi)
            expect(h.d, `${slug} ${ymdKey(d.saudi)}`).toBe(rule.kind === 'night' ? d.hijriDay - 1 : d.hijriDay)
            expect(h.m).toBe(o.hijriMonth)
            expect(h.y).toBe(o.hijriYear)
          }
        }
      }
    })
  }

  it('anchors: Ramadan, Eid al-Fitr, Arafah, Eid al-Adha, new year, Ashura', () => {
    const r48 = ramadanOf(1448)
    expect(ymdKey(occurrencesInYear('ramadan-start', 2027)[0].primary.saudi)).toBe(ymdKey(r48.start))
    expect(ymdKey(occurrencesInYear('eid-al-fitr', 2027)[0].primary.saudi)).toBe(ymdKey(r48.eid))
    const arafah = occurrencesInYear('day-of-arafah', 2027)[0].primary.saudi
    const adha = occurrencesInYear('eid-al-adha', 2027)[0].primary.saudi
    expect(ymdKey(addDays(arafah, 1))).toBe(ymdKey(adha))
    expect(adha.y).toBe(2027)
    expect(adha.m).toBe(5) // Eid al-Adha 2027 falls in May
    const ny = occurrencesInYear('islamic-new-year', 2026)[0].primary.saudi
    const ashura = occurrencesInYear('ashura', 2026)[0]
    expect(ymdKey(ashura.primary.saudi)).toBe(ymdKey(addDays(ny, 9)))
    expect(ashura.days.map((d) => d.hijriDay)).toEqual([9, 10])
  })

  it('Laylatul Qadr: five odd nights, 27th is the headline; the 27th night begins on the evening of 26 Ramadan', () => {
    const o = occurrencesInYear('laylatul-qadr', 2027)[0]
    expect(o.days.map((d) => d.hijriDay)).toEqual([21, 23, 25, 27, 29])
    expect(o.primary.hijriDay).toBe(27)
    const start = ramadanOf(o.hijriYear).start
    expect(ymdKey(o.primary.saudi)).toBe(ymdKey(addDays(start, 25))) // 26 Ramadan
    expect(hijriText(o, 'en')).toBe(`Night of 27 Ramadan ${o.hijriYear} AH`)
    expect(hijriText(o, 'bn')).toContain('রাত')
  })

  it('a lunar year is shorter than a solar one: some years hold two Ramadans, none hold zero', () => {
    const counts = YEARS.map((y) => occurrencesInYear('ramadan-start', y).length)
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(1)
    expect(counts.some((c) => c === 2)).toBe(true) // 2030
    expect(occurrencesInYear('ramadan-start', 2030)).toHaveLength(2)
  })

  it('white days: 13–15 of each Hijri month, Ramadan and Dhu al-Hijjah skipped, 10–11 sets a year', () => {
    for (const gy of YEARS) {
      const occs = occurrencesInYear('white-days', gy)
      expect(occs.length).toBeGreaterThanOrEqual(9)
      expect(occs.length).toBeLessThanOrEqual(11)
      for (const o of occs) {
        expect([9, 12]).not.toContain(o.hijriMonth)
        expect(o.days.map((d) => d.hijriDay)).toEqual([13, 14, 15])
        expect(cmpYmd(o.end, addDays(o.start, 2))).toBe(0)
      }
    }
  })

  it('nextOccurrence / upcomingTimeline from a fixed day', () => {
    const from = { y: 2026, m: 11, d: 13 }
    const adha = nextOccurrence('eid-al-adha', from)
    expect(adha.primary.saudi.y).toBe(2027)
    const tl = upcomingTimeline(from, 12)
    const slugs = tl.map((o) => o.slug)
    for (const s of ['ramadan-start', 'laylatul-qadr', 'eid-al-fitr', 'day-of-arafah', 'eid-al-adha', 'white-days'] as EventSlug[]) expect(slugs, s).toContain(s)
    expect(slugs.filter((s) => s === 'white-days')).toHaveLength(1)
    for (let i = 1; i < tl.length; i++) expect(cmpYmd(tl[i].start, tl[i - 1].start)).toBeGreaterThanOrEqual(0)
    for (const o of tl) expect(cmpYmd(o.bdEnd, from)).toBeGreaterThanOrEqual(0)
  })
})

describe('Bangladesh (expected) = Saudi + 1 day', () => {
  it('offset constant and helper, across month and year ends', () => {
    expect(BD_OFFSET_DAYS).toBe(1)
    expect(ymdKey(bangladeshExpected({ y: 2027, m: 5, d: 16 }))).toBe('2027-05-17')
    expect(ymdKey(bangladeshExpected({ y: 2027, m: 12, d: 31 }))).toBe('2028-01-01')
    expect(ymdKey(bangladeshExpected({ y: 2028, m: 2, d: 28 }))).toBe('2028-02-29')
  })
  it('every event day carries the +1 expectation and the text shows both columns', () => {
    for (const slug of EVENT_SLUGS) for (const gy of [2026, 2027, 2028]) for (const o of occurrencesInYear(slug, gy)) {
      for (const d of o.days) expect(ymdKey(d.bangladesh)).toBe(ymdKey(addDays(d.saudi, 1)))
      expect(ymdKey(o.bdStart)).toBe(ymdKey(addDays(o.start, 1)))
      const t = occDates(o, 'en')
      expect(t.saudi).not.toBe(t.bangladesh)
    }
  })
  it('formats dates in English and Bangla', () => {
    expect(dateText({ y: 2027, m: 5, d: 17 }, 'en')).toBe('Monday, 17 May 2027')
    expect(dateText({ y: 2027, m: 5, d: 17 }, 'bn')).toContain('২০২৭')
    expect(rangeText({ y: 2027, m: 6, d: 13 }, { y: 2027, m: 6, d: 15 }, 'en')).toBe('13–15 June 2027')
  })
})

describe('year range validation', () => {
  it('accepts current year −1 … +4 only', () => {
    expect(eventYears(2026)).toEqual([2025, 2026, 2027, 2028, 2029, 2030])
    for (const y of [2025, 2026, 2030]) expect(validEventYear(y, 2026)).toBe(true)
    for (const y of [2024, 2031, 1999, 2026.5, NaN]) expect(validEventYear(y, 2026)).toBe(false)
  })
})

describe('instants for countdowns', () => {
  it('builds offset timestamps for Riyadh and Dhaka', () => {
    expect(instantIso({ y: 2027, m: 5, d: 17 }, 'saudi')).toBe('2027-05-17T00:00:00+03:00')
    expect(instantIso({ y: 2027, m: 5, d: 17 }, 'bangladesh', 18)).toBe('2027-05-17T18:00:00+06:00')
    expect(new Date(instantIso({ y: 2027, m: 5, d: 17 }, 'bangladesh')).toISOString()).toBe('2027-05-16T18:00:00.000Z')
  })
})

describe('content integrity', () => {
  it('titles include the year, both languages and the Bangladesh/Saudi qualifier', () => {
    expect(eventTitle('eid-al-adha', 2027, '২০২৭', 'en')).toBe('Eid ul Adha 2027 Date in Bangladesh & Saudi Arabia | ঈদুল আজহা ২০২৭ কবে')
    expect(eventTitle('eid-al-adha', 2027, '২০২৭', 'bn')).toMatch(/^ঈদুল আজহা ২০২৭ কবে\? .* \| Eid ul Adha 2027 Date$/)
    expect(eventTitle('laylatul-qadr', null, '', 'en')).toContain('শবে কদর কবে')
    for (const s of EVENT_SLUGS) {
      for (const y of [2027, null]) for (const loc of ['en', 'bn'] as const) {
        const t = eventTitle(s, y, '২০২৭', loc)
        expect(t, `${s} ${y} ${loc}`).toMatch(/\|/)
        expect(t.length, t).toBeLessThan(150)
      }
    }
  })
  it('every event has trilingual essentials, Quran refs in range and hadith refs that exist', () => {
    for (const s of EVENT_SLUGS) {
      const c = EVENTS[s]
      expect(c.slug).toBe(s)
      for (const v of [c.name, c.summary, c.hijriLabel]) { expect(v.en).toBeTruthy(); expect(v.bn).toMatch(/[ঀ-৿]/); expect(v.ar).toMatch(/[؀-ۿ]/) }
      for (const p of [...c.what, ...c.observe]) { expect(p.en.length).toBeGreaterThan(20); expect(p.bn).toMatch(/[ঀ-৿]/) }
      for (const f of c.faq) { expect(f.q.bn).toMatch(/[ঀ-৿]/); expect(f.a.bn).toMatch(/[ঀ-৿]/) }
      expect(c.quran.length).toBeGreaterThan(0)
      for (const q of c.quran) expect(q.ref).toMatch(/^\d{1,3}:\d{1,3}(-\d{1,3})?$/)
      for (const id of c.hadith) expect(EVENT_HADITH[id], `${s}:${id}`).toBeDefined()
    }
  })
})

describe('Event JSON-LD', () => {
  it('has the fields schema.org / Google need, valid ISO dates and a worldwide-appropriate location', () => {
    for (const s of EVENT_SLUGS) {
      const occ = occurrencesInYear(s, 2027)[0]
      const ld = eventLd({ content: EVENTS[s], occ, name: `${EVENTS[s].name.en} 2027`, description: 'desc', path: `/events/${s}/2027`, locale: 'en' }) as Record<string, any>
      expect(ld['@type']).toBe('Event')
      expect(ld['@context']).toBe('https://schema.org')
      for (const k of ['name', 'description', 'url', 'startDate', 'endDate', 'eventStatus', 'eventAttendanceMode', 'location', 'image', 'organizer']) expect(ld[k], `${s}.${k}`).toBeTruthy()
      expect(ld.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(ld.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(ld.endDate >= ld.startDate).toBe(true)
      expect(ld.eventStatus).toBe('https://schema.org/EventScheduled')
      expect(ld.eventAttendanceMode).toMatch(/^https:\/\/schema\.org\/(Offline|Online|Mixed)EventAttendanceMode$/)
      expect(ld.url).toBe(`https://holy-quran-noor.vercel.app/events/${s}/2027`)
      for (const p of ld.location) { expect(p['@type']).toBe('Place'); expect(p.name).toBeTruthy(); expect(p.address.addressCountry).toMatch(/^[A-Z]{2}$/) }
      expect(() => JSON.stringify(ld)).not.toThrow()
    }
  })
})
