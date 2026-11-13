import { HadithIndexPage, hadithIndexMeta, hadithListRevalidate } from '@/components/pages/hadith'

export const revalidate = hadithListRevalidate
export const metadata = hadithIndexMeta('en')
export default function Page() {
  return <HadithIndexPage locale="en" />
}
