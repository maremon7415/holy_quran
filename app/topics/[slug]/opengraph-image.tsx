import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { topics, topicBySlug } from '@/data/content/topics'

export const alt = 'What does the Quran say about this topic?'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => topics.map((t) => ({ slug: t.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const t = topicBySlug((await params).slug)
  if (!t) return renderOg({ title: 'Quran topics' })
  return renderOg({ kicker: 'Quran topics', title: `What does the Quran say about ${t.en}?`, subtitle: `${t.refs.length} verses with Arabic, English & Bangla translation`, arabic: 'قُرْآن', arabicSize: 84 })
}
