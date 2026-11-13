import { generateSitemaps } from '../sitemap'
import { absoluteUrl } from '@/lib/site'

/** Sitemap index listing every generated /sitemap/{id}.xml (also served at /sitemap.xml via a rewrite). */
export async function GET() {
  const ids = await generateSitemaps()
  const now = new Date().toISOString()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ids.map(({ id }) => `  <sitemap><loc>${absoluteUrl(`/sitemap/${id}.xml`)}</loc><lastmod>${now}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } })
}
