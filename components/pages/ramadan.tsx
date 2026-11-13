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
import { currentOrNextRamadan, fmtHijri, ramadanInGregorianYear, type RamadanRange } from '@/lib/places/hijri'
import { monthKey } from '@/lib/places/export'

const DHAKA = cities.find((c) => c.slug === 'dhaka')!
const nowRange = () => currentOrNextRamadan(zonedYmd(Date.now(), DHAKA.tz)).range

/** Gregorian years whose Ramadan pages exist: last Ramadan … five after the upcoming one. */
export function validRamadanYear(y: number) {
  const y0 = nowRange().start.y
  return Number.isInteger(y) && y >= y0 - 1 && y <= y0 + 5 && ramadanInGregorianYear(y) !== null
}

export type YearProps = { params: Promise<{ year: string }> }
export type RamadanCityProps = { params: Promise<{ year: string; city: string }> }

export const ramadanYearParams = () => {
  const y0 = nowRange().start.y
  return [y0, y0 + 1].filter(validRamadanYear).map((y) => ({ year: String(y) }))
}
export const ramadanCityParams = () => {
  const y0 = nowRange().start.y
  return cities.map((c) => ({ year: String(y0), city: c.slug }))
}

const nm = (locale: Locale, y: number | string) => (locale === 'bn' ? bnDigits(y) : String(y))
const p = (locale: Locale, en: string, bn: string) => (locale === 'bn' ? bn : en)

function loadRange(year: string) {
  const y = Number(year)
  if (!/^\d{4}$/.test(year) || !validRamadanYear(y)) notFound()
  return ramadanInGregorianYear(y)!
}

/** /ramadan → the running or upcoming Ramadan. */
export function RamadanIndexPage({ locale }: { locale: Locale }): never {
  redirect(localeHref(locale, `/ramadan/${nowRange().start.y}`))
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

function YearLinks({ locale, year, city }: { locale: Locale; year: number; city?: City }) {
  const ys = [year - 1, year + 1].filter(validRamadanYear)
  if (!ys.length) return null
  return (
    <div data-print-hide className="mt-6 flex flex-wrap gap-2">
      {ys.map((y) => (
        <Link key={y} href={localeHref(locale, `/ramadan/${y}${city ? `/${city.slug}` : ''}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${y}`, bn: `রমজান ${bnDigits(y)}`, ar: `رمضان ${y}` })}</Link>
      ))}
    </div>
  )
}

/* ───────────── /ramadan/{year} ───────────── */

export async function ramadanYearMeta(locale: Locale, { params }: YearProps): Promise<Metadata> {
  const { year } = await params
  const r = loadRange(year)
  const y = r.start.y
  return buildMeta({
    title: locale === 'bn'
      ? `রমজান ${bnDigits(y)} — সেহরি ও ইফতারের সময়সূচি, রমজান কবে শুরু | বাংলাদেশের সব জেলা`
      : `Ramadan ${y} — Start Date, Sehri & Iftar Timetable for Bangladesh & the World | রমজান ${bnDigits(y)}`,
    description: locale === 'bn'
      ? `রমজান ${bnDigits(y)} (${bnDigits(r.hijriYear)} হিজরি) উম্মুল কুরা অনুযায়ী ${fmtDate(r.start, 'bn')} থেকে শুরু। ঢাকা, চট্টগ্রাম, রাজশাহী, সিলেটসহ ৬৪ জেলা ও বিশ্বের শহরের সেহরি ও ইফতারের সময়সূচি। চাঁদ দেখার উপর নির্ভর করে ±১ দিন পার্থক্য হতে পারে।`
      : `Ramadan ${y} (${r.hijriYear} AH) begins around ${fmtDate(r.start, 'en')} by the Umm al-Qura calendar. Sehri and iftar timetables for Dhaka, Chattogram, Rajshahi, Sylhet and all 64 districts of Bangladesh plus major world cities. Start depends on moon sighting (±1 day).`,
    keywords: [`Ramadan ${y}`, `Ramadan ${y} calendar`, `Ramadan ${y} start date`, `sehri iftar time ${y}`, `Ramadan timetable ${y} Bangladesh`, `রমজান ${bnDigits(y)}`, `সেহরি ইফতারের সময়সূচি ${bnDigits(y)}`, `রমজানের ক্যালেন্ডার ${bnDigits(y)}`, 'রমজান কবে শুরু'],
    path: `/ramadan/${y}`,
    locale,
  })
}

export async function RamadanYearPage({ locale, params }: { locale: Locale } & YearProps) {
  const { year } = await params
  const r = loadRange(year)
  const y = r.start.y
  const bn = locale === 'bn'
  const path = localeHref(locale, `/ramadan/${y}`)
  const first = (c: City) => cityDay(c, r.start)
  const days = r.days
  const faqs = bn
    ? [
        { q: `রমজান ${bnDigits(y)} কবে শুরু?`, a: `উম্মুল কুরা (সৌদি) ক্যালেন্ডার অনুযায়ী ১ রমজান ${bnDigits(r.hijriYear)} হিজরি = ${fmtDate(r.start, 'bn', { weekday: true })}। বাংলাদেশে চাঁদ দেখা সাপেক্ষে প্রায়ই একদিন পরে শুরু হয়; সরকারি ঘোষণা অনুসরণ করুন।` },
        { q: `রমজান ${bnDigits(y)} কত দিনের হবে?`, a: `উম্মুল কুরা অনুযায়ী ${bnDigits(days)} দিন; চাঁদ দেখার ভিত্তিতে ২৯ বা ৩০ দিন হয়।` },
        { q: `ঈদুল ফিতর ${bnDigits(y)} কবে?`, a: `উম্মুল কুরা অনুযায়ী ১ শাওয়াল = ${fmtDate(r.eid, 'bn', { weekday: true })}। চাঁদ দেখার উপর নির্ভর করে একদিন আগে-পরে হতে পারে।` },
        { q: `সেহরির শেষ সময় ও ইফতারের সময় কীভাবে নির্ধারিত হয়?`, a: `সেহরির শেষ সময় ফজরের ওয়াক্ত শুরুর সময় এবং ইফতারের সময় সূর্যাস্ত (মাগরিব)। শহরভেদে কয়েক মিনিট পার্থক্য থাকে, তাই আপনার শহরের সময়সূচি দেখুন।` },
      ]
    : [
        { q: `When does Ramadan ${y} start?`, a: `By the Umm al-Qura (Saudi) calendar, 1 Ramadan ${r.hijriYear} AH is ${fmtDate(r.start, 'en', { weekday: true })}. Countries that rely on local moon sighting, including Bangladesh, India and Pakistan, often start a day later — follow your national announcement.` },
        { q: `How many days is Ramadan ${y}?`, a: `${days} days by the Umm al-Qura calendar; with moon sighting it is 29 or 30 days.` },
        { q: `When is Eid al-Fitr ${y}?`, a: `1 Shawwal ${r.hijriYear} AH falls on ${fmtDate(r.eid, 'en', { weekday: true })} by Umm al-Qura, and may differ by a day depending on moon sighting.` },
        { q: `How are sehri and iftar times determined?`, a: `Sehri ends when Fajr begins and iftar is at sunset (Maghrib). Times differ by a few minutes between cities, so open the timetable for your city.` },
      ]

  return (
    <div className={pageShell}>
      <PrintStyles />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: `Ramadan ${y}`, url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString(), about: { '@type': 'Event', name: `Ramadan ${y}`, startDate: `${r.start.y}-${String(r.start.m).padStart(2, '0')}-${String(r.start.d).padStart(2, '0')}`, endDate: `${r.end.y}-${String(r.end.m).padStart(2, '0')}-${String(r.end.d).padStart(2, '0')}` } }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'রমজান' : 'Ramadan', ar: 'رمضان', href: '/ramadan' }, { name: `${y}`, href: `/ramadan/${y}` }]} className="mb-4" />
      <PageHero
        eyebrow={lt(locale, { en: `${r.hijriYear} AH`, bn: `${bnDigits(r.hijriYear)} হিজরি`, ar: `${r.hijriYear} هـ` })}
        icon="crescent"
        title={bn ? <>রমজান {bnDigits(y)} — সেহরি ও ইফতারের সময়সূচি</> : <>Ramadan {y} — Sehri &amp; Iftar Timetable</>}
        subtitle={bn
          ? <>উম্মুল কুরা অনুযায়ী ১ রমজান: {fmtDate(r.start, 'bn', { weekday: true })} · শেষ রোজা: {fmtDate(r.end, 'bn')} · ঈদুল ফিতর: {fmtDate(r.eid, 'bn')}</>
          : <>1 Ramadan (Umm al-Qura): {fmtDate(r.start, 'en', { weekday: true })} · last fast: {fmtDate(r.end, 'en')} · Eid al-Fitr: {fmtDate(r.eid, 'en')}</>}
      />
      <div className="mt-6"><Notice locale={locale} r={r} /></div>
      <div data-print-hide className="mt-4 flex flex-wrap gap-2" aria-label={bn ? 'সংশ্লিষ্ট ইসলামি দিবস' : 'Related Islamic events'}>
        <Link href={localeHref(locale, `/events/ramadan-start/${y}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${y} start date`, bn: `রমজান ${bnDigits(y)} কবে শুরু`, ar: `بداية رمضان ${y}` })}</Link>
        <Link href={localeHref(locale, `/events/laylatul-qadr/${y}`)} className={chipCls}>{lt(locale, { en: `Laylatul Qadr ${y}`, bn: `শবে কদর ${bnDigits(y)} কবে`, ar: `ليلة القدر ${y}` })}</Link>
        <Link href={localeHref(locale, `/events/eid-al-fitr/${y}`)} className={chipCls}>{lt(locale, { en: `Eid ul Fitr ${y}`, bn: `ঈদুল ফিতর ${bnDigits(y)} কবে`, ar: `عيد الفطر ${y}` })}</Link>
        <Link href={localeHref(locale, '/events')} className={chipCls}>{lt(locale, { en: 'All Islamic events', bn: 'সব ইসলামি দিবস', ar: 'كل المناسبات' })}</Link>
      </div>

      <section className="mt-10" aria-labelledby="div-h">
        <h2 id="div-h" className="font-display mb-2 text-2xl font-semibold">{lt(locale, { en: 'Divisional cities — first day of Ramadan', bn: 'বিভাগীয় শহর — রমজানের প্রথম দিন', ar: 'مدن الأقسام — اليوم الأول' })}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{lt(locale, { en: `Times for ${fmtDate(r.start, 'en')}. Tap a city for the full 30-day timetable.`, bn: `${fmtDate(r.start, 'bn')} তারিখের সময়। পূর্ণ ৩০ দিনের সময়সূচির জন্য শহরে ট্যাপ করুন।`, ar: 'اضغط على المدينة لعرض الجدول كاملًا.' })}</p>
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <caption className="sr-only">{p(locale, `First day of Ramadan ${y}, sehri and iftar by division`, `রমজান ${bnDigits(y)} প্রথম দিনের সেহরি ও ইফতার`)}</caption>
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
                    <th scope="row" className="px-3 py-2.5 text-start font-medium"><Link href={localeHref(locale, `/ramadan/${y}/${c.slug}`)} className="text-primary hover:underline">{bn ? c.name.bn : cityTitle(c, 'en')}</Link></th>
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
        <h2 id="bd-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `All 64 districts of Bangladesh — Ramadan ${y}`, bn: `বাংলাদেশের ৬৪ জেলা — রমজান ${bnDigits(y)}`, ar: `بنغلاديش — ٦٤ منطقة` })}</h2>
        <CityChips list={bdCities} locale={locale} path={`/ramadan/${y}`} />
      </section>
      <section className="mt-10" aria-labelledby="world-h">
        <h2 id="world-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `World cities — Ramadan ${y}`, bn: `বিশ্বের শহর — রমজান ${bnDigits(y)}`, ar: 'مدن العالم' })}</h2>
        <CityChips list={worldCities} locale={locale} path={`/ramadan/${y}`} />
      </section>

      <Duas locale={locale} />
      <Faq faqs={faqs} locale={locale} />
      <YearLinks locale={locale} year={y} />
    </div>
  )
}

/* ───────────── /ramadan/{year}/{city} ───────────── */

function loadCity(slug: string, year: string, locale: Locale) {
  const r = loadRange(year)
  const city = resolveCity(slug)
  if (!city) notFound()
  if (city.slug !== slug) permanentRedirect(localeHref(locale, `/ramadan/${r.start.y}/${city.slug}`))
  return { r, city }
}

export async function ramadanCityMeta(locale: Locale, { params }: RamadanCityProps): Promise<Metadata> {
  const { year, city: slug } = await params
  const { r, city } = loadCity(slug, year, locale)
  const y = r.start.y
  const en = cityTitle(city, 'en')
  const g = bnGenitive(city.name.bn)
  const d1 = cityDay(city, r.start)
  return buildMeta({
    title: locale === 'bn'
      ? `${g} সেহরি ও ইফতারের সময়সূচি ${bnDigits(y)} — রমজান ${bnDigits(r.hijriYear)} | ${en} Ramadan Timetable`
      : `${en} Sehri & Iftar Time ${y} — Ramadan Timetable | ${g} সেহরি ইফতারের সময়সূচি ${bnDigits(y)}`,
    description: locale === 'bn'
      ? `${g} রমজান ${bnDigits(y)}-এর সম্পূর্ণ সেহরি ও ইফতারের সময়সূচি। প্রথম রোজায় (${fmtDate(r.start, 'bn')}) সেহরির শেষ ${fmtClock(d1.fajr, city.tz, 'bn')}, ইফতার ${fmtClock(d1.maghrib, city.tz, 'bn')}। প্রিন্টযোগ্য; চাঁদ দেখার উপর নির্ভর করে ±১ দিন।`
      : `Complete Ramadan ${y} sehri and iftar timetable for ${en}. First fast (${fmtDate(r.start, 'en')}): sehri ends ${fmtClock(d1.fajr, city.tz, 'en')}, iftar ${fmtClock(d1.maghrib, city.tz, 'en')}. Printable; start date depends on moon sighting (±1 day).`,
    keywords: [`${city.name.en} sehri time`, `${city.name.en} iftar time`, `${city.name.en} Ramadan timetable ${y}`, `${en} sehri iftar time ${y}`, `${g} সেহরি ইফতারের সময়সূচি ${bnDigits(y)}`, `${g} সেহরির সময়`, `${g} ইফতারের সময়`, `সেহরি ইফতারের সময়সূচি ${bnDigits(y)} ${city.name.bn}`],
    path: `/ramadan/${y}/${city.slug}`,
    locale,
  })
}

export async function RamadanCityPage({ locale, params }: { locale: Locale } & RamadanCityProps) {
  const { year, city: slug } = await params
  const { r, city } = loadCity(slug, year, locale)
  const y = r.start.y
  const bn = locale === 'bn'
  const name = cityTitle(city, locale)
  const g = bnGenitive(name)
  const path = localeHref(locale, `/ramadan/${y}/${city.slug}`)
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
        { q: `${g} রমজান ${bnDigits(y)}-এর সেহরির সময় কখন?`, a: `প্রথম রোজায় (${fmtDate(r.start, 'bn')}) সেহরির শেষ সময় ${fmtClock(d1.fajr, city.tz, 'bn')} এবং ${bnDigits(r.days)}তম দিনে (${fmtDate(dl.ymd, 'bn')}) ${fmtClock(dl.fajr, city.tz, 'bn')}। প্রতিদিনের সময় উপরের সারণিতে।` },
        { q: `${g} ইফতারের সময় কখন?`, a: `প্রথম রোজায় ইফতার ${fmtClock(d1.maghrib, city.tz, 'bn')}-এ এবং শেষ রোজায় ${fmtClock(dl.maghrib, city.tz, 'bn')}-এ (সূর্যাস্তের সময়)।` },
        { q: `সেহরির শেষ সময় কি ফজরের সময়ের সমান?`, a: `এই সময়সূচিতে সেহরির শেষ সময় হিসাবকৃত ফজরের শুরুর সময়। কিছু স্থানীয় সময়সূচিতে সতর্কতাবশত কয়েক মিনিট আগে ধরা হয়; আমরা কোনো বাড়তি সময় যোগ করিনি।` },
        { q: `রমজান ${bnDigits(y)} ${countryName(city.country, 'bn')}-এ কবে শুরু?`, a: `উম্মুল কুরা অনুযায়ী ${fmtDate(r.start, 'bn', { weekday: true })}। চাঁদ দেখার উপর নির্ভর করে বাংলাদেশে একদিন পরে শুরু হতে পারে; সরকারি ঘোষণা অনুসরণ করুন।` },
      ]
    : [
        { q: `What time is sehri in ${name} during Ramadan ${y}?`, a: `On the first fast (${fmtDate(r.start, 'en')}) sehri ends at ${fmtClock(d1.fajr, city.tz, 'en')}, and on day ${r.days} (${fmtDate(dl.ymd, 'en')}) at ${fmtClock(dl.fajr, city.tz, 'en')}. Every day is in the timetable above.` },
        { q: `What time is iftar in ${name}?`, a: `Iftar on the first fast is at ${fmtClock(d1.maghrib, city.tz, 'en')} and on the last fast at ${fmtClock(dl.maghrib, city.tz, 'en')} (sunset, Maghrib).` },
        { q: `Is the sehri end time the same as Fajr?`, a: `In this timetable, sehri ends at the calculated start of Fajr. Some local timetables end sehri a few minutes earlier as a precaution; no margin is added here.` },
        { q: `When does Ramadan ${y} start in ${countryName(city.country, 'en')}?`, a: `By the Umm al-Qura calendar, ${fmtDate(r.start, 'en', { weekday: true })}. Where moon sighting decides, the start can be a day later (±1 day) — follow your national announcement.` },
      ]

  return (
    <div className={pageShell}>
      <PrintStyles />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: `${name} Ramadan ${y} timetable`, url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString(), about: { '@type': 'Place', name: city.name.en, geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng } } }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'রমজান' : 'Ramadan', ar: 'رمضان', href: '/ramadan' }, { name: `${y}`, href: `/ramadan/${y}` }, { name, href: `/ramadan/${y}/${city.slug}` }]} className="mb-4 print:hidden" />
      <PageHero
        eyebrow={<>{lt(locale, { en: `Ramadan ${y}`, bn: `রমজান ${bnDigits(y)}`, ar: `رمضان ${y}` })} · {fmtHijri({ y: r.hijriYear, m: 9, d: 1 }, locale).replace(/^\S+ /, '')}</>}
        icon="crescent"
        title={bn ? <>{g} সেহরি ও ইফতারের সময়সূচি {bnDigits(y)}</> : <>{name} Sehri &amp; Iftar Time {y}</>}
        subtitle={bn
          ? <>উম্মুল কুরা অনুযায়ী প্রথম রোজা {fmtDate(r.start, 'bn', { weekday: true })} · ঈদুল ফিতর {fmtDate(r.eid, 'bn')} · সময় {city.tz.replace(/_/g, ' ')}</>
          : <>First fast (Umm al-Qura) {fmtDate(r.start, 'en', { weekday: true })} · Eid al-Fitr {fmtDate(r.eid, 'en')} · times in {city.tz.replace(/_/g, ' ')}</>}
      />
      <div className="mt-6"><Notice locale={locale} r={r} /></div>

      <section className="mt-8" aria-labelledby="rt-h">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="rt-h" className="font-display text-2xl font-semibold">{lt(locale, { en: `Ramadan ${y} timetable for ${name}`, bn: `${g} রমজান ${bnDigits(y)}-এর সময়সূচি`, ar: `جدول رمضان ${y}` })}</h2>
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
          <Link href={localeHref(locale, `/ramadan/${y}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${y} — all cities`, bn: `রমজান ${bnDigits(y)} — সব শহর`, ar: 'كل المدن' })}</Link>
        </div>
        <YearLinks locale={locale} year={y} city={city} />
        <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'Nearby cities', bn: 'নিকটবর্তী শহর', ar: 'مدن قريبة' })}</h3>
        <CityChips list={near} locale={locale} path={`/ramadan/${y}`} />
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
