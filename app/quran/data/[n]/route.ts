import { getVerses } from '@/lib/quran/data'

/**
 * Per-surah texts that surah / juz pages don't server-render (to keep long surahs light):
 * Abdel Haleem's translation and the Latin transliteration. Fetched by the reader only when
 * the user turns them on (components/reader/verse-enhancer.tsx). Single-ayah pages still SSR them.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ n: String(i + 1) }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n)
  if (!Number.isInteger(n) || n < 1 || n > 114) return new Response('Not found', { status: 404 })
  const vs = await getVerses(n)
  return Response.json(
    { enH: vs.map((v) => v.enH), tl: vs.map((v) => v.tl) },
    { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } }
  )
}
