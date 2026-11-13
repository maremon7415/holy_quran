import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { UiIcon } from '@/components/ui-icon'
import { CityLive } from '@/components/places/city-live'
import { CityChips, DownloadBar, PrayerGrid, SehriIftar, TimeTable, chipCls } from '@/components/places/city-ui'
import { buildMeta } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/site'
import { bdCities, bnGenitive, cities, cityTitle, compassPoint, countryName, METHOD_NAMES, nearbyCities, qiblaFor, resolveCity, type City } from '@/lib/places/cities'
import { cityDay, citySpan, cityToday, fmtClock, fmtDate, fmtMonth, bnDigits, type CityDay } from '@/lib/places/times'
import { hijriOf, fmtHijri, currentOrNextRamadan } from '@/lib/places/hijri'
import { monthKey } from '@/lib/places/export'

export type CityProps = { params: Promise<{ city: string }> }
export const cityParams = () => cities.map((c) => ({ city: c.slug }))

const p = (locale: Locale, en: string, bn: string) => (locale === 'bn' ? bn : en)
const num = (locale: Locale, v: number | string) => (locale === 'bn' ? bnDigits(v) : String(v))

/** Resolve the slug (aliases → permanent redirect to the canonical city) and compute today's day for that city. */
async function load(params: CityProps['params'], locale: Locale) {
  const { city: slug } = await params
  const city = resolveCity(slug)
  if (!city) notFound()
  if (city.slug !== slug) permanentRedirect(localeHref(locale, `/prayer-times/${city.slug}`))
  const today = cityToday(city)
  const days = citySpan(city, today, 30)
  return { city, today, days, day: days[0] }
}

function summaryLine(city: City, day: CityDay, locale: Locale) {
  const t = (k: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => fmtClock(day[k], city.tz, locale)
  return locale === 'bn'
    ? `ফজর ${t('fajr')}, সূর্যোদয় ${t('sunrise')}, যোহর ${t('dhuhr')}, আসর ${t('asr')}, মাগরিব ${t('maghrib')}, এশা ${t('isha')}`
    : `Fajr ${t('fajr')}, Sunrise ${t('sunrise')}, Dhuhr ${t('dhuhr')}, Asr ${t('asr')}, Maghrib ${t('maghrib')}, Isha ${t('isha')}`
}

export async function cityMeta(locale: Locale, { params }: CityProps): Promise<Metadata> {
  const { city, day, today } = await load(params, locale)
  const en = cityTitle(city, 'en')
  const bn = city.name.bn
  const bnG = bnGenitive(bn)
  const date = fmtDate(today, locale)
  const alt = en !== city.name.en ? ` ${en.replace(city.name.en, '').trim()}` : ''
  return buildMeta({
    title: locale === 'bn'
      ? `${bnG} নামাজের সময়সূচি আজ — ফজর, যোহর, আসর, মাগরিব, এশা | ${en} Prayer Times`
      : `${en} Prayer Times Today — Fajr, Dhuhr, Asr, Maghrib, Isha | ${bnG} নামাজের সময়সূচি`,
    description: locale === 'bn'
      ? `${bnG} আজকের (${date}) নামাজের সময়সূচি: ${summaryLine(city, day, 'bn')}। সেহরির শেষ সময় ও ইফতারের সময়, ৩০ দিনের সময়সূচি, কিবলার দিক ও হিজরি তারিখ।`
      : `${en} prayer times today (${date}): ${summaryLine(city, day, 'en')}. Sehri and iftar time, 30-day timetable, Qibla direction and Hijri date.`,
    keywords: [`${city.name.en} prayer time today`, `${city.name.en} namaz time`, `${city.name.en} sehri time`, `${city.name.en} iftar time`, `${en} salah times`, `${bnG} নামাজের সময়সূচি`, `${bnG} নামাজের সময়সূচি আজ`, `${bnG} সেহরি ইফতারের সময়`, `${bn} ফজরের সময়`, ...(alt ? [`${en.replace(/[()]/g, '')} prayer time`] : [])],
    path: `/prayer-times/${city.slug}`,
    locale,
  })
}

export function faqsFor(city: City, day: CityDay, locale: Locale, qibla: { bearing: number; distanceKm: number }) {
  const t = (ms: number) => fmtClock(ms, city.tz, locale)
  const name = cityTitle(city, locale)
  const date = fmtDate(day.ymd, locale)
  const m = METHOD_NAMES[city.method]
  const asr = city.madhab === 'hanafi'
  const km = Math.round(qibla.distanceKm).toLocaleString('en-US')
  if (locale === 'bn') {
    const g = bnGenitive(name)
    return [
      { q: `আজ ${g} ফজরের নামাজের সময় কখন?`, a: `${date} তারিখে ${g} ফজরের ওয়াক্ত শুরু হবে ${t(day.fajr)}-এ এবং সূর্যোদয় ${t(day.sunrise)}-এ ফজরের ওয়াক্ত শেষ হবে।` },
      { q: `আজ ${g} ইফতারের (মাগরিব) সময় কখন?`, a: `${date} তারিখে ${g} সূর্যাস্ত ও মাগরিবের ওয়াক্ত শুরু ${t(day.maghrib)}-এ। রোজাদার এই সময়ে ইফতার করবেন।` },
      { q: `${g} সেহরির শেষ সময় আজ কখন?`, a: `হিসাব অনুযায়ী সেহরির শেষ সময় ফজরের ওয়াক্ত শুরুর সময় অর্থাৎ ${t(day.fajr)}। কিছু স্থানীয় সময়সূচিতে সতর্কতাবশত কয়েক মিনিট আগে সেহরি শেষ করার কথা বলা হয়; আমরা কোনো বাড়তি সময় যোগ করিনি।` },
      { q: `আসরের সময় কখন — হানাফি নাকি শাফেয়ি?`, a: `${g} আজ হানাফি মাযহাব অনুযায়ী আসরের ওয়াক্ত শুরু ${t(day.asrHanafi)}-এ এবং শাফেয়ি/স্ট্যান্ডার্ড হিসাবে ${t(day.asrStandard)}-এ।` },
      { q: `এই সময়সূচি কোন পদ্ধতিতে হিসাব করা হয়েছে?`, a: `${m.bn} পদ্ধতিতে, ${asr ? 'হানাফি আসর সহ' : 'স্ট্যান্ডার্ড আসর সহ'}। অবস্থান: ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°। স্থানীয় মসজিদের সময়সূচি কয়েক মিনিট আলাদা হতে পারে। /prayer-times পাতা থেকে পদ্ধতি বদলানো যায়।` },
      { q: `${g} থেকে কিবলার দিক কোনটি?`, a: `${g} থেকে কাবার দিক উত্তর থেকে ঘড়ির কাঁটার দিকে ${num(locale, qibla.bearing.toFixed(1))}° (${compassPoint(qibla.bearing, 'bn')}), দূরত্ব প্রায় ${num(locale, km)} কিলোমিটার।` },
    ]
  }
  return [
    { q: `What time is Fajr in ${name} today?`, a: `On ${date}, Fajr in ${name} begins at ${t(day.fajr)} and lasts until sunrise at ${t(day.sunrise)}.` },
    { q: `What time is Maghrib and iftar in ${name} today?`, a: `On ${date}, sunset and the start of Maghrib in ${name} is at ${t(day.maghrib)}. A fasting person breaks the fast (iftar) at this time.` },
    { q: `What is the sehri end time in ${name} today?`, a: `By calculation, sehri ends when Fajr begins: ${t(day.fajr)} on ${date}. Some local timetables end sehri a few minutes earlier as a precaution; no margin is added here.` },
    { q: `When is Asr in ${name} — Hanafi or Shafi’i?`, a: `Today in ${name}, Asr starts at ${t(day.asrHanafi)} by the Hanafi reckoning (shadow twice the object’s height) and at ${t(day.asrStandard)} by the Shafi’i/Maliki/Hanbali reckoning.` },
    { q: `Which calculation method are these prayer times based on?`, a: `${m.en}, with ${asr ? 'Hanafi' : 'standard (Shafi’i)'} Asr as the regional default, for coordinates ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}° (${city.tz}).${city.country === 'GB' ? ' Mosques in the UK use different conventions, so check your local mosque timetable.' : ' Your local mosque may differ by a few minutes.'} You can change the method and madhab on the main prayer times page.` },
    { q: `What is the Qibla direction in ${name}?`, a: `From ${name} the Kaaba lies at ${qibla.bearing.toFixed(1)}° clockwise from true north (${compassPoint(qibla.bearing)}), about ${km} km away.` },
  ]
}

export async function CityPrayerPage({ locale, params }: { locale: Locale } & CityProps) {
  const { city, today, days, day } = await load(params, locale)
  const bn = locale === 'bn'
  const name = cityTitle(city, locale)
  const country = countryName(city.country, locale)
  const qibla = qiblaFor(city)
  const hij = hijriOf(today)
  const r = currentOrNextRamadan(today).range
  const ramadanPath = localeHref(locale, `/ramadan/${r.start.y}/${city.slug}`)
  const faqs = faqsFor(city, day, locale, qibla)
  const path = localeHref(locale, `/prayer-times/${city.slug}`)
  const nearby = nearbyCities(city, 10)
  const ym = { y: today.y, m: today.m }
  const next = today.m === 12 ? { y: today.y + 1, m: 1 } : { y: today.y, m: today.m + 1 }
  const monthHref = (v: { y: number; m: number }) => localeHref(locale, `/prayer-times/${city.slug}/${monthKey(v.y, v.m)}`)
  const method = METHOD_NAMES[city.method]
  const live = days.slice(0, 3).map((d) => ({ date: d.date, fajr: d.fajr, dhuhr: d.dhuhr, asr: city.madhab === 'hanafi' ? d.asrHanafi : d.asr, maghrib: d.maghrib, isha: d.isha, friday: d.friday }))
  const sameDivision = city.country === 'BD' ? bdCities.filter((c) => c.division && c.slug !== city.slug) : []

  return (
    <div className={pageShell}>
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'WebPage', name: p(locale, `${name} Prayer Times Today`, `${bnGenitive(name)} নামাজের সময়সূচি`), url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString(), about: { '@type': 'Place', name: city.name.en }, isPartOf: { '@type': 'WebSite', name: 'Noor Quran', url: absoluteUrl('/') } },
        { '@context': 'https://schema.org', '@type': 'Place', name: city.name.en, alternateName: [city.name.bn, ...(city.aliases ?? [])], geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng }, containedInPlace: { '@type': 'Country', name: countryName(city.country, 'en') }, url: absoluteUrl(path) },
      ]} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'নামাজের সময়' : 'Prayer Times', ar: 'مواقيت الصلاة', href: '/prayer-times' }, { name: name, href: `/prayer-times/${city.slug}` }]} className="mb-4" />

      <PageHero
        eyebrow={<>{lt(locale, { en: 'Prayer times', bn: 'নামাজের সময়', ar: 'مواقيت الصلاة' })} · {country}</>}
        icon="prayer"
        title={bn ? <>{bnGenitive(name)} নামাজের সময়সূচি আজ</> : <>{name} Prayer Times Today</>}
        subtitle={<>{fmtDate(today, locale, { weekday: true })} · {fmtHijri(hij, locale)}{bn ? '' : ''}</>}
      >
        <CityLive tz={city.tz} cityName={name} days={live} />
      </PageHero>

      <section className="mt-8" aria-labelledby="today-h">
        <h2 id="today-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `Today’s prayer times in ${name}`, bn: `আজ ${bnGenitive(name)} নামাজের ওয়াক্ত`, ar: `مواقيت الصلاة اليوم` })}</h2>
        <PrayerGrid city={city} day={day} locale={locale} />
        <p className="mt-3 text-sm text-muted-foreground">
          {lt(locale, { en: `Times are local time in ${name} (${city.tz.replace(/_/g, ' ')}).`, bn: `সময়গুলো ${bnGenitive(name)} স্থানীয় সময় (${city.tz.replace(/_/g, ' ')}) অনুযায়ী।`, ar: `الأوقات بالتوقيت المحلي (${city.tz.replace(/_/g, ' ')}).` })}
        </p>
      </section>

      <section className="mt-8" aria-labelledby="sehri-h">
        <h2 id="sehri-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: `Sehri & iftar time in ${name} today`, bn: `আজ ${bnGenitive(name)} সেহরি ও ইফতারের সময়`, ar: 'السحور والإفطار اليوم' })}</h2>
        <SehriIftar city={city} day={day} locale={locale} />
        <p className="mt-3 text-sm">
          <Link href={ramadanPath} className="font-medium text-primary hover:underline">{lt(locale, { en: `Ramadan ${r.start.y} sehri & iftar timetable for ${name} →`, bn: `${bnGenitive(name)} রমজান ${bnDigits(r.start.y)} সেহরি ও ইফতারের সময়সূচি →`, ar: `جدول السحور والإفطار لرمضان ${r.start.y} ←` })}</Link>
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2" aria-labelledby="method-h">
        <div className="card-soft rounded-3xl p-5">
          <h2 id="method-h" className="font-display flex items-center gap-2 text-xl font-semibold"><UiIcon name="info" size={22} /> {lt(locale, { en: 'Calculation method', bn: 'হিসাব পদ্ধতি', ar: 'طريقة الحساب' })}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {bn ? <>{method.bn} পদ্ধতি, {city.madhab === 'hanafi' ? 'হানাফি আসর সহ (শাফেয়ি আসরও দেখানো হয়েছে)' : 'স্ট্যান্ডার্ড (শাফেয়ি) আসর সহ'}। এটি এই অঞ্চলের প্রচলিত ডিফল্ট; স্থানীয় মসজিদের সময় কয়েক মিনিট আলাদা হতে পারে।</> : <>{method.en}, with {city.madhab === 'hanafi' ? 'Hanafi Asr (standard Asr is shown too)' : 'standard (Shafi’i) Asr'}. This is the usual regional default — your local mosque may differ by a few minutes.{city.country === 'GB' ? ' UK mosques follow several different conventions.' : ''}</>}
          </p>
          <Link href={localeHref(locale, '/prayer-times')} className={`${chipCls} mt-4`}>{lt(locale, { en: 'Change method or madhab', bn: 'পদ্ধতি বা মাযহাব বদলান', ar: 'تغيير الطريقة أو المذهب' })}</Link>
        </div>
        <div className="card-soft rounded-3xl p-5">
          <h2 className="font-display flex items-center gap-2 text-xl font-semibold"><UiIcon name="qibla" size={22} /> {lt(locale, { en: `Qibla from ${name}`, bn: `${bnGenitive(name)} কিবলার দিক`, ar: 'اتجاه القبلة' })}</h2>
          <p className="font-display mt-3 text-4xl font-semibold tabular-nums">{num(locale, qibla.bearing.toFixed(1))}° <span className="text-lg font-medium text-muted-foreground">{compassPoint(qibla.bearing, bn ? 'bn' : 'en')}</span></p>
          <p className="mt-1 text-sm text-muted-foreground">{lt(locale, { en: `clockwise from true north · ${Math.round(qibla.distanceKm).toLocaleString('en-US')} km to the Kaaba, Makkah`, bn: `সত্য উত্তর থেকে ঘড়ির কাঁটার দিকে · মক্কার কাবা প্রায় ${bnDigits(Math.round(qibla.distanceKm).toLocaleString('en-US'))} কিমি দূরে`, ar: `باتجاه عقارب الساعة من الشمال الحقيقي · ${Math.round(qibla.distanceKm).toLocaleString('en-US')} كم إلى الكعبة` })}</p>
          <Link href={localeHref(locale, '/qibla')} className={`${chipCls} mt-4`}>{lt(locale, { en: 'Open live Qibla compass', bn: 'লাইভ কিবলা কম্পাস', ar: 'بوصلة القبلة' })}</Link>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="tt-h">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="tt-h" className="font-display text-2xl font-semibold">{lt(locale, { en: `${name} prayer timetable — next 30 days`, bn: `${bnGenitive(name)} নামাজের সময়সূচি — আগামী ৩০ দিন`, ar: 'جدول المواقيت — ٣٠ يومًا' })}</h2>
        </div>
        <TimeTable city={city} days={days} locale={locale} caption={p(locale, `${name} prayer times for the next 30 days`, `${bnGenitive(name)} আগামী ৩০ দিনের নামাজের সময়সূচি`)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={monthHref(ym)} className={chipCls}>{fmtMonth(ym.y, ym.m, locale)} {lt(locale, { en: 'full month', bn: 'পূর্ণ মাস', ar: 'الشهر كاملًا' })}</Link>
          <Link href={monthHref(next)} className={chipCls}>{fmtMonth(next.y, next.m, locale)}</Link>
        </div>
        <div className="mt-3"><DownloadBar locale={locale} csv={`/prayer-times/${city.slug}/${monthKey(ym.y, ym.m)}/calendar.csv`} ics={`/prayer-times/${city.slug}/${monthKey(ym.y, ym.m)}/calendar.ics`} /></div>
      </section>

      <Faq faqs={faqs} locale={locale} />

      {sameDivision.length > 0 && (
        <section className="mt-12" aria-labelledby="div-h">
          <h2 id="div-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: 'Other divisional cities', bn: 'অন্যান্য বিভাগীয় শহর', ar: 'مدن أخرى' })}</h2>
          <CityChips list={sameDivision} locale={locale} />
        </section>
      )}
      <section className="mt-12" aria-labelledby="near-h">
        <h2 id="near-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: city.country === 'BD' ? 'Nearby districts' : `More cities in ${country}`, bn: city.country === 'BD' ? 'নিকটবর্তী জেলা' : `${country}-এর আরও শহর`, ar: 'مدن قريبة' })}</h2>
        <CityChips list={nearby} locale={locale} />
        <p className="mt-4 text-sm"><Link href={localeHref(locale, '/prayer-times')} className="font-medium text-primary hover:underline">{lt(locale, { en: 'All cities & use my location →', bn: 'সব শহর ও আমার অবস্থান →', ar: 'كل المدن وموقعي ←' })}</Link></p>
      </section>
    </div>
  )
}
