import { ogContentType, ogSize } from '@/lib/content/og'
import { ogDua } from '@/lib/content/og-pages'
import { duas } from '@/data/content/duas'

export const alt = 'আরবি, উচ্চারণ ও অর্থসহ দোয়া'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => duas.map((d) => ({ slug: d.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogDua((await params).slug, 'bn')
}
