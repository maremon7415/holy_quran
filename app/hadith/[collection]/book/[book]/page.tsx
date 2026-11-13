import { BookPage, bookMeta, bookParams, type BookProps } from '@/components/pages/hadith'

export const dynamicParams = true
export const revalidate = 86400
export const generateStaticParams = bookParams
export const generateMetadata = (p: BookProps) => bookMeta('en', p)
export default function Page(p: BookProps) {
  return <BookPage locale="en" {...p} />
}
