import { QuranPage, quranMeta } from '@/components/pages/quran'

export const metadata = quranMeta('bn')
export default function Page() {
  return <QuranPage locale="bn" />
}
