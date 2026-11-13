import Link from 'next/link'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { UiIcon } from '@/components/ui-icon'
import { RamadanTable, type RamadanRow } from '@/components/places/ramadan-table'
import { CityChips, PrintStyles, chipCls } from '@/components/places/city-ui'
import { PrintButton } from '@/components/places/city-live'
import { buildMeta } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/site'
import { bdCities, bnGenitive, cities, cityTitle, countryName, divisionalCities, nearbyCities, resolveCity, worldCities, type City } from '@/lib/places/cities'
import { bnDigits, cityDay, citySpan, fmtClock, fmtDate, WEEKDAYS, zonedYmd } from '@/lib/places/times'
import { currentOrNextRamadan, fmtHijri, parseRamadanSlug, ramadanForYear, ramadanLabel, ramadanOf, ramadanPath, ramadanSlug, ramadansInGregorianYear, type RamadanRange } from '@/lib/places/hijri'
import { addDays, ymdKey } from '@/lib/places/dates'
import { monthKey } from '@/lib/places/export'

const DHAKA = cities.find((c) => c.slug === 'dhaka')!
const todayYmd = () => zonedYmd(Date.now(), DHAKA.tz)
const nowRange = () => currentOrNextRamadan(todayYmd()).range

/** Gregorian years whose Ramadan pages exist: last Ramadan … five after the upcoming one (and a Ramadan must start in them). */
export function validRamadanYear(y: number) {
  const y0 = nowRange().start.y
  return Number.isInteger(y) && y >= y0 - 1 && y <= y0 + 5 && ramadansInGregorianYear(y).length > 0
}

export type YearProps = { params: Promise<{ year: string }> }
export type RamadanCityProps = { params: Promise<{ year: string; city: string }> }

/**
 * URL scheme (see docs/ARCHITECTURE.md): `/ramadan/{gregorianYear}` while only one Ramadan starts in that year,
 * `/ramadan/{hijriYear}-ah` for each of two Ramadans in one year (2030: 1451-ah + 1452-ah), and `/ramadan/{gregorianYear}`
 * then becomes a chooser. `/ramadan/1448-ah` for a single-Ramadan year redirects to `/ramadan/2027`.
 */
type Target = { kind: 'ramadan'; r: RamadanRange } | { kind: 'chooser'; year: number; list: RamadanRange[] }

function loadTarget(slug: string, locale: Locale, rest = ''): Target {
  const s = parseRamadanSlug(slug)
  if (!s) notFound()
  if (s.kind === 'year') {
    if (!validRamadanYear(s.year)) notFound()
    const list = ramadansInGregorianYear(s.year)
    if (list.length > 1) return { kind: 'chooser', year: s.year, list }
    return { kind: 'ramadan', r: list[0] }
  }
  const r = ramadanOf(s.hijriYear)
  if (!validRamadanYear(r.start.y)) notFound()
  const only = ramadansInGregorianYear(r.start.y).length < 2
  if (only) permanentRedirect(localeHref(locale, `/ramadan/${r.start.y}${rest}`))
  return { kind: 'ramadan', r }
}

export const ramadanYearParams = () => {
  const y0 = nowRange().start.y
  return [y0, y0 + 1].filter(validRamadanYear).flatMap((y) => {
    const list = ramadansInGregorianYear(y)
    return [{ year: String(y) }, ...(list.length > 1 ? list.map((r) => ({ year: ramadanSlug(r) })) : [])]
  })
}
export const ramadanCityParams = () => {
  const slug = ramadanSlug(nowRange())
  return cities.map((c) => ({ year: slug, city: c.slug }))
}

const nm = (locale: Locale, y: number | string) => (locale === 'bn' ? bnDigits(y) : String(y))
const p = (locale: Locale, en: string, bn: string) => (locale === 'bn' ? bn : en)

/** /ramadan → the running or upcoming Ramadan. */
export function RamadanIndexPage({ locale }: { locale: Locale }): never {
  redirect(localeHref(locale, ramadanPath(nowRange())))
}

function Notice({ locale, r }: { locale: Locale; r: RamadanRange }) {
  return (
    <div className="rounded-3xl border border-gold/40 bg-gold-soft/40 p-5 text-sm leading-relaxed" role="note">
      <h2 className="font-display mb-1 flex items-center gap-2 text-base font-semibold"><UiIcon name="crescent" size={20} /> {lt(locale, { en: 'Start date depends on moon sighting', bn: 'শুরুর তারিখ চাঁদ দেখার উপর নির্ভর করে', ar: 'بداية الشهر تتبع رؤية الهلال' })}</h2>
      <p className="text-muted-foreground">
        {lt(locale, {
          en: `Dates here follow the Umm al-Qura calendar (Saudi Arabia): 1 Ramadan ${r.hijriYear} AH = ${fmtDate(r.start, 'en', { weekday: true })}. The actual start is decided by moon sighting in each country, so it can fall a day earlier or later (±1 day) — Bangladesh, India and Pakistan frequently begin a day after Saudi Arabia. Use the day-numbering switch on the timetable, and follow your national announcement. The sehri and iftar times themselves depend only on the calendar date and your city.`,
          bn: `এখানকার তারিখ উম্মুল কুরা ক্যালেন্ডার (সৌদি আরব) অনুযায়ী: ১ রমজান ${bnDigits(r.hijriYear)} হিজরি = ${fmtDate(r.start, 'bn', { weekday: true })}। প্রকৃত শুরু প্রতিটি দেশে চাঁদ দেখার উপর নির্ভর করে, তাই এক দিন আগে বা পরে (±১ দিন) হতে পারে — বাংলাদেশ, ভারত ও পাকিস্তানে প্রায়ই সৌদি আরবের একদিন পরে রমজান শুরু হয়। সময়সূচির দিন গণনার সুইচ ব্যবহার করুন এবং আপনার দেশের সরকারি ঘোষণা অনুসরণ করুন। সেহরি ও ইফতারের সময় শুধু ইংরেজি তারিখ ও শহরের উপর নির্ভর করে।`,
          ar: 'التواريخ وفق تقويم أم القرى، ويُحدَّد الشهر فعليًا برؤية الهلال في كل بلد، فقد يختلف بيوم. تعتمد أوقات السحور والإفطار على التاريخ الميلادي والمدينة فقط.',
        })}
      </p>
    </div>
  )
}

function Duas({ locale }: { locale: Locale }) {
  const dl = (s: string) => localeHref(locale, `/dua/${s}`)
  return (
    <section className="mt-12" aria-labelledby="dua-h">
      <h2 id="dua-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: 'Duas for sehri and iftar', bn: 'সেহরি ও ইফতারের দোয়া', ar: 'أدعية السحور والإفطار' })}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="card-soft rounded-3xl p-5">
          <h3 className="font-semibold">{lt(locale, { en: 'At sehri', bn: 'সেহরিতে', ar: 'عند السحور' })}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {lt(locale, {
              en: 'The Prophet ﷺ said: “Take suhur, for in suhur there is blessing.” (Sahih al-Bukhari 1923, Sahih Muslim 1095). The intention (niyyah) for the fast is made in the heart; no specific wording is required. Begin the meal with “Bismillah” and thank Allah when you finish.',
              bn: 'রাসূলুল্লাহ ﷺ বলেছেন: “তোমরা সাহরি খাও, কারণ সাহরিতে বরকত আছে।” (সহীহ বুখারী ১৯২৩, সহীহ মুসলিম ১০৯৫)। রোজার নিয়ত অন্তরে করা হয়, নির্দিষ্ট কোনো শব্দ আবশ্যক নয়। বিসমিল্লাহ বলে শুরু করুন এবং শেষে আল্লাহর শুকরিয়া আদায় করুন।',
              ar: 'قال النبي ﷺ: «تسحروا فإن في السحور بركة» (البخاري ١٩٢٣، مسلم ١٠٩٥). والنية محلها القلب.',
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={dl('dua-before-eating')} className={chipCls}>{lt(locale, { en: 'Dua before eating', bn: 'খাওয়ার আগের দোয়া', ar: 'دعاء قبل الطعام' })}</Link>
            <Link href={dl('dua-after-eating')} className={chipCls}>{lt(locale, { en: 'Dua after eating', bn: 'খাওয়ার পরের দোয়া', ar: 'دعاء بعد الطعام' })}</Link>
          </div>
        </article>
        <article className="card-soft rounded-3xl p-5">
          <h3 className="font-semibold">{lt(locale, { en: 'At iftar', bn: 'ইফতারে', ar: 'عند الإفطار' })}</h3>
          <p lang="ar" dir="rtl" className="font-arabic mt-2 text-2xl leading-[2] text-arabic">ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ</p>
          <p className="mt-1 text-sm italic text-muted-foreground">Dhahaba az-zama’u wabtallatil-‘urūqu wa thabatal-ajru in shā’ Allāh.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {lt(locale, {
              en: '“The thirst has gone, the veins are moist, and the reward is confirmed, if Allah wills.” — said by the Prophet ﷺ when breaking the fast (Sunan Abi Dawud 2357).',
              bn: '“পিপাসা মিটেছে, শিরা-উপশিরা সিক্ত হয়েছে এবং আল্লাহ চাইলে প্রতিদান নিশ্চিত হয়েছে।” — রাসূলুল্লাহ ﷺ ইফতারের সময় এটি বলতেন (সুনান আবূ দাঊদ ২৩৫৭)।',
              ar: 'كان النبي ﷺ يقول عند الإفطار (سنن أبي داود ٢٣٥٧).',
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={dl('dua-for-breaking-fast-iftar')} className={chipCls}>{lt(locale, { en: 'Iftar dua page', bn: 'ইফতারের দোয়া', ar: 'دعاء الإفطار' })}</Link>
            <Link href={dl('dua-laylatul-qadr')} className={chipCls}>{lt(locale, { en: 'Dua for Laylatul Qadr', bn: 'শবে কদরের দোয়া', ar: 'دعاء ليلة القدر' })}</Link>
            <Link href={localeHref(locale, '/dua')} className={chipCls}>{lt(locale, { en: 'All duas', bn: 'সব দোয়া', ar: 'كل الأدعية' })}</Link>
          </div>
        </article>
      </div>
    </section>
  )
}

function YearLinks({ locale, r, city }: { locale: Locale; r: RamadanRange; city?: City }) {
  const rs = [ramadanOf(r.hijriYear - 1), ramadanOf(r.hijriYear + 1)].filter((x) => validRamadanYear(x.start.y))
  if (!rs.length) return null
  return (
    <div data-print-hide className="mt-6 flex flex-wrap gap-2">
      {rs.map((x) => (
        <Link key={x.hijriYear} href={localeHref(locale, `${ramadanPath(x)}${city ? `/${city.slug}` : ''}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${ramadanLabel(x, 'en')}`, bn: `রমজান ${ramadanLabel(x, 'bn')}`, ar: `رمضان ${ramadanLabel(x, 'ar')}` })}</Link>
      ))}
    </div>
  )
}

/* ───────────── /ramadan/{year} ───────────── */

export async function ramadanYearMeta(locale: Locale, { params }: YearProps): Promise<Metadata> {
  const { year } = await params
  const t = loadTarget(year, locale)
  if (t.kind === 'chooser') return chooserMeta(locale, t.year, t.list)
  const r = t.r
  const y = r.start.y
  const yl = ramadanLabel(r, 'en'), yb = ramadanLabel(r, 'bn'), ya = ramadanLabel(r, 'ar')
  return buildMeta({
    title: locale === 'bn'
      ? `রমজান ${yb} — সেহরি ও ইফতারের সময়সূচি, রমজান কবে শুরু | বাংলাদেশের সব জেলা`
      : `Ramadan ${yl} — Start Date, Sehri & Iftar Timetable for Bangladesh & the World | রমজান ${yb}`,
    description: locale === 'bn'
      ? `রমজান ${yb} (${bnDigits(r.hijriYear)} হিজরি) উম্মুল কুরা অনুযায়ী ${fmtDate(r.start, 'bn')} থেকে শুরু। ঢাকা, চট্টগ্রাম, রাজশাহী, সিলেটসহ ৬৪ জেলা ও বিশ্বের শহরের সেহরি ও ইফতারের সময়সূচি। চাঁদ দেখার উপর নির্ভর করে ±১ দিন পার্থক্য হতে পারে।`
      : `Ramadan ${yl} (${r.hijriYear} AH) begins around ${fmtDate(r.start, 'en')} by the Umm al-Qura calendar. Sehri and iftar timetables for Dhaka, Chattogram, Rajshahi, Sylhet and all 64 districts of Bangladesh plus major world cities. Start depends on moon sighting (±1 day).`,
    keywords: [`Ramadan ${yl}`, `Ramadan ${yl} calendar`, `Ramadan ${yl} start date`, `sehri iftar time ${yl}`, `Ramadan timetable ${yl} Bangladesh`, `রমজান ${yb}`, `সেহরি ইফতারের সময়সূচি ${yb}`, `রমজানের ক্যালেন্ডার ${yb}`, 'রমজান কবে শুরু'],
    path: `/ramadan/${ramadanSlug(r)}`,
    locale,
  })
}

export async function RamadanYearPage({ locale, params }: { locale: Locale } & YearProps) {
  const { year } = await params
  const t = loadTarget(year, locale)
  if (t.kind === 'chooser') return <RamadanChooser locale={locale} year={t.year} list={t.list} />
  const r = t.r
  const y = r.start.y
  const yl = ramadanLabel(r, 'en'), yb = ramadanLabel(r, 'bn'), ya = ramadanLabel(r, 'ar')
  const slug = ramadanSlug(r)
  const qy = addDays(r.start, 25).y
  const bn = locale === 'bn'
  const path = localeHref(locale, `/ramadan/${slug}`)
  const first = (c: City) => cityDay(c, r.start)
  const days = r.days
  const faqs = bn
    ? [
        { q: `রমজান ${yb} কবে শুরু?`, a: `উম্মুল কুরা (সৌদি) ক্যালেন্ডার অনুযায়ী ১ রমজান ${bnDigits(r.hijriYear)} হিজরি = ${fmtDate(r.start, 'bn', { weekday: true })}। বাংলাদেশে চাঁদ দেখা সাপেক্ষে প্রায়ই একদিন পরে শুরু হয়; সরকারি ঘোষণা অনুসরণ করুন।` },
        { q: `রমজান ${yb} কত দিনের হবে?`, a: `উম্মুল কুরা অনুযায়ী ${bnDigits(days)} দিন; চাঁদ দেখার ভিত্তিতে ২৯ বা ৩০ দিন হয়।` },
        { q: `ঈদুল ফিতর ${yb} কবে?`, a: `উম্মুল কুরা অনুযায়ী ১ শাওয়াল = ${fmtDate(r.eid, 'bn', { weekday: true })}। চাঁদ দেখার উপর নির্ভর করে একদিন আগে-পরে হতে পারে।` },
        { q: `সেহরির শেষ সময় ও ইফতারের সময় কীভাবে নির্ধারিত হয়?`, a: `সেহরির শেষ সময় ফজরের ওয়াক্ত শুরুর সময় এবং ইফতারের সময় সূর্যাস্ত (মাগরিব)। শহরভেদে কয়েক মিনিট পার্থক্য থাকে, তাই আপনার শহরের সময়সূচি দেখুন।` },
      ]
    : [
        { q: `When does Ramadan ${yl} start?`, a: `By the Umm al-Qura (Saudi) calendar, 1 Ramadan ${r.hijriYear} AH is ${fmtDate(r.start, 'en', { weekday: true })}. Countries that rely on local moon sighting, including Bangladesh, India and Pakistan, often start a day later — follow your national announcement.` },
        { q: `How many days is Ramadan ${yl}?`, a: `${days} days by the Umm al-Qura calendar; with moon sighting it is 29 or 30 days.` },
        { q: `When is Eid al-Fitr ${yl}?`, a: `1 Shawwal ${r.hijriYear} AH falls on ${fmtDate(r.eid, 'en', { weekday: true })} by Umm al-Qura, and may differ by a day depending on moon sighting.` },
        { q: `How are sehri and iftar times determined?`, a: `Sehri ends when Fajr begins and iftar is at sunset (Maghrib). Times differ by a few minutes between cities, so open the timetable for your city.` },
      ]

  return (
    <div className={pageShell}>
      <PrintStyles />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: `Ramadan ${yl}`, url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString(), about: { '@type': 'Event', name: `Ramadan ${yl}`, startDate: `${r.start.y}-${String(r.start.m).padStart(2, '0')}-${String(r.start.d).padStart(2, '0')}`, endDate: `${r.end.y}-${String(r.end.m).padStart(2, '0')}-${String(r.end.d).padStart(2, '0')}` } }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'রমজান' : 'Ramadan', ar: 'رمضان', href: '/ramadan' }, { name: bn ? yb : yl, href: `/ramadan/${slug}` }]} className="mb-4" />
      <PageHero
        eyebrow={lt(locale, { en: `${r.hijriYear} AH`, bn: `${bnDigits(r.hijriYear)} হিজরি`, ar: `${r.hijriYear} هـ` })}
        icon="crescent"
        title={bn ? <>রমজান {yb} — সেহরি ও ইফতারের সময়সূচি</> : <>Ramadan {yl} — Sehri &amp; Iftar Timetable</>}
        subtitle={bn
          ? <>উম্মুল কুরা অনুযায়ী ১ রমজান: {fmtDate(r.start, 'bn', { weekday: true })} · শেষ রোজা: {fmtDate(r.end, 'bn')} · ঈদুল ফিতর: {fmtDate(r.eid, 'bn')}</>
          : <>1 Ramadan (Umm al-Qura): {fmtDate(r.start, 'en', { weekday: true })} · last fast: {fmtDate(r.end, 'en')} · Eid al-Fitr: {fmtDate(r.eid, 'en')}</>}
      />
      <div className="mt-6"><Notice locale={locale} r={r} /></div>
      <div data-print-hide className="mt-4 flex flex-wrap gap-2" aria-label={bn ? 'সংশ্লিষ্ট ইসলামি দিবস' : 'Related Islamic events'}>
        <Link href={localeHref(locale, `/events/ramadan-start/${r.start.y}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${r.start.y} start date`, bn: `রমজান ${bnDigits(r.start.y)} কবে শুরু`, ar: `بداية رمضان ${r.start.y}` })}</Link>
        <Link href={localeHref(locale, `/events/laylatul-qadr/${qy}`)} className={chipCls}>{lt(locale, { en: `Laylatul Qadr ${qy}`, bn: `শবে কদর ${bnDigits(qy)} কবে`, ar: `ليلة القدر ${qy}` })}</Link>
        <Link href={localeHref(locale, `/events/eid-al-fitr/${r.eid.y}`)} className={chipCls}>{lt(locale, { en: `Eid ul Fitr ${r.eid.y}`, bn: `ঈদুল ফিতর ${bnDigits(r.eid.y)} কবে`, ar: `عيد الفطر ${r.eid.y}` })}</Link>
        <Link href={localeHref(locale, '/events')} className={chipCls}>{lt(locale, { en: 'All Islamic events', bn: 'সব ইসলামি দিবস', ar: 'كل المناسبات' })}</Link>
      </div>

      <section className="mt-10" aria-labelledby="div-h">
        <h2 id="div-h" className="font-display mb-2 text-2xl font-semibold">{lt(locale, { en: 'Divisional cities — first day of Ramadan', bn: 'বিভাগীয় শহর — রমজানের প্রথম দিন', ar: 'مدن الأقسام — اليوم الأول' })}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{lt(locale, { en: `Times for ${fmtDate(r.start, 'en')}. Tap a city for the full 30-day timetable.`, bn: `${fmtDate(r.start, 'bn')} তারিখের সময়। পূর্ণ ৩০ দিনের সময়সূচির জন্য শহরে ট্যাপ করুন।`, ar: 'اضغط على المدينة لعرض الجدول كاملًا.' })}</p>
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <caption className="sr-only">{p(locale, `First day of Ramadan ${yl}, sehri and iftar by division`, `রমজান ${yb} প্রথম দিনের সেহরি ও ইফতার`)}</caption>
            <thead className="bg-surface-2/70"><tr>
              <th scope="col" className="px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'City', bn: 'শহর', ar: 'المدينة' })}</th>
              <th scope="col" className="px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'Sehri ends', bn: 'সেহরির শেষ', ar: 'نهاية السحور' })}</th>
              <th scope="col" className="px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'Iftar', bn: 'ইফতার', ar: 'الإفطار' })}</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {divisionalCities.map((c) => {
                const d = first(c)
                return (
                  <tr key={c.slug} className="odd:bg-surface-2/30">
                    <th scope="row" className="px-3 py-2.5 text-start font-medium"><Link href={localeHref(locale, `/ramadan/${slug}/${c.slug}`)} className="text-primary hover:underline">{bn ? c.name.bn : cityTitle(c, 'en')}</Link></th>
                    <td className="px-3 py-2.5 tabular-nums">{fmtClock(d.fajr, c.tz, locale)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{fmtClock(d.maghrib, c.tz, locale)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="bd-h">
        <h2 id="bd-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `All 64 districts of Bangladesh — Ramadan ${yl}`, bn: `বাংলাদেশের ৬৪ জেলা — রমজান ${yb}`, ar: `بنغلاديش — ٦٤ منطقة` })}</h2>
        <CityChips list={bdCities} locale={locale} path={`/ramadan/${slug}`} />
      </section>
      <section className="mt-10" aria-labelledby="world-h">
        <h2 id="world-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `World cities — Ramadan ${yl}`, bn: `বিশ্বের শহর — রমজান ${yb}`, ar: 'مدن العالم' })}</h2>
        <CityChips list={worldCities} locale={locale} path={`/ramadan/${slug}`} />
      </section>

      <Duas locale={locale} />
      <Faq faqs={faqs} locale={locale} />
      <YearLinks locale={locale} r={r} />
    </div>
  )
}

/* ───────────── /ramadan/{year} when two Ramadans start in that Gregorian year ───────────── */

function chooserMeta(locale: Locale, year: number, list: RamadanRange[]): Metadata {
  const [a, b] = list
  const bn = locale === 'bn'
  return buildMeta({
    title: bn
      ? `রমজান ${bnDigits(year)} — দুটি রমজান: ${bnDigits(a.hijriYear)} ও ${bnDigits(b.hijriYear)} হিজরি | সেহরি ও ইফতারের সময়সূচি`
      : `Ramadan ${year} — Two Ramadans: ${a.hijriYear} AH (${fmtDate(a.start, 'en', { year: false })}) & ${b.hijriYear} AH (${fmtDate(b.start, 'en', { year: false })}) | Sehri & Iftar Timetable`,
    description: bn
      ? `${bnDigits(year)} সালে দুবার রমজান শুরু হয়: ${bnDigits(a.hijriYear)} হিজরি (${fmtDate(a.start, 'bn')}) এবং ${bnDigits(b.hijriYear)} হিজরি (${fmtDate(b.start, 'bn')})। প্রতিটির সেহরি ও ইফতারের সময়সূচি দেখুন।`
      : `Two Ramadans begin in ${year}: ${a.hijriYear} AH on ${fmtDate(a.start, 'en')} and ${b.hijriYear} AH on ${fmtDate(b.start, 'en')} (Umm al-Qura). Pick one for its sehri and iftar timetable.`,
    keywords: [`Ramadan ${year}`, `Ramadan ${year} start date`, `Ramadan ${year} calendar`, `রমজান ${bnDigits(year)}`, `Ramadan ${a.hijriYear}`, `Ramadan ${b.hijriYear}`],
    path: `/ramadan/${year}`,
    locale,
  })
}

function RamadanChooser({ locale, year, list }: { locale: Locale; year: number; list: RamadanRange[] }) {
  const bn = locale === 'bn'
  const path = localeHref(locale, `/ramadan/${year}`)
  const [a, b] = list
  const faqs = bn
    ? [
        { q: `${bnDigits(year)} সালে কেন দুবার রমজান?`, a: `হিজরি বছর প্রায় ৩৫৪ দিনের, ইংরেজি বছরের চেয়ে প্রায় ১১ দিন ছোট। তাই রমজান প্রতি বছর প্রায় ১১ দিন এগিয়ে আসে; ${bnDigits(year)} সালের শুরুতে (${fmtDate(a.start, 'bn')}) ও শেষে (${fmtDate(b.start, 'bn')}) দুটি রমজান শুরু হয়।` },
        { q: `${bnDigits(year)} সালের আগামী রমজান কোনটি?`, a: `যেটি চলমান বা সামনে আসছে সেটির পাতা খুলুন: ${bnDigits(a.hijriYear)} হিজরি (${fmtDate(a.start, 'bn')} – ${fmtDate(a.end, 'bn')}) অথবা ${bnDigits(b.hijriYear)} হিজরি (${fmtDate(b.start, 'bn')} – ${fmtDate(b.end, 'bn')})।` },
      ]
    : [
        { q: `Why are there two Ramadans in ${year}?`, a: `A Hijri year is about 354 days, roughly 11 days shorter than a Gregorian year, so Ramadan moves about 11 days earlier every year. In ${year} one Ramadan starts at the beginning of the year (${fmtDate(a.start, 'en')}) and the next at the end (${fmtDate(b.start, 'en')}).` },
        { q: `Which Ramadan of ${year} is the next one?`, a: `Open the one that is running or still ahead: ${a.hijriYear} AH (${fmtDate(a.start, 'en')} – ${fmtDate(a.end, 'en')}) or ${b.hijriYear} AH (${fmtDate(b.start, 'en')} – ${fmtDate(b.end, 'en')}).` },
      ]
  return (
    <div className={pageShell}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Ramadan ${year}`, url: absoluteUrl(path), inLanguage: locale, hasPart: list.map((r) => ({ '@type': 'Event', name: `Ramadan ${r.hijriYear} AH`, url: absoluteUrl(localeHref(locale, ramadanPath(r))), startDate: ymdKey(r.start), endDate: ymdKey(r.end) })) }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'রমজান' : 'Ramadan', ar: 'رمضان', href: '/ramadan' }, { name: `${year}`, href: `/ramadan/${year}` }]} className="mb-4" />
      <PageHero
        eyebrow={lt(locale, { en: 'Two Ramadans in one year', bn: 'এক বছরে দুই রমজান', ar: 'رمضانان في سنة ميلادية واحدة' })}
        icon="crescent"
        title={bn ? <>রমজান {bnDigits(year)} — দুটি রমজান</> : <>Ramadan {year} — two Ramadans</>}
        subtitle={bn ? <>{bnDigits(year)} সালে {bnDigits(a.hijriYear)} ও {bnDigits(b.hijriYear)} হিজরির রমজান শুরু হয়। যেটি দেখতে চান বেছে নিন।</> : <>Ramadan {a.hijriYear} AH and {b.hijriYear} AH both begin in {year}. Choose the one you need.</>}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((r) => (
          <article key={r.hijriYear} className="card-soft rounded-3xl p-6">
            <h2 className="font-display text-2xl font-semibold">{lt(locale, { en: `Ramadan ${r.hijriYear} AH`, bn: `রমজান ${bnDigits(r.hijriYear)} হিজরি`, ar: `رمضان ${r.hijriYear} هـ` })}</h2>
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div><dt className="inline font-medium text-foreground">{lt(locale, { en: '1 Ramadan', bn: '১ রমজান', ar: '١ رمضان' })}: </dt><dd className="inline">{fmtDate(r.start, bn ? 'bn' : 'en', { weekday: true })}</dd></div>
              <div><dt className="inline font-medium text-foreground">{lt(locale, { en: 'Last fast', bn: 'শেষ রোজা', ar: 'آخر يوم' })}: </dt><dd className="inline">{fmtDate(r.end, bn ? 'bn' : 'en')}</dd></div>
              <div><dt className="inline font-medium text-foreground">{lt(locale, { en: 'Eid al-Fitr', bn: 'ঈদুল ফিতর', ar: 'عيد الفطر' })}: </dt><dd className="inline">{fmtDate(r.eid, bn ? 'bn' : 'en')}</dd></div>
            </dl>
            <Link href={localeHref(locale, ramadanPath(r))} className={`${chipCls} mt-4`}>{lt(locale, { en: `Sehri & iftar timetable ${r.hijriYear} AH`, bn: `সেহরি ও ইফতারের সময়সূচি ${bnDigits(r.hijriYear)} হিজরি`, ar: `جدول رمضان ${r.hijriYear} هـ` })}</Link>
          </article>
        ))}
      </div>
      <Faq faqs={faqs} locale={locale} />
    </div>
  )
}

/* ───────────── /ramadan/{year}/{city} ───────────── */

function loadCity(citySlug: string, year: string, locale: Locale) {
  const t = loadTarget(year, locale, `/${citySlug}`)
  const city = resolveCity(citySlug)
  if (!city) notFound()
  // a bare year with two Ramadans has no city page of its own: go to the one running (or next) now
  if (t.kind === 'chooser') redirect(localeHref(locale, `/ramadan/${ramadanSlug(ramadanForYear(t.year, todayYmd())!)}/${city.slug}`))
  if (city.slug !== citySlug) permanentRedirect(localeHref(locale, `/ramadan/${ramadanSlug(t.r)}/${city.slug}`))
  return { r: t.r, city }
}

export async function ramadanCityMeta(locale: Locale, { params }: RamadanCityProps): Promise<Metadata> {
  const { year, city: citySlug } = await params
  const { r, city } = loadCity(citySlug, year, locale)
  const y = r.start.y
  const yl = ramadanLabel(r, 'en'), yb = ramadanLabel(r, 'bn'), ya = ramadanLabel(r, 'ar')
  const slug0 = ramadanSlug(r)
  const en = cityTitle(city, 'en')
  const g = bnGenitive(city.name.bn)
  const d1 = cityDay(city, r.start)
  return buildMeta({
    title: locale === 'bn'
      ? `${g} সেহরি ও ইফতারের সময়সূচি ${yb} — রমজান ${bnDigits(r.hijriYear)} | ${en} Ramadan Timetable`
      : `${en} Sehri & Iftar Time ${yl} — Ramadan Timetable | ${g} সেহরি ইফতারের সময়সূচি ${yb}`,
    description: locale === 'bn'
      ? `${g} রমজান ${yb}-এর সম্পূর্ণ সেহরি ও ইফতারের সময়সূচি। প্রথম রোজায় (${fmtDate(r.start, 'bn')}) সেহরির শেষ ${fmtClock(d1.fajr, city.tz, 'bn')}, ইফতার ${fmtClock(d1.maghrib, city.tz, 'bn')}। প্রিন্টযোগ্য; চাঁদ দেখার উপর নির্ভর করে ±১ দিন।`
      : `Complete Ramadan ${yl} sehri and iftar timetable for ${en}. First fast (${fmtDate(r.start, 'en')}): sehri ends ${fmtClock(d1.fajr, city.tz, 'en')}, iftar ${fmtClock(d1.maghrib, city.tz, 'en')}. Printable; start date depends on moon sighting (±1 day).`,
    keywords: [`${city.name.en} sehri time`, `${city.name.en} iftar time`, `${city.name.en} Ramadan timetable ${yl}`, `${en} sehri iftar time ${yl}`, `${g} সেহরি ইফতারের সময়সূচি ${yb}`, `${g} সেহরির সময়`, `${g} ইফতারের সময়`, `সেহরি ইফতারের সময়সূচি ${yb} ${city.name.bn}`],
    path: `/ramadan/${slug0}/${city.slug}`,
    locale,
  })
}

export async function RamadanCityPage({ locale, params }: { locale: Locale } & RamadanCityProps) {
  const { year, city: citySlug } = await params
  const { r, city } = loadCity(citySlug, year, locale)
  const y = r.start.y
  const yl = ramadanLabel(r, 'en'), yb = ramadanLabel(r, 'bn'), ya = ramadanLabel(r, 'ar')
  const slug = ramadanSlug(r)
  const bn = locale === 'bn'
  const name = cityTitle(city, locale)
  const g = bnGenitive(name)
  const path = localeHref(locale, `/ramadan/${slug}/${city.slug}`)
  const span = citySpan(city, r.start, r.days + 1)
  const wd = WEEKDAYS[bn ? 'bn' : 'en']
  const rows: RamadanRow[] = span.map((d, i) => ({
    date: d.date, dayNo: i + 1, dateLabel: fmtDate(d.ymd, locale, { year: false }), weekday: wd[d.weekday], sehri: fmtClock(d.fajr, city.tz, locale), iftar: fmtClock(d.maghrib, city.tz, locale), friday: d.friday,
  }))
  const d1 = span[0], dl = span[r.days - 1]
  const months = [...new Set(span.map((d) => monthKey(d.ymd.y, d.ymd.m)))]
  const near = nearbyCities(city, 8)
  const faqs = bn
    ? [
        { q: `${g} রমজান ${yb}-এর সেহরির সময় কখন?`, a: `প্রথম রোজায় (${fmtDate(r.start, 'bn')}) সেহরির শেষ সময় ${fmtClock(d1.fajr, city.tz, 'bn')} এবং ${bnDigits(r.days)}তম দিনে (${fmtDate(dl.ymd, 'bn')}) ${fmtClock(dl.fajr, city.tz, 'bn')}। প্রতিদিনের সময় উপরের সারণিতে।` },
        { q: `${g} ইফতারের সময় কখন?`, a: `প্রথম রোজায় ইফতার ${fmtClock(d1.maghrib, city.tz, 'bn')}-এ এবং শেষ রোজায় ${fmtClock(dl.maghrib, city.tz, 'bn')}-এ (সূর্যাস্তের সময়)।` },
        { q: `সেহরির শেষ সময় কি ফজরের সময়ের সমান?`, a: `এই সময়সূচিতে সেহরির শেষ সময় হিসাবকৃত ফজরের শুরুর সময়। কিছু স্থানীয় সময়সূচিতে সতর্কতাবশত কয়েক মিনিট আগে ধরা হয়; আমরা কোনো বাড়তি সময় যোগ করিনি।` },
        { q: `রমজান ${yb} ${countryName(city.country, 'bn')}-এ কবে শুরু?`, a: `উম্মুল কুরা অনুযায়ী ${fmtDate(r.start, 'bn', { weekday: true })}। চাঁদ দেখার উপর নির্ভর করে বাংলাদেশে একদিন পরে শুরু হতে পারে; সরকারি ঘোষণা অনুসরণ করুন।` },
      ]
    : [
        { q: `What time is sehri in ${name} during Ramadan ${yl}?`, a: `On the first fast (${fmtDate(r.start, 'en')}) sehri ends at ${fmtClock(d1.fajr, city.tz, 'en')}, and on day ${r.days} (${fmtDate(dl.ymd, 'en')}) at ${fmtClock(dl.fajr, city.tz, 'en')}. Every day is in the timetable above.` },
        { q: `What time is iftar in ${name}?`, a: `Iftar on the first fast is at ${fmtClock(d1.maghrib, city.tz, 'en')} and on the last fast at ${fmtClock(dl.maghrib, city.tz, 'en')} (sunset, Maghrib).` },
        { q: `Is the sehri end time the same as Fajr?`, a: `In this timetable, sehri ends at the calculated start of Fajr. Some local timetables end sehri a few minutes earlier as a precaution; no margin is added here.` },
        { q: `When does Ramadan ${yl} start in ${countryName(city.country, 'en')}?`, a: `By the Umm al-Qura calendar, ${fmtDate(r.start, 'en', { weekday: true })}. Where moon sighting decides, the start can be a day later (±1 day) — follow your national announcement.` },
      ]

  return (
    <div className={pageShell}>
      <PrintStyles />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: `${name} Ramadan ${yl} timetable`, url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString(), about: { '@type': 'Place', name: city.name.en, geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng } } }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'রমজান' : 'Ramadan', ar: 'رمضان', href: '/ramadan' }, { name: bn ? yb : yl, href: `/ramadan/${slug}` }, { name, href: `/ramadan/${slug}/${city.slug}` }]} className="mb-4 print:hidden" />
      <PageHero
        eyebrow={<>{lt(locale, { en: `Ramadan ${yl}`, bn: `রমজান ${yb}`, ar: `رمضان ${ya}` })} · {fmtHijri({ y: r.hijriYear, m: 9, d: 1 }, locale).replace(/^\S+ /, '')}</>}
        icon="crescent"
        title={bn ? <>{g} সেহরি ও ইফতারের সময়সূচি {yb}</> : <>{name} Sehri &amp; Iftar Time {yl}</>}
        subtitle={bn
          ? <>উম্মুল কুরা অনুযায়ী প্রথম রোজা {fmtDate(r.start, 'bn', { weekday: true })} · ঈদুল ফিতর {fmtDate(r.eid, 'bn')} · সময় {city.tz.replace(/_/g, ' ')}</>
          : <>First fast (Umm al-Qura) {fmtDate(r.start, 'en', { weekday: true })} · Eid al-Fitr {fmtDate(r.eid, 'en')} · times in {city.tz.replace(/_/g, ' ')}</>}
      />
      <div className="mt-6"><Notice locale={locale} r={r} /></div>

      <section className="mt-8" aria-labelledby="rt-h">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="rt-h" className="font-display text-2xl font-semibold">{lt(locale, { en: `Ramadan ${yl} timetable for ${name}`, bn: `${g} রমজান ${yb}-এর সময়সূচি`, ar: `جدول رمضان ${ya}` })}</h2>
          <PrintButton className={`${chipCls} print:hidden`} />
        </div>
        <RamadanTable rows={rows} tz={city.tz} cityName={name} startLabel={{ saudi: bn ? 'সৌদি (উম্মুল কুরা)' : 'Saudi (Umm al-Qura)', plusOne: bn ? '+১ দিন (চাঁদ দেখা)' : '+1 day (moon sighting)' }} />
        <p className="mt-3 text-xs text-muted-foreground">{lt(locale, { en: `Sehri ends = start of Fajr; iftar = Maghrib (sunset). ${METHOD_LINE[city.method].en}. Fridays in gold.`, bn: `সেহরির শেষ = ফজরের শুরু; ইফতার = মাগরিব (সূর্যাস্ত)। ${METHOD_LINE[city.method].bn}। শুক্রবার সোনালি রঙে।`, ar: 'السحور ينتهي بدخول الفجر والإفطار عند المغرب.' })}</p>
      </section>

      <Duas locale={locale} />
      <Faq faqs={faqs} locale={locale} />

      <section className="mt-12" data-print-hide aria-labelledby="more-h">
        <h2 id="more-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `More for ${name}`, bn: `${g} আরও`, ar: 'المزيد' })}</h2>
        <div className="flex flex-wrap gap-2">
          <Link href={localeHref(locale, `/prayer-times/${city.slug}`)} className={chipCls}>{lt(locale, { en: 'Prayer times today', bn: 'আজকের নামাজের সময়', ar: 'مواقيت اليوم' })}</Link>
          {months.map((m) => <Link key={m} href={localeHref(locale, `/prayer-times/${city.slug}/${m}`)} className={chipCls}>{lt(locale, { en: `Monthly timetable ${m}`, bn: `মাসিক সময়সূচি ${bnDigits(m)}`, ar: `الجدول الشهري ${m}` })}</Link>)}
          <Link href={localeHref(locale, `/ramadan/${slug}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${yl} — all cities`, bn: `রমজান ${yb} — সব শহর`, ar: 'كل المدن' })}</Link>
        </div>
        <YearLinks locale={locale} r={r} city={city} />
        <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'Nearby cities', bn: 'নিকটবর্তী শহর', ar: 'مدن قريبة' })}</h3>
        <CityChips list={near} locale={locale} path={`/ramadan/${slug}`} />
      </section>
    </div>
  )
}

const METHOD_LINE: Record<string, { en: string; bn: string }> = {
  Karachi: { en: 'Method: University of Islamic Sciences, Karachi', bn: 'পদ্ধতি: করাচি বিশ্ববিদ্যালয়' },
  MuslimWorldLeague: { en: 'Method: Muslim World League', bn: 'পদ্ধতি: মুসলিম ওয়ার্ল্ড লিগ' },
  Egyptian: { en: 'Method: Egyptian General Authority', bn: 'পদ্ধতি: মিসরীয় কর্তৃপক্ষ' },
  UmmAlQura: { en: 'Method: Umm al-Qura, Makkah', bn: 'পদ্ধতি: উম্মুল কুরা, মক্কা' },
  NorthAmerica: { en: 'Method: ISNA', bn: 'পদ্ধতি: ISNA' },
  Dubai: { en: 'Method: Dubai', bn: 'পদ্ধতি: দুবাই' },
  Kuwait: { en: 'Method: Kuwait', bn: 'পদ্ধতি: কুয়েত' },
  Qatar: { en: 'Method: Qatar', bn: 'পদ্ধতি: কাতার' },
  Singapore: { en: 'Method: Singapore / Malaysia / Indonesia', bn: 'পদ্ধতি: সিঙ্গাপুর/মালয়েশিয়া/ইন্দোনেশিয়া' },
  Turkey: { en: 'Method: Turkey (Diyanet)', bn: 'পদ্ধতি: তুরস্ক (দিয়ানেত)' },
  Tehran: { en: 'Method: Tehran', bn: 'পদ্ধতি: তেহরান' },
  MoonsightingCommittee: { en: 'Method: Moonsighting Committee', bn: 'পদ্ধতি: মুনসাইটিং কমিটি' },
}
