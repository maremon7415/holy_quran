import { TajweedIndexPage } from '@/components/pages/learn-tajweed'
import { guideMeta } from '@/components/pages/learn'

export const metadata = guideMeta('tajweed', 'en')
export default function Page() {
  return <TajweedIndexPage locale="en" />
}
