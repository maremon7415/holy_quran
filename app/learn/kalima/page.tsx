import { KalimaPage } from '@/components/pages/learn-kalima'
import { guideMeta } from '@/components/pages/learn'

export const metadata = guideMeta('kalima', 'en')
export default function Page() {
  return <KalimaPage locale="en" />
}
