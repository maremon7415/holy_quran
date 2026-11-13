import { askQuran, MAX_QUERY, type AskLang } from '@/lib/ask'
import { warmUpModel } from '@/lib/ask/embed'
import { withRateLimit } from '@/lib/api/ratelimit'

/**
 * GET /api/ask?q=…&lang=en|bn|ar&limit=12[&qv=<base64url query vector from the in-browser model>]
 * Meaning-based Quran search for the /ask page. Never 500s on a model problem: the response then has
 * mode "lexical" and a `note`. Queries are not logged or stored.
 * GET /api/ask?warm=1 starts loading the model in the background (sent once by the /ask page on open, so the
 * ~210 MB download on a cold instance overlaps with the user typing) and answers 202 right away.
 */
export const runtime = 'nodejs'
export const maxDuration = 60

export const GET = withRateLimit(async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  if (sp.get('warm') === '1') return Response.json({ model: warmUpModel() }, { status: 202, headers: { 'Cache-Control': 'no-store' } })
  const q = (sp.get('q') ?? '').trim()
  if (q.length < 2 || q.length > MAX_QUERY) return Response.json({ error: `q must be 2–${MAX_QUERY} characters` }, { status: 400 })
  const l = sp.get('lang')
  const lang = l === 'en' || l === 'bn' || l === 'ar' ? (l as AskLang) : undefined
  const limit = Math.max(1, Math.min(30, Math.trunc(Number(sp.get('limit') ?? 12)) || 12))
  try {
    const r = await askQuran(q, { lang, limit, queryVector: sp.get('qv') })
    // semantic answers are deterministic → cache at the CDN; lexical fallbacks only briefly (the model may be back soon)
    // (not at all while the model is still starting on this instance: the next request will be semantic)
    const cache = r.mode === 'semantic' ? 'public, s-maxage=86400, stale-while-revalidate=604800' : r.fallback === 'model_loading' ? 'no-store' : 'public, s-maxage=60'
    return Response.json(r, { headers: { 'Cache-Control': cache } })
  } catch (e) {
    console.error('[ask] failed', e instanceof Error ? e.message : e)
    return Response.json({ query: q, lang: lang ?? 'en', mode: 'lexical', note: 'Search failed, please try again.', results: [], tookMs: 0 }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  }
}, (req) => {
  const sp = new URL(req.url).searchParams
  return { embed: sp.get('qv') || sp.get('warm') === '1' ? 0 : 1 }
})
