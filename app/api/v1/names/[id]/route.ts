import { getName } from '@/lib/api/corpus'
import { json, notFound, safeDecode } from '@/lib/api/http'
import { withRateLimit } from '@/lib/api/ratelimit'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/names/1 · /api/v1/names/ar-rahman · /api/v1/names/الرحمن */
export const GET = withRateLimit(async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const q = safeDecode(id) ?? id
  const n = await getName(q)
  return n ? json(n) : notFound(`No Name of Allah matches "${q}". Use 1–99 or a slug such as ar-rahman.`)
})
