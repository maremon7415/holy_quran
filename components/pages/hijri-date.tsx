import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { HijriConverter, HijriLive } from '@/components/places/hijri-tools'
import { chipCls } from '@/components/places/city-ui'
import events from '@/public/data/islamic-events.json'
import { buildMeta } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl } from '@/lib/site'
import { addDays, bnDigits, cmpYmd, fmtDate, zonedYmd } from '@/lib/places/times'
import { fmtHijri, gregorianOf, hijriOf, currentOrNextRamadan, ramadanLabel, ramadanPath, HIJRI_MONTHS } from '@/lib/places/hijri'

const TZ = 'Asia/Dhaka'

interface Ev { id: string; name: string; nameBn: string; nameAr?: string; hijriMonth: number; hijriDay: number; description: { en: string; bn: string; ar?: string } }

function upcoming(today: ReturnType<typeof zonedYmd>, n = 8) {
  const hy = hijriOf(today).y
  const list = (events as Ev[]).map((e) => {
    let date = gregorianOf(hy, e.hijriMonth, e.hijriDay)
    if (!date || cmpYmd(date, today) < 0) date = gregorianOf(hy + 1, e.hijriMonth, e.hijriDay)
    return { e, date: date! }
  })
  return list.sort((a, b) => cmpYmd(a.date, b.date)).slice(0, n)
}

export function hijriMeta(locale: Locale): Metadata {
  const today = zonedYmd(Date.now(), TZ)
  const h = hijriOf(today)
  return buildMeta({
    title: locale === 'bn'
      ? 'আজকের হিজরি (আরবি) তারিখ — আজ আরবি মাসের কত তারিখ? | Hijri Date Today & Converter'
      : 'Today’s Hijri Date — Islamic Date Today & Hijri Converter | আজ আরবি মাসের কত তারিখ',
    description: locale === 'bn'
      ? `আজ ${fmtDate(today, 'bn', { weekday: true })} — উম্মুল কুরা অনুযায়ী হিজরি তারিখ ${fmtHijri(h, 'bn')}। ইংরেজি ↔ হিজরি তারিখ কনভার্টার, আসন্ন ইসলামিক দিবস এবং বাংলাদেশ ও সৌদির তারিখের পার্থক্য।`
      : `Today (${fmtDate(today, 'en', { weekday: true })}) is ${fmtHijri(h, 'en')} by the Umm al-Qura calendar. Gregorian ↔ Hijri converter, upcoming Islamic events and why Bangladesh is often a day behind Saudi Arabia.`,
    keywords: ['today hijri date', 'islamic date today', 'hijri date converter', 'arabic date today', 'আজ আরবি মাসের কত তারিখ', 'আজকের আরবি তারিখ', 'হিজরি তারিখ আজ', 'আরবি তারিখ কনভার্টার'],
    path: '/hijri-date',
    locale,
  })
}

export function HijriDatePage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const today = zonedYmd(Date.now(), TZ)
  const h = hijriOf(today)
  const bd = hijriOf(addDays(today, -1))
  const ev = upcoming(today)
  const ram = currentOrNextRamadan(today).range
  const path = localeHref(locale, '/hijri-date')
  const days = (e: { date: ReturnType<typeof zonedYmd> }) => Math.round((Date.UTC(e.date.y, e.date.m - 1, e.date.d) - Date.UTC(today.y, today.m - 1, today.d)) / 864e5)
  const faqs = bn
    ? [
        { q: 'আজ আরবি মাসের কত তারিখ?', a: `${fmtDate(today, 'bn', { weekday: true })} উম্মুল কুরা (সৌদি) ক্যালেন্ডার অনুযায়ী আজ ${fmtHijri(h, 'bn')}। বাংলাদেশে সাধারণত একদিন পরে, অর্থাৎ আনুমানিক ${fmtHijri(bd, 'bn')}।` },
        { q: 'বাংলাদেশ ও সৌদি আরবের হিজরি তারিখ আলাদা কেন?', a: 'হিজরি মাস শুরু হয় নতুন চাঁদ দেখার মাধ্যমে। সৌদি আরব উম্মুল কুরা ক্যালেন্ডার ব্যবহার করে, আর বাংলাদেশ স্থানীয়ভাবে চাঁদ দেখার ভিত্তিতে মাস শুরু করে, তাই প্রায়ই একদিনের পার্থক্য হয়।' },
        { q: 'হিজরি বর্ষে কত মাস ও কত দিন?', a: 'হিজরি বর্ষে ১২টি চান্দ্র মাস; প্রতি মাস ২৯ বা ৩০ দিনের, বছরে প্রায় ৩৫৪ দিন — তাই প্রতি বছর ইংরেজি তারিখের তুলনায় প্রায় ১০–১১ দিন এগিয়ে আসে।' },
        { q: 'ইসলামি দিন কখন শুরু হয়?', a: 'ইসলামি দিন সূর্যাস্ত (মাগরিব) থেকে শুরু হয়; তাই মাগরিবের পর হিজরি তারিখ পরের দিনের গণ্য করা হয়। এই পাতার তারিখ ইংরেজি দিনের (মধ্যরাত থেকে) ভিত্তিতে।' },
      ]
    : [
        { q: 'What is today’s Hijri date?', a: `${fmtDate(today, 'en', { weekday: true })} is ${fmtHijri(h, 'en')} by the Umm al-Qura (Saudi) calendar. In Bangladesh it is usually one day later in the count, i.e. about ${fmtHijri(bd, 'en')} (an estimate).` },
        { q: 'Why is the Hijri date in Bangladesh different from Saudi Arabia?', a: 'Hijri months begin with the new crescent. Saudi Arabia uses the Umm al-Qura calendar, while Bangladesh starts months from local moon sighting, so the dates often differ by a day.' },
        { q: 'How many months and days are in a Hijri year?', a: 'Twelve lunar months of 29 or 30 days, about 354 days, so Islamic dates move 10–11 days earlier against the Gregorian calendar each year.' },
        { q: 'When does the Islamic day begin?', a: 'The Islamic day begins at sunset (Maghrib), so after Maghrib the Hijri date is commonly counted as the next day. The date on this page changes at midnight.' },
      ]

  return (
    <div className={pageShell}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: bn ? 'আজকের হিজরি তারিখ' : 'Today’s Hijri date', url: absoluteUrl(path), inLanguage: locale, dateModified: new Date().toISOString() }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'হিজরি তারিখ' : 'Hijri Date', ar: 'التاريخ الهجري', href: '/hijri-date' }]} className="mb-4" />
      <PageHero
        eyebrow={lt(locale, { en: 'Umm al-Qura calendar', bn: 'উম্মুল কুরা ক্যালেন্ডার', ar: 'تقويم أم القرى' })}
        icon="calendar"
        title={bn ? <>আজ আরবি মাসের কত তারিখ? হিজরি তারিখ আজ</> : <>Today’s Hijri Date</>}
        subtitle={lt(locale, { en: 'The Islamic (Hijri) date today in English, Bangla and Arabic, with a Gregorian ↔ Hijri converter and upcoming Islamic events.', bn: 'আজকের ইসলামি (হিজরি) তারিখ বাংলা, ইংরেজি ও আরবিতে — সাথে ইংরেজি ↔ হিজরি কনভার্টার ও আসন্ন ইসলামি দিবস।', ar: 'تاريخ اليوم الهجري بالعربية والإنجليزية والبنغالية مع محوّل التاريخ.' })}
      >
        <HijriLive greg={today} />
      </PageHero>

      <section className="mt-10" aria-labelledby="conv-h">
        <h2 id="conv-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: 'Hijri date converter', bn: 'হিজরি তারিখ কনভার্টার', ar: 'محوّل التاريخ الهجري' })}</h2>
        <HijriConverter initial={today} />
      </section>

      <section className="mt-10" aria-labelledby="ev-h">
        <h2 id="ev-h" className="font-display mb-2 text-2xl font-semibold">{lt(locale, { en: 'Upcoming Islamic events', bn: 'আসন্ন ইসলামি দিবস', ar: 'المناسبات الإسلامية القادمة' })}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{lt(locale, { en: 'Gregorian dates follow the Umm al-Qura calendar; actual observance can differ by a day depending on moon sighting.', bn: 'ইংরেজি তারিখ উম্মুল কুরা অনুযায়ী; চাঁদ দেখার উপর নির্ভর করে পালনের দিন একদিন আগে-পরে হতে পারে।', ar: 'التواريخ وفق أم القرى وقد تختلف بيوم حسب الرؤية.' })}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ev.map(({ e, date }) => (
            <li key={e.id} className="card-soft rounded-3xl p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{bn ? e.nameBn : e.name}</h3>
                <span className="shrink-0 text-xs font-semibold text-primary">{days({ date }) === 0 ? lt(locale, { en: 'Today', bn: 'আজ', ar: 'اليوم' }) : lt(locale, { en: `in ${days({ date })} days`, bn: `${bnDigits(days({ date }))} দিন পর`, ar: `بعد ${days({ date })} يومًا` })}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{fmtDate(date, locale, { weekday: true })} · {bn ? `${bnDigits(e.hijriDay)} ${HIJRI_MONTHS.bn[e.hijriMonth - 1]}` : `${e.hijriDay} ${HIJRI_MONTHS.en[e.hijriMonth - 1]}`}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bn ? e.description.bn : e.description.en}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={localeHref(locale, ramadanPath(ram))} className={chipCls}>{lt(locale, { en: `Ramadan ${ramadanLabel(ram, 'en')} timetable`, bn: `রমজান ${ramadanLabel(ram, 'bn')} সময়সূচি`, ar: `جدول رمضان ${ramadanLabel(ram, 'ar')}` })}</Link>
          <Link href={localeHref(locale, '/events')} className={chipCls}>{lt(locale, { en: 'All Islamic events & Eid dates', bn: 'সব ইসলামি দিবস ও ঈদের তারিখ', ar: 'كل المناسبات الإسلامية' })}</Link>
          <Link href="/calendar" className={chipCls}>{lt(locale, { en: 'Hijri calendar', bn: 'হিজরি ক্যালেন্ডার', ar: 'التقويم الهجري' })}</Link>
          <Link href={localeHref(locale, '/prayer-times/dhaka')} className={chipCls}>{lt(locale, { en: 'Dhaka prayer times', bn: 'ঢাকার নামাজের সময়', ar: 'مواقيت دكا' })}</Link>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-gold/40 bg-gold-soft/40 p-5 text-sm leading-relaxed" aria-labelledby="sight-h">
        <h2 id="sight-h" className="font-display mb-1 text-lg font-semibold">{lt(locale, { en: 'Moon sighting differs by region', bn: 'অঞ্চলভেদে চাঁদ দেখার পার্থক্য', ar: 'اختلاف رؤية الهلال بين المناطق' })}</h2>
        <p className="text-muted-foreground">{lt(locale, {
          en: 'The Umm al-Qura calendar is a calculated calendar used in Saudi Arabia. Many countries, including Bangladesh, India and Pakistan, begin each month from local crescent sighting announced by a national committee — which frequently makes them a day behind Saudi Arabia. For Ramadan, Eid and other observances follow your national announcement.',
          bn: 'উম্মুল কুরা সৌদি আরবে ব্যবহৃত হিসাবভিত্তিক ক্যালেন্ডার। বাংলাদেশ, ভারত ও পাকিস্তানসহ অনেক দেশে জাতীয় কমিটির ঘোষিত স্থানীয় চাঁদ দেখার ভিত্তিতে মাস শুরু হয় — ফলে প্রায়ই সৌদি আরবের একদিন পরে থাকে। রমজান, ঈদ ও অন্যান্য দিবসে আপনার দেশের সরকারি ঘোষণা অনুসরণ করুন।',
          ar: 'تقويم أم القرى حسابي، وكثير من الدول تبدأ أشهرها بالرؤية المحلية فتتأخر غالبًا بيومًا عن السعودية.',
        })}</p>
      </section>

      <Faq faqs={faqs} locale={locale} />
    </div>
  )
}
