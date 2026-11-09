import { NextResponse } from 'next/server'
import { getVerses } from '@/lib/quran/data'

export const dynamic = 'force-static'
export const dynamicParams = true

export async function GET(_req: Request, ctx: { params: Promise<{ surah: string }> }) {
  const { surah } = await ctx.params
  const id = Number(surah)
  if (!Number.isInteger(id) || id < 1 || id > 114) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const verses = await getVerses(id)
  return NextResponse.json(
    verses.map((v) => ({ n: v.n, ar: v.ar, en: v.en, bn: v.bn })),
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' } }
  )
}
