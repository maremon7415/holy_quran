import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { DownloadBar, PrintStyles, TimeTable, chipCls } from '@/components/places/city-ui'
import { buildMeta } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/site'
import { bnGenitive, cities, cityTitle, METHOD_NAMES } from '@/lib/places/cities'
import { cityToday, citySpan, daysInMonth, fmtClock, fmtMonth } from '@/lib/places/times'
import { monthDiff, monthKey } from '@/lib/places/export'
import { MONTH_RANGE, resolveMonth } from '@/lib/places/months'

export type MonthProps = { params: Promise<{ city: string; month: string }> }

export function monthParams() {
  const now = Date.now()
  return cities.flatMap((c) => {
    const t = cityToday(c, now)
    const next = t.m === 12 ? { y: t.y + 1, m: 1 } : { y: t.y, m: t.m + 1 }
    return [monthKey(t.y, t.m), monthKey(next.y, next.m)].map((month) => ({ city: c.slug, month }))
  })
}

async function load(params: MonthProps['params'], locale: Locale) {
  const { city, month } = await params
  const r = resolveMonth(city, month)
  if (!r) notFound()
  if (r.city.slug !== city) permanentRedirect(localeHref(locale, `/prayer-times/${r.city.slug}/${month}`))
  return r
}

export async function monthMeta(locale: Locale, { params }: MonthProps): Promise<Metadata> {
  const { city, y, m } = await load(params, locale)
  const en = cityTitle(city, 'en')
  const label = fmtMonth(y, m, locale)
  const days = citySpan(city, { y, m, d: 1 }, 1)
  return buildMeta({
    title: locale === 'bn'
      ? `${bnGenitive(city.name.bn)} নামাজের সময়সূচি ${label} — মাসিক ক্যালেন্ডার | ${en} Prayer Times`
      : `${en} Prayer Times ${label} — Monthly Timetable (Print, CSV, iCal) | ${bnGenitive(city.name.bn)} নামাজের সময়সূচি`,
    description: locale === 'bn'
      ? `${bnGenitive(city.name.bn)} ${label} মাসের প্রতিদিনের ফজর, সূর্যোদয়, যোহর, আসর, মাগরিব ও এশার সময়সূচি। প্রিন্ট, CSV ও ক্যালেন্ডার (.ics) ডাউনলোডসহ। ১ তারিখে ফজর ${fmtClock(days[0].fajr, city.tz, 'bn')}।`
      : `Daily Fajr, Sunrise, Dhuhr, Asr, Maghrib and Isha times for ${en} in ${label}. Printable, with CSV and calendar (.ics) downloads. Fajr on the 1st: ${fmtClock(days[0].fajr, city.tz, 'en')}.`,
    keywords: [`${city.name.en} prayer times ${label}`, `${city.name.en} namaz timetable`, `${city.name.en} monthly prayer time table`, `${bnGenitive(city.name.bn)} নামাজের সময়সূচি`],
    path: `/prayer-times/${city.slug}/${monthKey(y, m)}`,
    locale,
  })
}

export async function CityMonthPage({ locale, params }: { locale: Locale } & MonthProps) {
  const { city, y, m, today } = await load(params, locale)
  const bn = locale === 'bn'
  const name = cityTitle(city, locale)
  const days = citySpan(city, { y, m, d: 1 }, daysInMonth(y, m))
  const label = fmtMonth(y, m, locale)
  const key = monthKey(y, m)
  const path = localeHref(locale, `/prayer-times/${city.slug}/${key}`)
  const cur = { y: today.y, m: today.m }
  const shift = (n: number) => {
    const i = y * 12 + (m - 1) + n
    return { y: Math.floor(i / 12), m: (i % 12) + 1 }
  }
  const prev = shift(-1), nxt = shift(1)
  const canPrev = Math.abs(monthDiff(cur, prev)) <= MONTH_RANGE
  const canNext = Math.abs(monthDiff(cur, nxt)) <= MONTH_RANGE
  const href = (v: { y: number; m: number }) => localeHref(locale, `/prayer-times/${city.slug}/${monthKey(v.y, v.m)}`)
  const first = days[0], last = days[days.length - 1]
  const faqs = bn
    ? [
        { q: `${label}-এ ${bnGenitive(name)} ফজরের সময় কখন?`, a: `${label}-এর ১ তারিখে ফজর ${fmtClock(first.fajr, city.tz, 'bn')} এবং শেষ তারিখে ${fmtClock(last.fajr, city.tz, 'bn')}। প্রতিদিনের সময় উপরের সারণিতে দেওয়া আছে।` },
        { q: `এই সময়সূচি কোন পদ্ধতিতে হিসাব করা?`, a: `${METHOD_NAMES[city.method].bn} পদ্ধতিতে, ${city.madhab === 'hanafi' ? 'হানাফি' : 'স্ট্যান্ডার্ড'} আসর সহ। স্থানীয় মসজিদের সময় কয়েক মিনিট আলাদা হতে পারে।` },
      ]
    : [
        { q: `What time is Fajr in ${name} in ${label}?`, a: `Fajr in ${name} is ${fmtClock(first.fajr, city.tz, 'en')} on the 1st and ${fmtClock(last.fajr, city.tz, 'en')} on the last day of ${label}. Every day is listed in the table above.` },
        { q: `Which method is this timetable based on?`, a: `${METHOD_NAMES[city.method].en}, with ${city.madhab === 'hanafi' ? 'Hanafi' : 'standard (Shafi’i)'} Asr. Your local mosque may differ by a few minutes.` },
      ]

  return (
    <div className={pageShell}>
      <PrintStyles />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: `${name} prayer times ${label}`, url: absoluteUrl(path), inLanguage: locale, about: { '@type': 'Place', name: city.name.en, geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng } } }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'নামাজের সময়' : 'Prayer Times', ar: 'مواقيت الصلاة', href: '/prayer-times' }, { name, href: `/prayer-times/${city.slug}` }, { name: label, href: `/prayer-times/${city.slug}/${key}` }]} className="mb-4 print:hidden" />
      <div className="print:[&>section]:rounded-none">
        <PageHero
          eyebrow={lt(locale, { en: 'Monthly timetable', bn: 'মাসিক সময়সূচি', ar: 'الجدول الشهري' })}
          icon="calendar"
          title={bn ? <>{bnGenitive(name)} নামাজের সময়সূচি — {label}</> : <>{name} Prayer Times — {label}</>}
          subtitle={lt(locale, { en: `All six times for every day of ${label}, in ${city.tz.replace(/_/g, ' ')} local time.`, bn: `${label}-এর প্রতিদিনের ছয়টি সময় — ${city.tz.replace(/_/g, ' ')} স্থানীয় সময়ে।`, ar: 'كل مواقيت الشهر بالتوقيت المحلي.' })}
        />
      </div>
      <div className="mt-6"><DownloadBar locale={locale} csv={`/prayer-times/${city.slug}/${key}/calendar.csv`} ics={`/prayer-times/${city.slug}/${key}/calendar.ics`} /></div>
      <div className="mt-6">
        <TimeTable city={city} days={days} locale={locale} caption={`${name} prayer times ${label}`} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {lt(locale, { en: `Calculated with ${METHOD_NAMES[city.method].en}${city.madhab === 'hanafi' ? ', Hanafi Asr (standard Asr in the last column)' : ', standard Asr'}. Fridays are highlighted in gold.`, bn: `${METHOD_NAMES[city.method].bn} পদ্ধতিতে হিসাবকৃত${city.madhab === 'hanafi' ? ', হানাফি আসর (শেষ কলামে স্ট্যান্ডার্ড আসর)' : ', স্ট্যান্ডার্ড আসর'}। শুক্রবার সোনালি রঙে চিহ্নিত।`, ar: 'الجمعة بلون ذهبي.' })}
      </p>
      <nav data-print-hide className="mt-6 flex flex-wrap items-center justify-between gap-2" aria-label={bn ? 'মাস পরিবর্তন' : 'Month navigation'}>
        {canPrev ? <Link href={href(prev)} className={chipCls}>← {fmtMonth(prev.y, prev.m, locale)}</Link> : <span />}
        <Link href={localeHref(locale, `/prayer-times/${city.slug}`)} className={chipCls}>{lt(locale, { en: `Today in ${name}`, bn: `আজ ${bnGenitive(name)}`, ar: 'اليوم' })}</Link>
        {canNext ? <Link href={href(nxt)} className={chipCls}>{fmtMonth(nxt.y, nxt.m, locale)} →</Link> : <span />}
      </nav>
      <div data-print-hide><Faq faqs={faqs} locale={locale} /></div>
    </div>
  )
}
