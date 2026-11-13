import { HadithIndexPage, hadithIndexMeta } from '@/components/pages/hadith'

export const revalidate = 3600
export const metadata = hadithIndexMeta('bn')
export default function Page() {
  return <HadithIndexPage locale="bn" />
}
