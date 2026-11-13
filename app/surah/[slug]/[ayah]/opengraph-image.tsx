import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { chapters, resolveChapterId } from '@/lib/quran/chapters'
import { getVerse } from '@/lib/quran/data'

export const alt = 'Quran ayah with Arabic text and translation'
export const size = ogSize
export const contentType = ogContentType

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, s.lastIndexOf(' ', n) > 0 ? s.lastIndexOf(' ', n) : n)} …` : s)

export default async function Image({ params }: { params: Promise<{ slug: string; ayah: string }> }) {
  const { slug, ayah } = await params
  const id = resolveChapterId(slug)
  const n = Number(ayah)
  const v = id && Number.isInteger(n) ? await getVerse(id, n) : null
  if (!id || !v) return renderOg({ title: 'Read the Holy Quran' })
  const c = chapters[id - 1]
  return renderOg({
    kicker: `Quran ${v.k}`,
    title: `Surah ${c.nameSimple} · Ayah ${n}`,
    subtitle: clip(`“${v.en}”`, 120),
    arabic: clip(v.ar, 70),
    arabicSize: 60,
  })
}
