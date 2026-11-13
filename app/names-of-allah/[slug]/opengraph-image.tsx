import { ogContentType, ogSize, renderOg } from '@/lib/content/og'
import { asmaUlHusna, asmaBySlug } from '@/data/content/asma-ul-husna'

export const alt = 'Name of Allah: meaning'
export const size = ogSize
export const contentType = ogContentType
export const generateStaticParams = () => asmaUlHusna.map((n) => ({ slug: n.slug }))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const n = asmaBySlug((await params).slug)
  if (!n) return renderOg({ title: '99 Names of Allah' })
  return renderOg({ kicker: `Name ${n.n} of 99`, title: `${n.tl}: ${n.en}`, subtitle: 'Meaning of the Name of Allah', arabic: n.ar, arabicSize: 140 })
}
