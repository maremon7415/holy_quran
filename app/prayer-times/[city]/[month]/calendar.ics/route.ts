import { resolveMonth } from '@/lib/places/months'
import { monthIcs } from '@/lib/places/export'

export const revalidate = 3600

export async function GET(_req: Request, { params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params
  const r = resolveMonth(city, month)
  if (!r) return new Response('Not found', { status: 404 })
  return new Response(monthIcs(r.city, r.y, r.m), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="prayer-times-${r.city.slug}-${month}.ics"`, 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
