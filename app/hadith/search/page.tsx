import { HadithSearchPage, hadithSearchMeta, type SearchProps } from '@/components/pages/hadith-search'

export const generateMetadata = (p: SearchProps) => hadithSearchMeta('en', p)
export default function Page(p: SearchProps) {
  return <HadithSearchPage locale="en" {...p} />
}
