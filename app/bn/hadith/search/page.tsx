import { HadithSearchPage, hadithSearchMeta, type SearchProps } from '@/components/pages/hadith-search'

export const generateMetadata = (p: SearchProps) => hadithSearchMeta('bn', p)
export default function Page(p: SearchProps) {
  return <HadithSearchPage locale="bn" {...p} />
}
