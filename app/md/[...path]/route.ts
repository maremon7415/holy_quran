import { markdownFor } from '@/lib/api/markdown'
import { HadithFetchError } from '@/lib/hadith/fetch'

const MD = 'text/markdown; charset=utf-8'
const notFound = () => new Response('# Not found\n\nNo markdown document exists at this path.\n', { status: 404, headers: { 'Content-Type': MD } })

/**
 * Markdown alternates for LLMs. Public URLs are `<page>.md` (e.g. /surah/al-baqarah/255.md, /bn/topics/patience.md);
 * proxy.ts rewrites them here. `Link: rel=canonical` points search engines at the HTML page.
 * Next already decodes the catch-all segments: they are NOT decoded again (that turned malformed input such as
 * `/topics/%E0%A4.md` into a URIError → 500). Malformed / unknown paths are a 404.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  let doc: Awaited<ReturnType<typeof markdownFor>>
  try {
    doc = await markdownFor('/' + path.join('/'))
  } catch (e) {
    if (e instanceof URIError) return notFound()
    // hadith corpus briefly unreachable: a short-lived 503, never a cached 404
    if (e instanceof HadithFetchError) return new Response('# Temporarily unavailable\n\nThe hadith text could not be loaded right now. Please try again shortly.\n', { status: 503, headers: { 'Content-Type': MD, 'Cache-Control': 'no-store', 'Retry-After': '60' } })
    throw e
  }
  if (!doc) return notFound()
  return new Response(doc.body, {
    headers: {
      'Content-Type': MD,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
      Link: `<${doc.canonical}>; rel="canonical"`,
    },
  })
}
