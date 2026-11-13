import { getSurah } from '@/lib/api/corpus'
import { json, notFound } from '@/lib/api/http'
import { withRateLimit } from '@/lib/api/ratelimit'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/surah/2 · /api/v1/surah/al-baqarah */
export const GET = withRateLimit(async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const s = await getSurah(/^\d+$/.test(id) ? Number(id) : id)
  return s ? json(s) : notFound(`No surah "${id}". Use 1–114 or a name such as al-baqarah.`)
})
