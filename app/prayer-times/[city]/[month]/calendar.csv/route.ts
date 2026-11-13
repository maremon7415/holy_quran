import { resolveMonth } from '@/lib/places/months'
import { monthCsv } from '@/lib/places/export'

export const revalidate = 3600

export async function GET(_req: Request, { params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params
  const r = resolveMonth(city, month)
  if (!r) return new Response('Not found', { status: 404 })
  return new Response(monthCsv(r.city, r.y, r.m), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="prayer-times-${r.city.slug}-${month}.csv"`, 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
