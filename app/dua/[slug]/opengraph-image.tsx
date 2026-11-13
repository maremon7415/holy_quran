import { ogContentType, ogSize } from '@/lib/content/og'
import { ogDua } from '@/lib/content/og-pages'
import { duas } from '@/data/content/duas'

export const alt = 'Dua with Arabic, transliteration and meaning'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => duas.map((d) => ({ slug: d.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogDua((await params).slug, 'en')
}
