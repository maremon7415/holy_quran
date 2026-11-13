import Link from 'next/link'
import { CityFinder } from './city-finder'
import { CityChips, chipCls } from './city-ui'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bdCities, cities, countryName, divisionalCities, worldCities } from '@/lib/places/cities'
import { currentOrNextRamadan } from '@/lib/places/hijri'
import { zonedYmd } from '@/lib/places/dates'

const finder = cities.map((c) => ({ slug: c.slug, en: c.name.en, bn: c.name.bn, country: countryName(c.country, 'en'), lat: c.lat, lng: c.lng }))

/** Server-rendered city directory (internal links for crawlers) + client search / nearest-city finder. Shown on /prayer-times. */
export function CityDirectory({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const byCountry = new Map<string, typeof worldCities>()
  for (const c of worldCities) byCountry.set(c.country, [...(byCountry.get(c.country) ?? []), c])
  const r = currentOrNextRamadan(zonedYmd(Date.now(), 'Asia/Dhaka')).range
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6" aria-labelledby="dir-h">
      <h2 id="dir-h" className="font-display text-2xl font-semibold sm:text-3xl">{lt(locale, { en: 'Prayer times by city', bn: 'শহরভিত্তিক নামাজের সময়সূচি', ar: 'مواقيت الصلاة حسب المدينة' })}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{lt(locale, { en: 'Today’s Fajr, Dhuhr, Asr, Maghrib and Isha, sehri & iftar, a 30-day timetable and Qibla for every district of Bangladesh and major world cities.', bn: 'বাংলাদেশের প্রতিটি জেলা ও বিশ্বের প্রধান শহরের আজকের ফজর, যোহর, আসর, মাগরিব ও এশা, সেহরি-ইফতার, ৩০ দিনের সময়সূচি ও কিবলা।', ar: 'مواقيت اليوم وجدول ٣٠ يومًا والقبلة لكل مدينة.' })}</p>
      <div className="mt-5"><CityFinder cities={finder} /></div>

      <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'Divisional cities', bn: 'বিভাগীয় শহর', ar: 'مدن الأقسام' })}</h3>
      <CityChips list={divisionalCities} locale={locale} />
      <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'All 64 districts of Bangladesh', bn: 'বাংলাদেশের ৬৪ জেলা', ar: 'جميع مناطق بنغلاديش' })}</h3>
      <CityChips list={bdCities.filter((c) => !c.division)} locale={locale} />
      <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{lt(locale, { en: 'World cities', bn: 'বিশ্বের শহর', ar: 'مدن العالم' })}</h3>
      <div className="space-y-4">
        {[...byCountry.entries()].map(([cc, list]) => (
          <div key={cc}>
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{countryName(cc, bn ? 'bn' : 'en')}</p>
            <CityChips list={list} locale={locale} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={localeHref(locale, `/ramadan/${r.start.y}`)} className={chipCls}>{lt(locale, { en: `Ramadan ${r.start.y} sehri & iftar timetable`, bn: `রমজান ${r.start.y} সেহরি ও ইফতারের সময়সূচি`, ar: `جدول رمضان ${r.start.y}` })}</Link>
        <Link href={localeHref(locale, '/hijri-date')} className={chipCls}>{lt(locale, { en: 'Today’s Hijri date', bn: 'আজকের হিজরি তারিখ', ar: 'التاريخ الهجري' })}</Link>
        <Link href={localeHref(locale, '/zakat-calculator')} className={chipCls}>{lt(locale, { en: 'Zakat calculator', bn: 'যাকাত ক্যালকুলেটর', ar: 'حاسبة الزكاة' })}</Link>
      </div>
    </section>
  )
}
