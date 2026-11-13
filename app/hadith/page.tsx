import { HadithIndexPage, hadithIndexMeta } from '@/components/pages/hadith'

export const revalidate = 3600
export const metadata = hadithIndexMeta('en')
export default function Page() {
  return <HadithIndexPage locale="en" />
}
