import { HadithPage, hadithMeta, hadithParams, hadithRevalidate, type HadithProps } from '@/components/pages/hadith-detail'

export const dynamicParams = true
export const revalidate = hadithRevalidate
export const generateStaticParams = hadithParams
export const generateMetadata = (p: HadithProps) => hadithMeta('en', p)
export default function Page(p: HadithProps) {
  return <HadithPage locale="en" {...p} />
}
