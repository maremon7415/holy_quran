import { getHadithItem } from '@/lib/hadith/api'
import { resolveCollectionSlug } from '@/lib/hadith/collections'
import { HadithFetchError } from '@/lib/hadith/fetch'
import { parseHadithNumber } from '@/lib/hadith/numbering'
import { apiError, badRequest, json, notFound } from '@/lib/api/http'
import { withRateLimit } from '@/lib/api/ratelimit'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/hadith/bukhari/1 · /api/v1/hadith/muslim/2564 */
export const GET = withRateLimit(async function GET(_req: Request, ctx: { params: Promise<{ collection: string; number: string }> }) {
  const { collection, number } = await ctx.params
  const c = resolveCollectionSlug(collection)
  if (!c) return notFound(`Unknown collection "${collection}". List them at /api/v1/hadith.`)
  const n = parseHadithNumber(number)
  if (n === null) return badRequest('number must be a positive integer.')
  try {
    const h = await getHadithItem(c.slug, n)
    return h ? json(h) : notFound(`No hadith ${c.slug} ${n}.`)
  } catch (e) {
    if (e instanceof HadithFetchError) return apiError(502, 'upstream_unavailable', 'The hadith corpus is temporarily unreachable. Try again shortly.')
    throw e
  }
})
