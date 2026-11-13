import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { chapters, resolveChapterId } from '@/lib/quran/chapters'

export const alt = 'Surah with Arabic text, Bangla & English translation'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => chapters.map((c) => ({ slug: c.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const id = resolveChapterId((await params).slug)
  if (!id) return renderOg({ title: 'Read the Holy Quran' })
  const c = chapters[id - 1]
  return renderOg({
    kicker: `Surah ${id}`,
    title: `Surah ${c.nameSimple}`,
    subtitle: `${c.meaning} · ${c.versesCount} ayahs · ${c.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}`,
    arabic: `سورة ${c.nameArabic}`,
    arabicSize: 92,
  })
}
