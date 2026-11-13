import { getDua } from '@/lib/api/corpus'
import { json, notFound } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/duas/dua-for-anxiety */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const d = await getDua(slug)
  return d ? json(d) : notFound(`No dua "${slug}". List all at /api/v1/duas.`)
}
