import { searchHadithItems, isCollectionId } from '@/lib/hadith/api'
import { HadithFetchError } from '@/lib/hadith/fetch'
import { apiError, badRequest, intParam, json } from '@/lib/api/http'
import { withRateLimit } from '@/lib/api/ratelimit'

export { OPTIONS } from '@/lib/api/http'


/** GET /api/v1/hadith/search?q=patience&collection=bukhari&lang=en|bn|ar&limit=10&offset=0 */
export const GET = withRateLimit(async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const q = (sp.get('q') ?? '').trim()
  if (q.length < 2) return badRequest('Query parameter "q" is required (at least 2 characters).')
  if (q.length > 200) return badRequest('Query is too long (max 200 characters).')
  const lang = sp.get('lang')
  if (lang && !['en', 'bn', 'ar'].includes(lang)) return badRequest('lang must be en, bn or ar.')
  const collection = sp.get('collection') ?? undefined
  if (collection && !isCollectionId(collection)) return badRequest('Unknown collection. List them at /api/v1/hadith.')
  try {
    const r = await searchHadithItems(q, { collection, lang: (lang as 'en' | 'bn' | 'ar' | null) ?? undefined, limit: intParam(sp.get('limit'), 10, 1, 50), offset: intParam(sp.get('offset'), 0, 0, 10000) })
    // partial results (some collections unreachable) are cached only briefly, without stale-while-revalidate
    return json(r, r.failed.length ? { cache: 'public, max-age=60, s-maxage=60' } : {})
  } catch (e) {
    if (e instanceof HadithFetchError) return apiError(502, 'upstream_unavailable', 'The hadith corpus is temporarily unreachable. Try again shortly.')
    throw e
  }
})
