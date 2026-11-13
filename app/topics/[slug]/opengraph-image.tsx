import { ogContentType, ogSize } from '@/lib/content/og'
import { ogTopic } from '@/lib/content/og-pages'
import { topics } from '@/data/content/topics'

export const alt = 'What does the Quran say about this topic?'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => topics.map((t) => ({ slug: t.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogTopic((await params).slug, 'en')
}
