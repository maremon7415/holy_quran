import type { Metadata } from 'next'
import { PrayerView } from '@/components/prayer/prayer-view'
import { JsonLd } from '@/components/seo/json-ld'
import { buildMeta } from '@/lib/content/seo'
import { absoluteUrl } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'

const copy = {
  en: {
    title: 'Prayer Times Today — Fajr, Dhuhr, Asr, Maghrib, Isha | নামাজের সময়সূচি',
    description: 'Accurate Fajr, Dhuhr, Asr, Maghrib and Isha prayer times for your location with a live countdown, sun path, Hijri date and your choice of calculation method and madhab. আপনার এলাকার আজকের নামাজের সময়সূচি।',
    keywords: ['prayer times', 'salah times', 'Fajr time', 'Maghrib time', 'Islamic prayer times today', 'নামাজের সময়সূচি', 'আজকের নামাজের সময়'],
  },
  bn: {
    title: 'আজকের নামাজের সময়সূচি — ফজর, যোহর, আসর, মাগরিব, এশা | ঢাকা ও সারা বাংলাদেশ',
    description: 'আপনার অবস্থান অনুযায়ী আজকের ফজর, যোহর, আসর, মাগরিব ও এশার সঠিক সময়, সাহরি ও ইফতারের সময়, লাইভ কাউন্টডাউন, হিজরি তারিখ এবং হিসাব পদ্ধতি ও মাযহাব (হানাফি) বেছে নেওয়ার সুবিধা।',
    keywords: ['নামাজের সময়সূচি', 'আজকের নামাজের সময়', 'ঢাকার নামাজের সময়সূচি', 'ফজরের নামাজের সময়', 'মাগরিবের সময়', 'ইফতারের সময়', 'সাহরির শেষ সময়'],
  },
}

export const prayerMeta = (locale: Locale): Metadata => buildMeta({ ...copy[locale], path: '/prayer-times', locale, ogImage: locale === 'bn' ? '/bn/opengraph-image' : undefined })

export function PrayerTimesPage({ locale }: { locale: Locale }) {
  return (
    <div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: copy[locale].title, description: copy[locale].description, url: absoluteUrl(localeHref(locale, '/prayer-times')), inLanguage: locale }} />
      <PrayerView />
    </div>
  )
}
