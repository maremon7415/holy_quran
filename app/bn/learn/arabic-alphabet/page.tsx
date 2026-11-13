import { AlphabetPage } from '@/components/pages/learn-alphabet'
import { guideMeta } from '@/components/pages/learn'

export const metadata = guideMeta('arabic-alphabet', 'bn')
export default function Page() {
  return <AlphabetPage locale="bn" />
}
