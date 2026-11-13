/** Read-only service behind /api/v1/events, the MCP tool `get_islamic_event` and the markdown alternates (pure; no server-only deps). */
import { absoluteUrl } from '@/lib/site'
import { localeHref } from '@/lib/i18n/routes'
import { citations } from '@/lib/content/cite'
import { surahHref } from '@/lib/quran/chapters'
import { ymdKey, zonedYmd, type Ymd } from '@/lib/places/dates'
import { HIJRI_MONTHS } from '@/lib/places/hijri'
import { EVENT_SLUGS, isEventSlug, nextOccurrence, occurrencesInYear, upcomingTimeline, validEventYear, BD_OFFSET_DAYS, type EventOccurrence, type EventSlug } from './calendar'
import { BN_SHORT, EVENTS } from './content'
import { EVENT_HADITH } from './hadith-refs'
import { dateText, hijriText, rangeText } from './format'

export const TODAY_TZ = 'Asia/Dhaka'
export const today = (now = Date.now()): Ymd => zonedYmd(now, TODAY_TZ)
export const SIGHTING_NOTE = 'Dates follow the Umm al-Qura calendar (Saudi Arabia). Actual observance depends on moon sighting: in Bangladesh and South Asia the date is often one day later than in Saudi Arabia, so the Bangladesh column is an expectation (Saudi date + 1 day), not an official announcement. Follow your national moon-sighting announcement.'

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ’'`‘ʼ\-_.\s]+/g, '')
/** "eid al adha", "Eid ul-Adha", "ঈদুল আজহা", "arafah", "ashura" … → slug */
export function resolveEventName(q: string): EventSlug | null {
  const n = norm(q)
  if (!n) return null
  if (isEventSlug(q.trim())) return q.trim() as EventSlug
  for (const slug of EVENT_SLUGS) {
    const e = EVENTS[slug]
    const names = [slug, e.name.en, e.name.bn, e.name.ar ?? '', BN_SHORT[slug], ...e.alt]
    if (names.some((x) => norm(x) === n)) return slug
  }
  const loose: [RegExp, EventSlug][] = [
    [/adha|bakr|qurban|কোরবান|কুরবান|আজহা|আযহা|أضحى|اضحى/i, 'eid-al-adha'],
    [/fitr|ফিতর|فطر/i, 'eid-al-fitr'],
    [/qadr|qadar|কদর|ক্বদর|قدر/i, 'laylatul-qadr'],
    [/arafa|arafat|আরাফ|عرفة|عرفه/i, 'day-of-arafah'],
    [/ashur|আশুরা|عاشوراء/i, 'ashura'],
    [/newyear|muharram|নববর্ষ|মুহাররম|هجرية/i, 'islamic-new-year'],
    [/white|bid|beed|বীজ|البيض/i, 'white-days'],
    [/ramadan|ramzan|রমজান|রমযান|رمضان/i, 'ramadan-start'],
  ]
  const raw = q.toLowerCase()
  return loose.find(([re]) => re.test(raw) || re.test(n))?.[1] ?? null
}

const dayJson = (d: { hijriDay: number; saudi: Ymd; bangladesh: Ymd }) => ({ hijriDay: d.hijriDay, saudi: ymdKey(d.saudi), bangladeshExpected: ymdKey(d.bangladesh) })

export function occurrenceJson(o: EventOccurrence) {
  return {
    hijri: { year: o.hijriYear, month: o.hijriMonth, monthName: HIJRI_MONTHS.en[o.hijriMonth - 1], label: hijriText(o, 'en') },
    primaryHijriDay: o.primary.hijriDay,
    saudi: { start: ymdKey(o.start), end: ymdKey(o.end), headline: ymdKey(o.primary.saudi), text: o.slug === 'ashura' || o.slug === 'white-days' ? rangeText(o.start, o.end, 'en') : dateText(o.primary.saudi, 'en') },
    bangladeshExpected: { start: ymdKey(o.bdStart), end: ymdKey(o.bdEnd), headline: ymdKey(o.primary.bangladesh), text: o.slug === 'ashura' || o.slug === 'white-days' ? rangeText(o.bdStart, o.bdEnd, 'en') : dateText(o.primary.bangladesh, 'en') },
    days: o.days.map(dayJson),
  }
}

export const eventPath = (slug: EventSlug, year?: number | null) => `/events/${slug}${year ? `/${year}` : ''}`

/** Full JSON for one event. `year` null/undefined → the next occurrence from `now`. Returns null for an unknown event or an out-of-range year. */
export function eventJson(slug: EventSlug, year: number | null | undefined, now = Date.now()) {
  const t = today(now)
  if (year != null && !validEventYear(year, t.y)) return null
  const occs = year != null ? occurrencesInYear(slug, year) : [nextOccurrence(slug, t)]
  const c = EVENTS[slug]
  const y = year ?? occs[0].primary.saudi.y
  const path = eventPath(slug, year)
  const url = absoluteUrl(path)
  return {
    event: slug,
    name: { en: c.name.en, bn: c.name.bn, ar: c.name.ar },
    hijriLabel: c.hijriLabel.en,
    summary: c.summary.en,
    year: year ?? null,
    occurrences: occs.map(occurrenceJson),
    note: SIGHTING_NOTE,
    bangladeshOffsetDays: BD_OFFSET_DAYS,
    quran: c.quran.map((q) => ({ ref: q.ref, url: absoluteUrl(surahHref(+q.ref.split(':')[0], +q.ref.split(':')[1].split('-')[0])), why: q.why.en })),
    hadith: c.hadith.map((id) => EVENT_HADITH[id]).map((h) => ({ reference: `${h.c} ${h.n}`, url: absoluteUrl(`/hadith/${h.c}/${h.n}`), summary: h.en })),
    url,
    urlBn: absoluteUrl(localeHref('bn', path)),
    markdown: `${url}.md`,
    citation: citations({ title: `${c.name.en} ${y} date (Saudi Arabia & Bangladesh)`, url }).plain,
  }
}

/** Compact list of the upcoming events (next 12 months) from `now`, or every event of `year`. */
export function eventsListJson(year: number | null | undefined, now = Date.now()) {
  const t = today(now)
  if (year != null && !validEventYear(year, t.y)) return null
  const items = year != null
    ? EVENT_SLUGS.flatMap((s) => occurrencesInYear(s, year)).sort((a, b) => ymdKey(a.primary.saudi).localeCompare(ymdKey(b.primary.saudi)))
    : upcomingTimeline(t, 12)
  return {
    scope: year != null ? `year ${year}` : 'next 12 months',
    today: ymdKey(t),
    note: SIGHTING_NOTE,
    total: items.length,
    events: items.map((o) => ({ event: o.slug, name: EVENTS[o.slug].name.en, ...occurrenceJson(o), url: absoluteUrl(eventPath(o.slug, o.primary.saudi.y)) })),
    url: absoluteUrl('/events'),
    citation: citations({ title: 'Islamic events calendar', url: absoluteUrl('/events') }).plain,
  }
}
