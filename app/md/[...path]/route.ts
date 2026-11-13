import { markdownFor } from '@/lib/api/markdown'

/**
 * Markdown alternates for LLMs. Public URLs are `<page>.md` (e.g. /surah/al-baqarah/255.md, /bn/topics/patience.md);
 * proxy.ts rewrites them here. `Link: rel=canonical` points search engines at the HTML page.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const doc = await markdownFor('/' + path.map((p) => decodeURIComponent(p)).join('/'))
  if (!doc) return new Response('# Not found\n\nNo markdown document exists at this path.\n', { status: 404, headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
  return new Response(doc.body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
      Link: `<${doc.canonical}>; rel="canonical"`,
    },
  })
}
