import { badRequest, json, notFound, safeDecode } from '@/lib/api/http'
import { eventJson, resolveEventName } from '@/lib/events/service'
import { withRateLimit } from '@/lib/api/ratelimit'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/events/eid-al-adha?year=2027 — slug or a name ("Eid ul Adha", "ঈদুল আজহা"); without ?year the next occurrence */
export const GET = withRateLimit(async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await ctx.params
  // params arrive decoded; a second decode is only a fallback for still-encoded input and must not throw (→ 404)
  const decoded = raw.includes('%') ? safeDecode(raw) ?? raw : raw
  const slug = resolveEventName(decoded)
  if (!slug) return notFound(`No event "${raw}". List all at /api/v1/events.`)
  const yearRaw = new URL(req.url).searchParams.get('year')
  let year: number | null = null
  if (yearRaw != null && yearRaw !== '') {
    if (!/^\d{4}$/.test(yearRaw)) return badRequest('year must be a four-digit Gregorian year.')
    year = Number(yearRaw)
  }
  const r = eventJson(slug, year)
  return r ? json(r) : notFound('Year out of range: events are available for the current year −1 … +4.')
})
