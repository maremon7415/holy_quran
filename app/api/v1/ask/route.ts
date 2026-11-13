import { askApi } from '@/lib/ask'
import { badRequest, intParam, json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'
export const runtime = 'nodejs'
export const maxDuration = 60

/** GET /api/v1/ask?q=what does the Quran say about patience&lang=en|bn|ar&limit=10 — meaning-based search. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const q = (sp.get('q') ?? '').trim()
  if (q.length < 2) return badRequest('Query parameter "q" is required (at least 2 characters).')
  if (q.length > 300) return badRequest('Query is too long (max 300 characters).')
  const lang = sp.get('lang')
  if (lang && !['en', 'bn', 'ar'].includes(lang)) return badRequest('lang must be en, bn or ar.')
  const r = await askApi(q, { lang: (lang as 'en' | 'bn' | 'ar' | null) ?? undefined, limit: intParam(sp.get('limit'), 10, 1, 20) })
  return json(r, r.mode === 'semantic' ? {} : { cache: 'public, max-age=60, s-maxage=60' })
}
