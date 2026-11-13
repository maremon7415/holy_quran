import { ogContentType, ogSize } from '@/lib/content/og'
import { ogName } from '@/lib/content/og-pages'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'

export const alt = 'Name of Allah: meaning'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => asmaUlHusna.map((n) => ({ slug: n.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogName((await params).slug, 'en')
}
