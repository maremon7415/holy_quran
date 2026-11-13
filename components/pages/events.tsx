import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { CiteThis } from '@/components/seo/cite-this'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { AyahCard } from '@/components/content/ayah-card'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { UiIcon } from '@/components/ui-icon'
import { chipCls } from '@/components/places/city-ui'
import { DaysUntil, EventCountdown, type CountdownTarget } from '@/components/events/countdown'
import { buildMeta } from '@/lib/content/seo'
import { collectionLd } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { pick } from '@/lib/i18n/t'
import { absoluteUrl } from '@/lib/site'
import { getVersesByRefs } from '@/lib/quran/data'
import { resolveDua } from '@/lib/content/resolve'
import { duas } from '@/data/content/duas'
import { bnDigits, cmpYmd, zonedYmd, type Ymd } from '@/lib/places/dates'
import { EVENT_SLUGS, eventYears, futureOccurrences, instantIso, isEventSlug, nextOccurrence, occurrencesInYear, upcomingTimeline, validEventYear, daysBetween, type EventOccurrence, type EventSlug } from '@/lib/events/calendar'
import { BN_SHORT, EVENTS, eventTitle, type EventContent, type Tr3 } from '@/lib/events/content'
import { EVENT_HADITH } from '@/lib/events/hadith-refs'
import { dateText, hijriText, occDates } from '@/lib/events/format'
import { eventLd } from '@/lib/events/schema'
import { eventPath } from '@/lib/events/service'

const TZ = 'Asia/Dhaka'
const nowYmd = () => zonedYmd(Date.now(), TZ)
const bnY = (y: number | string) => bnDigits(y)
const L = (locale: Locale, v: Tr3) => lt(locale, v)
const S = (locale: Locale, v: Tr3) => pick(locale, v)
const T3 = (locale: Locale, en: string, bn: string, ar?: string) => lt(locale, { en, bn, ar })

export type EventProps = { params: Promise<{ event: string }> }
export type EventYearProps = { params: Promise<{ event: string; year: string }> }

export const eventParams = () => EVENT_SLUGS.map((event) => ({ event }))
export const eventYearParams = () => EVENT_SLUGS.flatMap((event) => eventYears(nowYmd().y).map((y) => ({ event, year: String(y) })))

function loadSlug(event: string): EventSlug {
  if (!isEventSlug(event)) notFound()
  return event
}
function loadYear(event: string, year: string) {
  const slug = loadSlug(event)
  const y = Number(year)
  if (!/^\d{4}$/.test(year) || !validEventYear(y, nowYmd().y)) notFound()
  return { slug, y, occs: occurrencesInYear(slug, y) }
}

/** The occurrence a page is “about”: the first one that has not fully passed, else the first of the year. */
const focusOf = (occs: EventOccurrence[], today: Ymd) => occs.find((o) => cmpYmd(o.bdEnd, today) >= 0) ?? occs[0]

/* ───────────── shared UI ───────────── */

export function SightingNote({ locale, className = '' }: { locale: Locale; className?: string }) {
  return (
    <aside role="note" data-testid="sighting-note" className={`rounded-3xl border border-gold/50 bg-gold-soft/40 p-5 text-sm leading-relaxed ${className}`}>
      <h2 className="font-display mb-1 flex items-center gap-2 text-base font-semibold"><UiIcon name="crescent" size={20} /> {T3(locale, 'Actual dates depend on moon sighting', 'প্রকৃত তারিখ চাঁদ দেখার উপর নির্ভর করে', 'التواريخ الفعلية تتبع رؤية الهلال')}</h2>
      <p className="text-muted-foreground">
        {T3(locale,
          'Saudi dates follow the Umm al-Qura calendar. In Bangladesh and South Asia the date is often one day later than Saudi Arabia, because months begin from local crescent sighting. The “Bangladesh (expected)” column is the Saudi date plus one day, an estimate and not an official announcement. Always follow the announcement of your country’s moon-sighting committee.',
          'সৌদি তারিখ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী। বাংলাদেশ ও দক্ষিণ এশিয়ায় স্থানীয় চাঁদ দেখার ভিত্তিতে মাস শুরু হয়, তাই তারিখ প্রায়ই সৌদি আরবের একদিন পরে হয়। “বাংলাদেশ (সম্ভাব্য)” কলামটি সৌদি তারিখের সঙ্গে এক দিন যোগ করে হিসাব করা — এটি আনুমানিক, সরকারি ঘোষণা নয়। সবসময় আপনার দেশের চাঁদ দেখা কমিটির ঘোষণা অনুসরণ করুন।',
          'تتبع تواريخ السعودية تقويم أم القرى، أما في بنغلاديش وجنوب آسيا فغالبًا يتأخر التاريخ يومًا لأن الشهر يبدأ برؤية الهلال محليًا. عمود بنغلاديش تقدير (التاريخ السعودي + يوم) وليس إعلانًا رسميًا.')}
      </p>
    </aside>
  )
}

function DateBox({ tone, label, date, sub }: { tone: 'primary' | 'gold'; label: React.ReactNode; date: string; sub: string }) {
  return (
    <div className={`rounded-3xl border border-border p-5 ${tone === 'primary' ? 'bg-gradient-to-br from-accent to-card' : 'bg-gradient-to-br from-gold-soft/60 to-card'}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${tone === 'primary' ? 'text-primary' : 'text-gold'}`}>{label}</p>
      <p className="font-display mt-2 text-xl font-semibold leading-snug sm:text-2xl" data-testid={tone === 'primary' ? 'date-saudi' : 'date-bd'}>{date}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}

const SAUDI_LABEL = { en: 'Saudi Arabia (Umm al-Qura)', bn: 'সৌদি আরব (উম্মুল কুরা)', ar: 'السعودية (أم القرى)' }
const BD_LABEL = { en: 'Bangladesh (expected, usually +1 day)', bn: 'বাংলাদেশ (সম্ভাব্য, সাধারণত +১ দিন)', ar: 'بنغلاديش (متوقع، غالبًا +١ يوم)' }

function DateBoxes({ locale, o }: { locale: Locale; o: EventOccurrence }) {
  const l = locale === 'bn' ? 'bn' : 'en'
  const d = occDates(o, l)
  const sub = hijriText(o, l)
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <DateBox tone="primary" label={L(locale, SAUDI_LABEL)} date={d.saudi} sub={sub} />
      <DateBox tone="gold" label={L(locale, BD_LABEL)} date={d.bangladesh} sub={sub} />
    </div>
  )
}

/** Countdown targets: start of the headline day in each country (nights: 18:00 local, the evening on which the night begins). */
function targetsFor(locale: Locale, o: EventOccurrence): CountdownTarget[] {
  const l = locale === 'bn' ? 'bn' : 'en'
  const night = o.slug === 'laylatul-qadr'
  const range = o.slug === 'ashura' || o.slug === 'white-days'
  const sa = range ? o.start : o.primary.saudi
  const bd = range ? o.bdStart : o.primary.bangladesh
  const d = occDates(o, l)
  const hr = night ? 18 : 0
  return [
    { key: 'sa', iso: instantIso(sa, 'saudi', hr), label: night ? { en: 'Saudi Arabia — evening', bn: 'সৌদি আরব — সন্ধ্যা', ar: 'السعودية — المساء' } : SAUDI_LABEL, date: d.saudi },
    { key: 'bd', iso: instantIso(bd, 'bangladesh', hr), label: night ? { en: 'Bangladesh (expected) — evening', bn: 'বাংলাদেশ (সম্ভাব্য) — সন্ধ্যা', ar: 'بنغلاديش (متوقع) — المساء' } : BD_LABEL, date: d.bangladesh },
  ]
}

const COLLECTION = {
  bukhari: { en: 'Sahih al-Bukhari', bn: 'সহীহ বুখারী', ar: 'صحيح البخاري' },
  muslim: { en: 'Sahih Muslim', bn: 'সহীহ মুসলিম', ar: 'صحيح مسلم' },
  tirmidhi: { en: 'Jami at-Tirmidhi', bn: 'জামে তিরমিযী', ar: 'جامع الترمذي' },
  nasai: { en: 'Sunan an-Nasa’i', bn: 'সুনান নাসাঈ', ar: 'سنن النسائي' },
} satisfies Record<string, Tr3>

const th = 'whitespace-nowrap px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'
const td = 'px-3 py-2.5 text-start text-sm'

async function QuranRef({ locale, q }: { locale: Locale; q: { ref: string; why: Tr3 } }) {
  const vs = await getVersesByRefs([q.ref])
  return (
    <div data-ref={q.ref}>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{L(locale, q.why)}</p>
      <div className="space-y-4">{vs.map((v, i) => <AyahCard key={`${v.surah}:${v.n}`} verse={v} index={i} locale={locale} />)}</div>
    </div>
  )
}

function Quran({ locale, c }: { locale: Locale; c: EventContent }) {
  return (
    <section className="mt-12" aria-labelledby="quran-h">
      <h2 id="quran-h" className="font-display mb-4 text-2xl font-semibold">{T3(locale, 'In the Quran', 'কুরআনে', 'في القرآن')}</h2>
      <div className="space-y-6">{c.quran.map((q) => <QuranRef key={q.ref} locale={locale} q={q} />)}</div>
    </section>
  )
}

function HadithList({ locale, c }: { locale: Locale; c: EventContent }) {
  if (!c.hadith.length) return null
  return (
    <section className="mt-12" aria-labelledby="hadith-h">
      <h2 id="hadith-h" className="font-display mb-4 text-2xl font-semibold">{T3(locale, 'In the hadith', 'হাদিসে', 'في الحديث')}</h2>
      <ul className="grid gap-3">
        {c.hadith.map((id) => {
          const h = EVENT_HADITH[id]
          const name = COLLECTION[h.c]
          return (
            <li key={id} className="card-soft rounded-3xl p-5">
              <p className="text-sm leading-relaxed text-foreground/90">{locale === 'bn' ? h.bn : <>{lt(locale, { en: h.en, bn: h.bn, ar: h.ar })}</>}</p>
              <Link href={localeHref(locale, `/hadith/${h.c}/${h.n}`)} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">{L(locale, name)} {locale === 'bn' ? bnDigits(h.n) : h.n}</Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

async function Duas({ locale, c }: { locale: Locale; c: EventContent }) {
  const list = c.duas.map((s) => duas.find((d) => d.slug === s)).filter((d) => !!d)
  if (!list.length) return null
  const rs = await Promise.all(list.map((d) => resolveDua(d!)))
  return (
    <section className="mt-12" aria-labelledby="dua-h">
      <h2 id="dua-h" className="font-display mb-4 text-2xl font-semibold">{T3(locale, 'Related duas', 'সংশ্লিষ্ট দোয়া', 'أدعية متعلقة')}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {rs.map((d) => (
          <article key={d.slug} className="card-soft rounded-3xl p-5">
            <h3 className="font-semibold">{locale === 'bn' ? d.title.bn : d.title.en}</h3>
            <p lang="ar" dir="rtl" className="font-arabic mt-2 text-2xl leading-[2] text-arabic">{d.ar}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{locale === 'bn' ? d.meaning.bn : d.meaning.en}</p>
            <p className="mt-2 text-xs text-muted-foreground">{d.source}</p>
            <Link href={localeHref(locale, `/dua/${d.slug}`)} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">{T3(locale, 'Open dua page', 'দোয়ার পাতা', 'صفحة الدعاء')}</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function DateTable({ locale, rows, caption, withNight }: { locale: Locale; rows: { o: EventOccurrence; link?: string }[]; caption: string; withNight?: boolean }) {
  const l = locale === 'bn' ? 'bn' : 'en'
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full min-w-[560px] border-collapse text-sm" data-testid="events-table">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-2/70"><tr>
          <th scope="col" className={th}>{T3(locale, 'Hijri date', 'হিজরি তারিখ', 'التاريخ الهجري')}</th>
          <th scope="col" className={th}>{L(locale, SAUDI_LABEL)}</th>
          <th scope="col" className={th}>{L(locale, BD_LABEL)}</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ o, link }) => {
            const d = occDates(o, l)
            return (
              <tr key={`${o.hijriYear}-${o.hijriMonth}`} className="odd:bg-surface-2/30">
                <th scope="row" className={`${td} font-medium`}>{link ? <Link href={link} className="text-primary hover:underline">{hijriText(o, l)}</Link> : hijriText(o, l)}</th>
                <td className={td}>{d.saudi}</td>
                <td className={td}>{d.bangladesh}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {withNight && <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">{T3(locale, 'Dates are the evenings on which each night begins (at sunset); the night lasts until Fajr.', 'তারিখগুলো সেই সন্ধ্যার (সূর্যাস্তের), যেদিন রাতটি শুরু হয়; রাত ফজর পর্যন্ত থাকে।', 'التواريخ هي مساء بداية كل ليلة عند الغروب وتستمر حتى الفجر.')}</p>}
    </div>
  )
}

/** Day-by-day rows inside one occurrence (odd nights, 9th/10th Muharram). */
function DayRows({ locale, o }: { locale: Locale; o: EventOccurrence }) {
  const l = locale === 'bn' ? 'bn' : 'en'
  const night = o.slug === 'laylatul-qadr'
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full min-w-[560px] border-collapse text-sm" data-testid="day-rows">
        <caption className="sr-only">{T3(locale, 'Day by day', 'দিন অনুযায়ী', 'يومًا بيوم')}</caption>
        <thead className="bg-surface-2/70"><tr>
          <th scope="col" className={th}>{night ? T3(locale, 'Night', 'রাত', 'الليلة') : T3(locale, 'Day', 'দিন', 'اليوم')}</th>
          <th scope="col" className={th}>{L(locale, SAUDI_LABEL)}</th>
          <th scope="col" className={th}>{L(locale, BD_LABEL)}</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {o.days.map((d) => (
            <tr key={d.hijriDay} className={`odd:bg-surface-2/30 ${d === o.primary && o.days.length > 1 ? 'font-semibold' : ''}`} data-primary={d === o.primary}>
              <th scope="row" className={td}>{night ? (l === 'bn' ? `${bnDigits(d.hijriDay)}তম রাত` : `${d.hijriDay}th night`) : hijriText(o, l, d)}{night && d === o.primary ? <span className="ms-2 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold text-gold">{T3(locale, 'commonly observed', 'বহুল পালিত', 'الأكثر إحياءً')}</span> : null}</th>
              <td className={td}>{dateText(d.saudi, l)}</td>
              <td className={td}>{dateText(d.bangladesh, l)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {night && <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">{T3(locale, 'Dates are the evenings on which each night begins (at sunset); the night lasts until Fajr.', 'তারিখগুলো সেই সন্ধ্যার (সূর্যাস্তের), যেদিন রাতটি শুরু হয়; রাত ফজর পর্যন্ত থাকে।', 'التواريخ هي مساء بداية كل ليلة عند الغروب وتستمر حتى الفجر.')}</p>}
    </div>
  )
}

function answerText(c: EventContent, o: EventOccurrence, y: number, locale: Locale) {
  const l = locale === 'bn' ? 'bn' : 'en'
  const d = occDates(o, l, true)
  return locale === 'bn'
    ? `${BN_SHORT[c.slug]} ${bnY(y)} উম্মুল কুরা অনুযায়ী সৌদি আরবে ${d.saudi} (${hijriText(o, 'bn')}) এবং বাংলাদেশে সম্ভাব্য ${d.bangladesh} — চাঁদ দেখার উপর নির্ভর করে।`
    : `${c.name.en} ${y} is on ${d.saudi} in Saudi Arabia (${hijriText(o, 'en')}, Umm al-Qura) and expected on ${d.bangladesh} in Bangladesh, depending on moon sighting.`
}

function buildFaqs(c: EventContent, o: EventOccurrence, occs: EventOccurrence[], y: number, locale: Locale) {
  const l = locale === 'bn' ? 'bn' : 'en'
  const d = occDates(o, l, true)
  const name = locale === 'bn' ? BN_SHORT[c.slug] : c.name.en
  const Y = locale === 'bn' ? bnY(y) : String(y)
  const hj = hijriText(o, l)
  const base = locale === 'bn'
    ? [
        { q: `${name} ${Y} কবে?`, a: `উম্মুল কুরা (সৌদি আরব) অনুযায়ী ${name} ${Y}: ${d.saudi} (${hj})।${occs.length > 1 ? ` এই ইংরেজি বছরে ${name} একাধিকবার পড়ে — সারণি দেখুন।` : ''} বাংলাদেশে সম্ভাব্য তারিখ ${d.bangladesh}; এটি চাঁদ দেখা সাপেক্ষে।` },
        { q: `বাংলাদেশে ${name} ${Y} কবে?`, a: `বাংলাদেশে ${name} ${Y} সম্ভাব্য ${d.bangladesh} — সাধারণত সৌদি আরবের (${d.saudi}) একদিন পরে, কারণ এখানে স্থানীয় চাঁদ দেখার ভিত্তিতে মাস শুরু হয়। জাতীয় চাঁদ দেখা কমিটির ঘোষণাতেই তারিখ নিশ্চিত হয়।` },
        { q: 'সৌদি আরব ও বাংলাদেশের তারিখ আলাদা হয় কেন?', a: 'সৌদি আরব উম্মুল কুরা ক্যালেন্ডার (হিসাবভিত্তিক) ব্যবহার করে, আর বাংলাদেশ, ভারত ও পাকিস্তানে স্থানীয় আকাশে নতুন চাঁদ দেখার ভিত্তিতে মাস শুরু হয়। তাই প্রায়ই একদিনের পার্থক্য হয়।' },
      ]
    : [
        { q: `When is ${name} ${Y}?`, a: `By the Umm al-Qura calendar (Saudi Arabia), ${name} ${Y} is on ${d.saudi} (${hj}).${occs.length > 1 ? ` ${name} falls twice in this Gregorian year; see the table.` : ''} In Bangladesh it is expected on ${d.bangladesh}, subject to moon sighting.` },
        { q: `When is ${name} ${Y} in Bangladesh?`, a: `${name} ${Y} is expected on ${d.bangladesh} in Bangladesh, usually one day after Saudi Arabia (${d.saudi}), because Bangladesh begins months from local crescent sighting. The date is confirmed only by the announcement of the national moon-sighting committee.` },
        { q: 'Why do Saudi Arabia and Bangladesh have different dates?', a: 'Saudi Arabia uses the Umm al-Qura calendar, which is calculated, while Bangladesh, India and Pakistan start each month from sighting the new crescent in their own sky, so the dates are often a day apart.' },
      ]
  return [...base, ...c.faq.map((f) => ({ q: S(locale, f.q), a: S(locale, f.a) }))]
}

/* ───────────── /events ───────────── */

const HUB_TITLE = (y: number, locale: Locale) => locale === 'bn'
  ? `ইসলামি দিবস ${bnY(y)}–${bnY(y + 1)}: ঈদ, রমজান, শবে কদর, আশুরার তারিখ | Islamic Events Calendar`
  : `Islamic Events ${y}–${y + 1}: Eid, Ramadan, Laylatul Qadr & Ashura Dates | ইসলামি দিবস কবে`

export function eventsHubMeta(locale: Locale): Metadata {
  const t = nowYmd()
  return buildMeta({
    title: HUB_TITLE(t.y, locale),
    description: locale === 'bn'
      ? 'আগামী ১২ মাসের ইসলামি দিবসের তারিখ: রমজান, শবে কদর, ঈদুল ফিতর, আরাফার দিন, ঈদুল আজহা, নববর্ষ ও আশুরা। সৌদি আরব (উম্মুল কুরা) ও বাংলাদেশের (সম্ভাব্য, সাধারণত +১ দিন) তারিখ আলাদা কলামে, কাউন্টডাউনসহ।'
      : 'Dates of the next 12 months of Islamic events — Ramadan, Laylatul Qadr, Eid al-Fitr, Day of Arafah, Eid al-Adha, Islamic New Year and Ashura — for Saudi Arabia (Umm al-Qura) and Bangladesh (expected, usually +1 day), with countdowns.',
    keywords: ['Islamic events', 'Islamic calendar events', 'Islamic holidays', `Eid ul Fitr ${t.y + 1} date`, `Eid ul Adha ${t.y + 1} Bangladesh`, `Ramadan ${t.y + 1} start date`, `Laylatul Qadr ${t.y + 1}`, `Ashura ${t.y + 1}`, 'ঈদুল আজহা কবে', 'ঈদুল ফিতর কবে', 'শবে কদর কবে', 'রমজান কবে শুরু', 'ইসলামি দিবস', `ঈদুল আজহা ${bnY(t.y + 1)} কবে`],
    path: '/events',
    locale,
    markdown: true,
  })
}

export function EventsHubPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const l = bn ? 'bn' : 'en'
  const today = nowYmd()
  const items = upcomingTimeline(today, 12)
  const next = (s: EventSlug) => nextOccurrence(s, today)
  const path = localeHref(locale, '/events')
  const faqs = (['eid-al-adha', 'eid-al-fitr', 'ramadan-start', 'laylatul-qadr'] as EventSlug[]).map((s) => {
    const o = next(s)
    const d = occDates(o, l, true)
    const c = EVENTS[s]
    const y = o.primary.saudi.y
    return bn
      ? { q: `${BN_SHORT[s]} ${bnY(y)} কবে?`, a: `সৌদি আরবে (উম্মুল কুরা) ${d.saudi}; বাংলাদেশে সম্ভাব্য ${d.bangladesh} (সাধারণত একদিন পরে)। চাঁদ দেখার উপর নির্ভর করে — জাতীয় ঘোষণা অনুসরণ করুন।` }
      : { q: `When is ${c.name.en} ${y}?`, a: `${d.saudi} in Saudi Arabia (Umm al-Qura); expected ${d.bangladesh} in Bangladesh (usually one day later). It depends on moon sighting, so follow your national announcement.` }
  })
  faqs.push(bn
    ? { q: 'বাংলাদেশে কেন সৌদি আরবের একদিন পরে ঈদ হয়?', a: 'বাংলাদেশে স্থানীয় আকাশে চাঁদ দেখার ভিত্তিতে মাস শুরু হয়, আর সৌদি আরব উম্মুল কুরা হিসাবভিত্তিক ক্যালেন্ডার অনুসরণ করে। তাই প্রায়ই বাংলাদেশে তারিখ একদিন পরে হয়, যদিও কখনো কখনো একই দিনে হয়।' }
    : { q: 'Why is Eid in Bangladesh often a day after Saudi Arabia?', a: 'Bangladesh starts months from crescent sighting in its own sky, while Saudi Arabia follows the calculated Umm al-Qura calendar. The Bangladesh date is therefore often a day later, though sometimes the two coincide.' })
  const timeline = items.map((o) => {
    const c = EVENTS[o.slug]
    const y = o.primary.saudi.y
    const d = occDates(o, l)
    const sa = instantIso(o.slug === 'ashura' || o.slug === 'white-days' ? o.start : o.primary.saudi, 'saudi', o.slug === 'laylatul-qadr' ? 18 : 0)
    const bd = instantIso(o.slug === 'ashura' || o.slug === 'white-days' ? o.bdStart : o.primary.bangladesh, 'bangladesh', o.slug === 'laylatul-qadr' ? 18 : 0)
    const upcomingSa = daysBetween(today, o.slug === 'ashura' || o.slug === 'white-days' ? o.start : o.primary.saudi) >= 0
    const iso = upcomingSa ? sa : bd
    const days = daysBetween(today, upcomingSa ? (o.slug === 'ashura' || o.slug === 'white-days' ? o.start : o.primary.saudi) : (o.slug === 'ashura' || o.slug === 'white-days' ? o.bdStart : o.primary.bangladesh))
    return { o, c, y, d, iso, days }
  })
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({
        name: HUB_TITLE(today.y, locale).split(' | ')[0], path, inLanguage: locale,
        description: 'Upcoming Islamic events with dates for Saudi Arabia (Umm al-Qura) and Bangladesh (expected).',
        items: timeline.map(({ o, c, y }) => ({ name: `${c.name.en} ${y}`, href: localeHref(locale, eventPath(o.slug, y)) })),
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'ইসলামি দিবস' : 'Islamic Events', ar: 'المناسبات الإسلامية', href: '/events' }]} className="mb-4" />
      <PageHero
        eyebrow={T3(locale, 'Next 12 months', 'আগামী ১২ মাস', 'الأشهر الاثنا عشر القادمة')}
        icon="calendar"
        title={bn ? <>ইসলামি দিবস কবে? ঈদ, রমজান, শবে কদর ও আশুরার তারিখ</> : <>Islamic Events: Dates of Eid, Ramadan, Laylatul Qadr &amp; More</>}
        subtitle={T3(locale, 'An upcoming-events timeline with countdowns, computed from the Umm al-Qura calendar, side by side with the expected date in Bangladesh and South Asia.', 'উম্মুল কুরা ক্যালেন্ডার থেকে হিসাব করা আসন্ন দিবসের সময়রেখা ও কাউন্টডাউন — পাশাপাশি বাংলাদেশ ও দক্ষিণ এশিয়ার সম্ভাব্য তারিখ।', 'جدول المناسبات القادمة مع عدٍّ تنازلي، محسوب من تقويم أم القرى ومعه التاريخ المتوقع في بنغلاديش.')}
      />
      <SightingNote locale={locale} className="mt-6" />

      <section className="mt-10" aria-labelledby="timeline-h">
        <h2 id="timeline-h" className="font-display mb-4 text-2xl font-semibold">{T3(locale, 'Upcoming events', 'আসন্ন দিবস', 'المناسبات القادمة')}</h2>
        <ol className="grid gap-4" data-testid="events-timeline">
          {timeline.map(({ o, c, y, d, iso, days }) => (
            <li key={`${o.slug}-${o.hijriYear}-${o.hijriMonth}`} data-event={o.slug} className="card-soft rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display flex items-center gap-2 text-xl font-semibold">
                    <UiIcon name={c.icon} size={24} />
                    <Link href={localeHref(locale, eventPath(o.slug, y))} className="hover:text-primary hover:underline">{bn ? c.name.bn : <>{L(locale, c.name)}</>} {bn ? bnY(y) : y}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{hijriText(o, l)}</p>
                </div>
                <DaysUntil iso={iso} initialDays={days} />
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-accent/60 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-primary">{L(locale, SAUDI_LABEL)}</dt>
                  <dd className="font-display mt-1 text-lg font-semibold leading-snug" data-col="saudi">{d.saudi}</dd>
                </div>
                <div className="rounded-2xl bg-gold-soft/50 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-gold">{L(locale, BD_LABEL)}</dt>
                  <dd className="font-display mt-1 text-lg font-semibold leading-snug" data-col="bangladesh">{d.bangladesh}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="all-h">
        <h2 id="all-h" className="font-display mb-4 text-2xl font-semibold">{T3(locale, 'Guides to each event', 'প্রতিটি দিবসের গাইড', 'دليل كل مناسبة')}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {EVENT_SLUGS.map((s) => {
            const c = EVENTS[s]
            const o = next(s)
            return (
              <li key={s}>
                <Link href={localeHref(locale, eventPath(s))} className="card-soft lift flex items-center gap-3 rounded-3xl p-4">
                  <UiIcon name={c.icon} size={32} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{bn ? c.name.bn : L(locale, c.name)}</span>
                    <span className="block text-sm text-muted-foreground">{S(locale, c.hijriLabel)} · {occDates(o, l, false).saudi}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={localeHref(locale, `/ramadan/${nextOccurrence('ramadan-start', today).primary.saudi.y}`)} className={chipCls}>{T3(locale, 'Ramadan sehri & iftar timetable', 'রমজানের সেহরি ও ইফতারের সময়সূচি', 'جدول رمضان')}</Link>
          <Link href={localeHref(locale, '/hijri-date')} className={chipCls}>{T3(locale, 'Hijri date today', 'আজকের হিজরি তারিখ', 'التاريخ الهجري اليوم')}</Link>
          <Link href={localeHref(locale, '/dua')} className={chipCls}>{T3(locale, 'Duas', 'দোয়া', 'الأدعية')}</Link>
        </div>
      </section>

      <Faq faqs={faqs} locale={locale} />
      <CiteThis locale={locale} title={bn ? 'ইসলামি দিবসের তারিখ' : 'Islamic events calendar'} url={absoluteUrl(path)} note={bn ? 'উম্মুল কুরা; বাংলাদেশ সম্ভাব্য' : 'Umm al-Qura; Bangladesh expected'} />
    </div>
  )
}

/* ───────────── /events/{event} and /events/{event}/{year} ───────────── */

export function eventMetaFor(locale: Locale, slug: EventSlug, year: number | null, occ: EventOccurrence): Metadata {
  const c = EVENTS[slug]
  const y = year ?? occ.primary.saudi.y
  const l = locale === 'bn' ? 'bn' : 'en'
  const d = occDates(occ, l, false)
  const name = locale === 'bn' ? BN_SHORT[slug] : c.name.en
  const Y = locale === 'bn' ? bnY(y) : String(y)
  const description = locale === 'bn'
    ? `${name} ${Y} সৌদি আরবে (উম্মুল কুরা) ${d.saudi} — বাংলাদেশে সম্ভাব্য ${d.bangladesh} (সাধারণত +১ দিন, চাঁদ দেখা সাপেক্ষে)। ${hijriText(occ, 'bn')}, কাউন্টডাউন, কুরআন-হাদিসের উৎস ও আগামী ৫ বছরের তারিখ।`
    : `${name} ${Y}: ${d.saudi} in Saudi Arabia (Umm al-Qura), expected ${d.bangladesh} in Bangladesh (usually +1 day, subject to moon sighting). ${hijriText(occ, 'en')}, countdown, Quran & hadith sources and dates for the next 5 years.`
  return buildMeta({
    title: eventTitle(slug, year, bnY(year ?? y), locale),
    description,
    keywords: [`${c.name.en} ${y}`, `${c.name.en} ${y} date`, `${c.name.en} ${y} Bangladesh`, `${c.name.en} ${y} Saudi Arabia`, `${BN_SHORT[slug]} ${bnY(y)} কবে`, `${BN_SHORT[slug]} কবে`, ...c.alt, ...c.alt.slice(0, 3).map((a) => `${a} ${y}`)],
    path: eventPath(slug, year),
    locale,
    markdown: true,
  })
}

export async function eventMeta(locale: Locale, { params }: EventProps): Promise<Metadata> {
  const slug = loadSlug((await params).event)
  return eventMetaFor(locale, slug, null, nextOccurrence(slug, nowYmd()))
}
export async function eventYearMeta(locale: Locale, { params }: EventYearProps): Promise<Metadata> {
  const p = await params
  const { slug, y, occs } = loadYear(p.event, p.year)
  return eventMetaFor(locale, slug, y, focusOf(occs, nowYmd()))
}

export async function EventPage({ locale, params }: { locale: Locale } & EventProps) {
  const slug = loadSlug((await params).event)
  const today = nowYmd()
  const o = nextOccurrence(slug, today)
  return <EventView locale={locale} slug={slug} year={null} occs={occurrencesInYear(slug, o.primary.saudi.y)} focus={o} today={today} />
}
export async function EventYearPage({ locale, params }: { locale: Locale } & EventYearProps) {
  const p = await params
  const { slug, y, occs } = loadYear(p.event, p.year)
  const today = nowYmd()
  return <EventView locale={locale} slug={slug} year={y} occs={occs} focus={focusOf(occs, today)} today={today} />
}

function EventView({ locale, slug, year, occs, focus: o, today }: { locale: Locale; slug: EventSlug; year: number | null; occs: EventOccurrence[]; focus: EventOccurrence; today: Ymd }) {
  const c = EVENTS[slug]
  const bn = locale === 'bn'
  const l = bn ? 'bn' : 'en'
  const y = year ?? o.primary.saudi.y
  const Y = bn ? bnY(y) : String(y)
  const path = localeHref(locale, eventPath(slug, year))
  const name = bn ? BN_SHORT[slug] : c.name.en
  const faqs = buildFaqs(c, o, occs, y, locale)
  const title = eventTitle(slug, year, bnY(y), locale).split(' | ')[0]
  const monthly = slug === 'white-days'
  const dayRows = slug === 'laylatul-qadr' || slug === 'ashura'
  const future = futureOccurrences(slug, today)
  const yearsNav = eventYears(today.y)
  const rowLink = (x: EventOccurrence) => (validEventYear(x.primary.saudi.y, today.y) ? localeHref(locale, eventPath(slug, x.primary.saudi.y)) : undefined)
  const answer = answerText(c, o, y, locale)
  return (
    <div className={pageShell}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString(), about: { '@id': `${absoluteUrl(path)}#event` } }} />
      <JsonLd data={eventLd({ content: c, occ: o, name: `${name} ${y}`, description: answer, path, locale: l })} />
      <Breadcrumbs
        locale={locale}
        items={[
          { name: bn ? 'ইসলামি দিবস' : 'Islamic Events', ar: 'المناسبات الإسلامية', href: '/events' },
          { name: bn ? c.name.bn : c.name.en, ar: c.name.ar, href: eventPath(slug) },
          ...(year ? [{ name: String(year), href: eventPath(slug, year) }] : []),
        ]}
        className="mb-4"
      />
      <PageHero
        eyebrow={S(locale, c.hijriLabel)}
        icon={c.icon}
        arabic={c.name.ar}
        title={year
          ? bn ? <>{name} {Y} কবে? বাংলাদেশ ও সৌদি আরবের তারিখ</> : <>{name} {Y}: Date in Bangladesh &amp; Saudi Arabia</>
          : bn ? <>{c.name.bn} কবে? পরবর্তী তারিখ ({Y})</> : <>{name}: Next Date ({Y}) in Bangladesh &amp; Saudi Arabia</>}
        subtitle={answer}
      >
        <DateBoxes locale={locale} o={o} />
        <div className="mt-4"><EventCountdown targets={targetsFor(locale, o)} /></div>
        {occs.length > 1 && !monthly && (
          <p className="mt-4 text-sm text-muted-foreground">{T3(locale, `${name} falls twice in ${y}; the second date is in the table below.`, `${bnY(y)} সালে ${name} দুবার পড়ছে; দ্বিতীয় তারিখ নিচের সারণিতে।`)}</p>
        )}
      </PageHero>
      <SightingNote locale={locale} className="mt-6" />

      <section className="mt-12" aria-labelledby="what-h">
        <h2 id="what-h" className="font-display mb-3 text-2xl font-semibold">{bn ? `${c.name.bn} কী?` : <>{T3(locale, `What is ${c.name.en}?`, '', `ما هو ${c.name.ar}؟`)}</>}</h2>
        <p className="text-lg leading-relaxed text-foreground/90">{L(locale, c.summary)}</p>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
          {c.what.map((p, i) => <p key={i}>{L(locale, p)}</p>)}
        </div>
        {c.observe.length > 0 && (
          <ul className="mt-4 list-disc space-y-1.5 ps-5 text-[15px] leading-relaxed text-muted-foreground">
            {c.observe.map((p, i) => <li key={i}>{L(locale, p)}</li>)}
          </ul>
        )}
      </section>

      {(dayRows || occs.length > 1 || monthly) && (
        <section className="mt-12" aria-labelledby="year-h">
          <h2 id="year-h" className="font-display mb-3 text-2xl font-semibold">
            {monthly ? T3(locale, `White days in ${y}`, `${bnY(y)} সালের আইয়ামে বীজ`, `الأيام البيض ${y}`) : dayRows ? T3(locale, `${name} ${y}: day by day`, `${name} ${bnY(y)}: দিন অনুযায়ী`, `${c.name.ar}: يومًا بيوم`) : T3(locale, `Dates in ${y}`, `${bnY(y)} সালের তারিখ`, `تواريخ ${y}`)}
          </h2>
          {monthly || (occs.length > 1 && !dayRows)
            ? <DateTable locale={locale} rows={occs.map((x) => ({ o: x }))} caption={`${name} ${y}`} />
            : <DayRows locale={locale} o={o} />}
          {dayRows && occs.length > 1 && <div className="mt-4"><DateTable locale={locale} rows={occs.map((x) => ({ o: x }))} caption={`${name} ${y}`} withNight={slug === 'laylatul-qadr'} /></div>}
        </section>
      )}

      <section className="mt-12" aria-labelledby="future-h">
        <h2 id="future-h" className="font-display mb-3 text-2xl font-semibold">
          {monthly ? T3(locale, 'Upcoming white days', 'আগামী আইয়ামে বীজ', 'الأيام البيض القادمة') : T3(locale, `${name} dates for the next 5 years`, `আগামী ৫ বছরের ${name}র তারিখ`, `تواريخ ${c.name.ar} للسنوات الخمس القادمة`)}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">{T3(locale, 'Gregorian and Hijri dates, Saudi Arabia (Umm al-Qura) vs Bangladesh / South Asia (expected). Tap a Hijri date to open that year.', 'ইংরেজি ও হিজরি তারিখ — সৌদি আরব (উম্মুল কুরা) বনাম বাংলাদেশ / দক্ষিণ এশিয়া (সম্ভাব্য)। হিজরি তারিখে ট্যাপ করে সেই বছরের পাতায় যান।', 'التواريخ الميلادية والهجرية: السعودية (أم القرى) مقابل بنغلاديش (متوقع).')}</p>
        <DateTable locale={locale} rows={future.map((x) => ({ o: x, link: rowLink(x) }))} caption={`${name} ${bn ? 'আগামী বছরগুলো' : 'next years'}`} withNight={slug === 'laylatul-qadr'} />
      </section>

      <Quran locale={locale} c={c} />
      <HadithList locale={locale} c={c} />
      <Duas locale={locale} c={c} />

      <section className="mt-12" aria-labelledby="more-h">
        <h2 id="more-h" className="font-display mb-3 text-2xl font-semibold">{T3(locale, 'Related', 'আরও দেখুন', 'ذات صلة')}</h2>
        <div className="flex flex-wrap gap-2">
          {c.related.map((r) => <Link key={r.href} href={localeHref(locale, r.href)} className={chipCls}>{L(locale, r.label)}</Link>)}
        </div>
        {year && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label={bn ? 'বছর' : 'Years'}>
            {yearsNav.map((yy) => (
              <Link key={yy} href={localeHref(locale, eventPath(slug, yy))} aria-current={yy === y ? 'page' : undefined} className={`${chipCls} ${yy === y ? 'border-primary bg-accent' : ''}`}>{name} {bn ? bnY(yy) : yy}</Link>
            ))}
          </div>
        )}
        {!year && (
          <div className="mt-4 flex flex-wrap gap-2">
            {yearsNav.slice(1, 4).map((yy) => <Link key={yy} href={localeHref(locale, eventPath(slug, yy))} className={chipCls}>{name} {bn ? bnY(yy) : yy}</Link>)}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {EVENT_SLUGS.filter((s) => s !== slug).map((s) => <Link key={s} href={localeHref(locale, eventPath(s))} className={chipCls}>{bn ? EVENTS[s].name.bn : L(locale, EVENTS[s].name)}</Link>)}
          <Link href={localeHref(locale, '/events')} className={chipCls}>{T3(locale, 'All Islamic events', 'সব ইসলামি দিবস', 'كل المناسبات')}</Link>
        </div>
      </section>

      <Faq faqs={faqs} locale={locale} />
      <CiteThis locale={locale} title={`${name} ${y}: ${bn ? 'তারিখ' : 'date'}`} url={absoluteUrl(path)} note={bn ? 'উম্মুল কুরা; বাংলাদেশ সম্ভাব্য' : 'Umm al-Qura; Bangladesh expected'} />
    </div>
  )
}
