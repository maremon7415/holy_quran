import { CollectionPage, collectionPageMeta, collectionParams, hadithListRevalidate, type CollectionProps } from '@/components/pages/hadith'

export const dynamicParams = true
export const revalidate = hadithListRevalidate * 24
export const generateStaticParams = collectionParams
export const generateMetadata = (p: CollectionProps) => collectionPageMeta('bn', p)
export default function Page(p: CollectionProps) {
  return <CollectionPage locale="bn" {...p} />
}
