import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { getJuzName } from '@/lib/reader/juz'

export const alt = 'Juz (Para) of the Holy Quran with translation'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => Array.from({ length: 30 }, (_, i) => ({ n: String(i + 1) }))

export default async function Image({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n)
  if (!Number.isInteger(n) || n < 1 || n > 30) return renderOg({ title: 'Read the Holy Quran' })
  const name = getJuzName(n)
  return renderOg({ kicker: `Para ${n}`, title: `Juz ${n} — ${name.tl}`, subtitle: 'Arabic text with English & Bangla translation, tajweed and audio', arabic: name.ar, arabicSize: 92 })
}
