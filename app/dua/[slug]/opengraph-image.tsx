import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { duas, duaBySlug } from '@/data/content/duas'
import { getVersesByRefs } from '@/lib/quran/data'

export const alt = 'Dua with Arabic, transliteration and meaning'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => duas.map((d) => ({ slug: d.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const d = duaBySlug((await params).slug)
  if (!d) return renderOg({ title: 'Duas from the Quran & Sunnah' })
  const ar = d.refs ? (await getVersesByRefs(d.refs)).map((v) => v.ar).join(' ') : d.ar!
  // Keep the Arabic line short enough to fit; the full text is on the page.
  const short = ar.length > 60 ? `${ar.slice(0, ar.lastIndexOf(' ', 60))} …` : ar
  return renderOg({ kicker: 'Dua', title: d.title.en.split(':')[0].split('—')[0].trim(), subtitle: d.source.split(';')[0], arabic: short, arabicSize: 64 })
}
