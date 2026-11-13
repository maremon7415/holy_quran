import { AlphabetPage } from '@/components/pages/learn-alphabet'
import { guideMeta } from '@/components/pages/learn'

export const metadata = guideMeta('arabic-alphabet', 'en')
export default function Page() {
  return <AlphabetPage locale="en" />
}
