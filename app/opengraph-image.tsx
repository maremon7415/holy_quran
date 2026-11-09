import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { site } from '@/lib/site'

export const alt = `${site.name}: ${site.tagline}`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return renderOg({ title: 'Read, listen, understand & memorise the Holy Quran', subtitle: 'Bangla & English translation · word-by-word · tafsir · duas · 99 Names of Allah', arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', arabicSize: 68 })
}
