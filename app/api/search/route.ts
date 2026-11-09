import { NextResponse } from 'next/server'
import { searchQuran } from '@/lib/quran/search'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(100, Number(searchParams.get('limit') ?? 30) || 30)
  const result = await searchQuran(q, limit)
  return NextResponse.json(result, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } })
}
