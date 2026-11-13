import { badRequest, json, notFound } from '@/lib/api/http'
import { eventJson, eventsListJson, resolveEventName } from '@/lib/events/service'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/events — upcoming events (next 12 months) · ?year=2027 for one Gregorian year · ?event=eid-al-adha[&year=2027] for one event */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const yearRaw = sp.get('year')
  let year: number | null = null
  if (yearRaw != null && yearRaw !== '') {
    if (!/^\d{4}$/.test(yearRaw)) return badRequest('year must be a four-digit Gregorian year.')
    year = Number(yearRaw)
  }
  const ev = sp.get('event')
  if (ev) {
    const slug = resolveEventName(ev)
    if (!slug) return notFound(`No event "${ev}". List all at /api/v1/events.`)
    const r = eventJson(slug, year)
    return r ? json(r) : notFound('Year out of range: events are available for the current year −1 … +4.')
  }
  const r = eventsListJson(year)
  return r ? json(r) : notFound('Year out of range: events are available for the current year −1 … +4.')
}
