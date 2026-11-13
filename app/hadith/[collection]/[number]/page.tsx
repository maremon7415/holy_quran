import { HadithPage, hadithMeta, hadithParams, type HadithProps } from '@/components/pages/hadith-detail'

export const dynamicParams = true
export const revalidate = 21600
export const generateStaticParams = hadithParams
export const generateMetadata = (p: HadithProps) => hadithMeta('en', p)
export default function Page(p: HadithProps) {
  return <HadithPage locale="en" {...p} />
}
