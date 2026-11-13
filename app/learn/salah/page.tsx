import { SalahPage } from '@/components/pages/learn-salah'
import { guideMeta } from '@/components/pages/learn'

export const metadata = guideMeta('salah', 'en')
export default function Page() {
  return <SalahPage locale="en" />
}
