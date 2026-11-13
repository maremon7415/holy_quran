import { ogContentType, ogSize } from '@/lib/content/og'
import { ogSurah } from '@/lib/content/og-pages'
import { chapters, resolveChapterId } from '@/lib/quran/chapters'

export const alt = 'আরবি পাঠ, বাংলা উচ্চারণ ও বাংলা অনুবাদসহ সূরা'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => chapters.map((c) => ({ slug: c.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return ogSurah(resolveChapterId((await params).slug), 'bn')
}
