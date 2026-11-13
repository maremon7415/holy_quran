import { getTopic } from '@/lib/api/corpus'
import { json, notFound } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/topics/patience?lang=bn — exact slug only (fuzzy matching lives in the MCP tool) */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const lang = new URL(req.url).searchParams.get('lang') === 'bn' ? 'bn' : 'en'
  const t = /^[a-z0-9-]+$/.test(slug) ? await getTopic(slug, lang) : null
  return t && t.slug === slug ? json(t) : notFound(`No topic "${slug}". List all at /api/v1/topics.`)
}
