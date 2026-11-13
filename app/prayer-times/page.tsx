import { PrayerTimesPage, prayerMeta } from '@/components/pages/prayer-times'

export const metadata = prayerMeta('en')
export default function Page() {
  return <PrayerTimesPage locale="en" />
}
