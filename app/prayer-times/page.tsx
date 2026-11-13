import type { Metadata } from 'next'
import { PrayerView } from '@/components/prayer/prayer-view'
import { absoluteUrl } from '@/lib/site'

const title = 'Prayer Times Today — Fajr, Dhuhr, Asr, Maghrib, Isha | নামাজের সময়সূচি'
const description =
  'Accurate Fajr, Dhuhr, Asr, Maghrib and Isha prayer times for your location with a live countdown, sun path, Hijri date and your choice of calculation method and madhab. আপনার এলাকার আজকের নামাজের সময়সূচি।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['prayer times', 'salah times', 'Fajr time', 'Maghrib time', 'Islamic prayer times today', 'নামাজের সময়সূচি', 'আজকের নামাজের সময়'],
  alternates: { canonical: '/prayer-times' },
  openGraph: { title, description, url: absoluteUrl('/prayer-times'), type: 'website' },
}

export default function PrayerTimesPage() {
  return (
    <div>
      <PrayerView />
    </div>
  )
}
