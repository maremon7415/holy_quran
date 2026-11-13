import { BookPage, bookMeta, bookParams, type BookProps } from '@/components/pages/hadith'

export const dynamicParams = true
export const revalidate = 86400

export const generateMetadata = (p: BookProps) => bookMeta('bn', p)
export default function Page(p: BookProps) {
  return <BookPage locale="bn" {...p} />
}
