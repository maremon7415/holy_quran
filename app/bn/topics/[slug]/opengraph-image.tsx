import { ogContentType, ogSize } from '@/lib/content/og'
import { ogTopic } from '@/lib/content/og-pages'
import { topics } from '@/data/content/topics'

export const alt = 'এই বিষয়ে কুরআন কী বলে?'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => topics.map((t) => ({ slug: t.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogTopic((await params).slug, 'bn')
}
