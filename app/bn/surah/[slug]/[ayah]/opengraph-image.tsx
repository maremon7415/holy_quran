import { ogContentType, ogSize } from '@/lib/content/og'
import { ogAyah } from '@/lib/content/og-pages'
import { resolveChapterId } from '@/lib/quran/chapters'

export const alt = 'আরবি পাঠ ও বাংলা অনুবাদসহ কুরআনের আয়াত'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: { params: Promise<{ slug: string; ayah: string }> }) {
  const { slug, ayah } = await params
  return ogAyah(resolveChapterId(slug), Number(ayah), 'bn')
}
