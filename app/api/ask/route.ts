import { askQuran, MAX_QUERY, type AskLang } from '@/lib/ask'

/**
 * GET /api/ask?q=…&lang=en|bn|ar&limit=12[&qv=<base64url query vector from the in-browser model>]
 * Meaning-based Quran search for the /ask page. Never 500s on a model problem: the response then has
 * mode "lexical" and a `note`. Queries are not logged or stored.
 */
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const q = (sp.get('q') ?? '').trim()
  if (q.length < 2 || q.length > MAX_QUERY) return Response.json({ error: `q must be 2–${MAX_QUERY} characters` }, { status: 400 })
  const l = sp.get('lang')
  const lang = l === 'en' || l === 'bn' || l === 'ar' ? (l as AskLang) : undefined
  const limit = Math.max(1, Math.min(30, Math.trunc(Number(sp.get('limit') ?? 12)) || 12))
  try {
    const r = await askQuran(q, { lang, limit, queryVector: sp.get('qv') })
    // semantic answers are deterministic → cache at the CDN; lexical fallbacks only briefly (the model may be back soon)
    const cache = r.mode === 'semantic' ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'public, s-maxage=60'
    return Response.json(r, { headers: { 'Cache-Control': cache } })
  } catch (e) {
    console.error('[ask] failed', e instanceof Error ? e.message : e)
    return Response.json({ query: q, lang: lang ?? 'en', mode: 'lexical', note: 'Search failed, please try again.', results: [], tookMs: 0 }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  }
}
