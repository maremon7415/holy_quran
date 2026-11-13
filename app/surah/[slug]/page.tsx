import { SurahPage, surahMeta, surahParams, type SurahProps } from '@/components/pages/surah'

export const dynamicParams = true
export const generateStaticParams = surahParams
export const generateMetadata = (p: SurahProps) => surahMeta('en', p)
export default function Page(p: SurahProps) {
  return <SurahPage locale="en" {...p} />
}
