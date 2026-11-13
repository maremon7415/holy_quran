import { placesSitemapXml } from '@/lib/places/sitemap'

export const revalidate = 3600

/** City prayer-time pages, Ramadan timetables, Hijri date and Zakat calculator — with /bn twins and hreflang. */
export async function GET() {
  return new Response(placesSitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } })
}
