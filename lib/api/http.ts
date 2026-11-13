/** Shared response helpers for the public JSON API (/api/v1/*): CORS `*`, CDN caching, JSON errors. */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
export const CACHE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

export function json(data: unknown, init: { status?: number; cache?: string } = {}) {
  const status = init.status ?? 200
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status >= 400 ? 'public, max-age=60, s-maxage=300' : init.cache ?? CACHE,
      ...CORS,
    },
  })
}

export const apiError = (status: number, code: string, message: string) => json({ error: { status, code, message } }, { status })
export const notFound = (message = 'Not found') => apiError(404, 'not_found', message)
export const badRequest = (message: string) => apiError(400, 'bad_request', message)

export const OPTIONS = () => new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } })

/** Clamp an integer query param. Missing / non-numeric → fallback. */
export function intParam(v: string | null, fallback: number, min: number, max: number) {
  if (v == null || v.trim() === '') return fallback
  const n = Math.trunc(Number(v))
  if (!Number.isFinite(n)) return Number(v) === Infinity ? max : fallback
  return Math.max(min, Math.min(max, n))
}

/**
 * decodeURIComponent that never throws: malformed percent-encoding (e.g. "%E0%A4", a truncated UTF-8 sequence) → null,
 * so callers answer 404/400 instead of crashing with a URIError (500). Route params arrive already decoded from Next;
 * use this only on raw strings.
 */
export function safeDecode(s: string): string | null {
  try { return decodeURIComponent(s) } catch { return null }
}
