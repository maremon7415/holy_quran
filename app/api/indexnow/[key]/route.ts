import { indexNowKey } from '@/lib/seo/indexnow'

/**
 * IndexNow key file. Public URL: /{INDEXNOW_KEY}.txt (rewritten here in next.config.mjs).
 * Answers 200 with the key only when the requested key equals env INDEXNOW_KEY; 404 otherwise.
 */
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  const expected = indexNowKey()
  if (!expected || key !== expected) return new Response('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  return new Response(expected, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
