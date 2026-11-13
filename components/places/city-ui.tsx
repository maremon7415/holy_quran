import Link from 'next/link'
import { UiIcon } from '@/components/ui-icon'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { T } from '@/lib/i18n/text'
import { REMINDER_NAMES } from '@/lib/prayer/times'
import { cityTitle, countryName, type City } from '@/lib/places/cities'
import { clockParts, fmtDate, type CityDay, type SlotKey } from '@/lib/places/times'
import { TodayMarker, PrintButton } from './city-live'

export const ICONS: Record<SlotKey, string> = { fajr: 'moon', sunrise: 'sun', dhuhr: 'sun', asr: 'sun', maghrib: 'lantern', isha: 'moon' }

export function Clock({ ms, tz, locale, className = '' }: { ms: number; tz: string; locale: Locale; className?: string }) {
  const { time, suffix } = clockParts(ms, tz, locale)
  const bn = locale === 'bn'
  return (
    <time dateTime={new Date(ms).toISOString()} className={`tabular-nums ${className}`}>
      {bn ? <><span className="text-[0.6em] font-medium text-muted-foreground">{suffix}</span> {time}</> : <>{time} <span className="text-[0.6em] font-medium text-muted-foreground">{suffix}</span></>}
    </time>
  )
}

const cardCls = 'card-soft relative rounded-3xl p-4 text-center transition data-[current=true]:ring-2 data-[current=true]:ring-primary/50 data-[next=true]:bg-accent'

/** The six times of one day, plus the Shafi'i/standard Asr for regions that default to Hanafi. */
export function PrayerGrid({ city, day, locale }: { city: City; day: CityDay; locale: Locale }) {
  const slots: SlotKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
  const both = city.madhab === 'hanafi'
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {slots.map((k) => {
        const nm = REMINDER_NAMES[k === 'dhuhr' && day.friday ? 'jumuah' : k]
        return (
          <div key={k} data-slot={k} className={cardCls}>
            <UiIcon name={ICONS[k]} size={30} className="mx-auto" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">{lt(locale, nm)}</h3>
            <p className="font-display mt-1 text-2xl font-semibold"><Clock ms={day[k]} tz={city.tz} locale={locale} /></p>
            {k === 'asr' && both && (
              <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                {lt(locale, { en: 'Hanafi', bn: 'হানাফি', ar: 'حنفي' })}
                <br />
                <span className="opacity-90">{lt(locale, { en: 'Standard', bn: 'শাফেয়ি/স্ট্যান্ডার্ড', ar: 'الجمهور' })}: <Clock ms={day.asrStandard} tz={city.tz} locale={locale} className="font-medium text-foreground/80" /></span>
              </p>
            )}
            {k === 'asr' && !both && (
              <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                {lt(locale, { en: 'Hanafi', bn: 'হানাফি', ar: 'حنفي' })}: <Clock ms={day.asrHanafi} tz={city.tz} locale={locale} className="font-medium text-foreground/80" />
              </p>
            )}
            {k === 'dhuhr' && day.friday && <p className="mt-1 text-[11px] text-gold">{lt(locale, { en: 'Jumu’ah today', bn: 'আজ জুমার দিন', ar: 'اليوم الجمعة' })}</p>}
          </div>
        )
      })}
    </div>
  )
}

/** Sehri end (= Fajr start) and Iftar (= Maghrib) with an honest label: no invented safety margin. */
export function SehriIftar({ city, day, locale }: { city: City; day: CityDay; locale: Locale }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-accent to-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{lt(locale, { en: 'Sehri ends', bn: 'সেহরির শেষ সময়', ar: 'نهاية السحور' })}</p>
        <p className="font-display mt-1 text-4xl font-semibold"><Clock ms={day.fajr} tz={city.tz} locale={locale} /></p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{lt(locale, { en: 'This is the calculated start of Fajr. Some local timetables end sehri a few minutes earlier as a precaution; this page adds no margin.', bn: 'এটি হিসাবকৃত ফজরের শুরুর সময়। কিছু স্থানীয় সময়সূচিতে সতর্কতাবশত সেহরি কয়েক মিনিট আগে শেষ ধরা হয়; এই পাতায় কোনো বাড়তি সময় যোগ করা হয়নি।', ar: 'هذا هو بداية الفجر المحسوبة. بعض الجداول المحلية تنهي السحور قبله بدقائق احتياطًا، ولا نضيف هنا أي هامش.' })}</p>
      </div>
      <div className="rounded-3xl border border-border bg-gradient-to-br from-gold-soft/60 to-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">{lt(locale, { en: 'Iftar (Maghrib)', bn: 'ইফতারের সময় (মাগরিব)', ar: 'الإفطار (المغرب)' })}</p>
        <p className="font-display mt-1 text-4xl font-semibold"><Clock ms={day.maghrib} tz={city.tz} locale={locale} /></p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{lt(locale, { en: 'Sunset time, when Maghrib begins and the fast is broken.', bn: 'সূর্যাস্তের সময়, যখন মাগরিব শুরু হয় ও রোজা ভাঙা হয়।', ar: 'وقت غروب الشمس، حين يبدأ المغرب ويُفطر الصائم.' })}</p>
      </div>
    </div>
  )
}

const th = 'whitespace-nowrap px-2 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-3'
const td = 'whitespace-nowrap px-2 py-2 text-start text-sm tabular-nums sm:px-3'

/** Day-by-day timetable. Rows carry `data-date` so <TodayMarker/> can highlight today in the city's own calendar. */
export function TimeTable({ city, days, locale, caption }: { city: City; days: CityDay[]; locale: Locale; caption: string }) {
  const both = city.madhab === 'hanafi'
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card print:overflow-visible print:border-0">
      <TodayMarker tz={city.tz} />
      <table className="w-full min-w-[640px] border-collapse text-sm print:min-w-0 print:text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-2/70">
          <tr>
            <th scope="col" className={th}>{lt(locale, { en: 'Date', bn: 'তারিখ', ar: 'التاريخ' })}</th>
            <th scope="col" className={th}>{lt(locale, { en: 'Fajr', bn: 'ফজর', ar: 'الفجر' })}</th>
            <th scope="col" className={th}>{lt(locale, { en: 'Sunrise', bn: 'সূর্যোদয়', ar: 'الشروق' })}</th>
            <th scope="col" className={th}>{lt(locale, { en: 'Dhuhr', bn: 'যোহর', ar: 'الظهر' })}</th>
            <th scope="col" className={th}>{both ? lt(locale, { en: 'Asr (Hanafi)', bn: 'আসর (হানাফি)', ar: 'العصر (حنفي)' }) : lt(locale, { en: 'Asr', bn: 'আসর', ar: 'العصر' })}</th>
            {both && <th scope="col" className={th}>{lt(locale, { en: 'Asr (Std)', bn: 'আসর (স্ট্যান্ডার্ড)', ar: 'العصر (الجمهور)' })}</th>}
            <th scope="col" className={th}>{lt(locale, { en: 'Maghrib', bn: 'মাগরিব', ar: 'المغرب' })}</th>
            <th scope="col" className={th}>{lt(locale, { en: 'Isha', bn: 'এশা', ar: 'العشاء' })}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {days.map((d) => (
            <tr key={d.date} data-date={d.date} className={`odd:bg-surface-2/30 data-[today=true]:bg-primary/10 data-[today=true]:font-semibold ${d.friday ? 'text-gold' : ''}`}>
              <th scope="row" className={`${td} font-medium`}>{fmtDate(d.ymd, locale, { year: false })} <span className="text-xs font-normal text-muted-foreground">{locale === 'bn' ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'][d.weekday] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.weekday]}</span></th>
              <td className={td}><Clock ms={d.fajr} tz={city.tz} locale={locale} /></td>
              <td className={td}><Clock ms={d.sunrise} tz={city.tz} locale={locale} /></td>
              <td className={td}><Clock ms={d.dhuhr} tz={city.tz} locale={locale} /></td>
              <td className={td}><Clock ms={both ? d.asrHanafi : d.asr} tz={city.tz} locale={locale} /></td>
              {both && <td className={td}><Clock ms={d.asrStandard} tz={city.tz} locale={locale} /></td>}
              <td className={td}><Clock ms={d.maghrib} tz={city.tz} locale={locale} /></td>
              <td className={td}><Clock ms={d.isha} tz={city.tz} locale={locale} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Hides the app chrome when printing a timetable. */
export function PrintStyles() {
  return <style>{'@media print{header.sticky,footer,nav.fixed,[data-print-hide]{display:none!important}body{background:#fff!important;color:#000!important}main{padding:0!important}}'}</style>
}

export const chipCls = 'inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-accent'

export function CityChips({ list, locale, path = '/prayer-times', suffix = '' }: { list: City[]; locale: Locale; path?: string; suffix?: string }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {list.map((c) => (
        <li key={c.slug}>
          <Link href={localeHref(locale, `${path}/${c.slug}${suffix}`)} className={chipCls}>
            {locale === 'bn' ? c.name.bn : <T en={c.name.en} ar={c.name.en} />}
            <span className="text-xs text-muted-foreground">{locale === 'bn' ? c.name.en : countryName(c.country, 'en')}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function DownloadBar({ csv, ics, locale }: { csv: string; ics: string; locale: Locale }) {
  return (
    <div data-print-hide className="flex flex-wrap gap-2">
      <PrintButton className={chipCls} />
      <a href={csv} download className={chipCls}>{lt(locale, { en: 'Download CSV', bn: 'CSV ডাউনলোড', ar: 'تنزيل CSV' })}</a>
      <a href={ics} download className={chipCls}>{lt(locale, { en: 'Add to calendar (.ics)', bn: 'ক্যালেন্ডারে যোগ করুন (.ics)', ar: 'أضف إلى التقويم (.ics)' })}</a>
    </div>
  )
}

export { cityTitle }
