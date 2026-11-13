import { QuranPage, quranMeta } from '@/components/pages/quran'

export const metadata = quranMeta('en')
export default function Page() {
  return <QuranPage locale="en" />
}
