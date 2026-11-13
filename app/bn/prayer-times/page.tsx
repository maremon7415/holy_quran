import { PrayerTimesPage, prayerMeta } from '@/components/pages/prayer-times'

export const metadata = prayerMeta('bn')
export default function Page() {
  return <PrayerTimesPage locale="bn" />
}
