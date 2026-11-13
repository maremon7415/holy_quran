import { HadithIndexPage, hadithIndexMeta, hadithListRevalidate } from '@/components/pages/hadith'

export const revalidate = hadithListRevalidate
export const metadata = hadithIndexMeta('bn')
export default function Page() {
  return <HadithIndexPage locale="bn" />
}
