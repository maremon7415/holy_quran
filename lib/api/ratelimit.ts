/**
 * Per-IP rate limiting for the public, compute-bound endpoints: /api/v1/* (dynamic routes), /api/ask and /api/mcp.
 * Same in-memory sliding window as the auth endpoints (lib/auth-ratelimit.ts): counters live in one server instance,
 * which is enough to stop a single client from looping on the API; use a shared store for strict global limits.
 *
 * Policy (per client IP):
 *  - API: 60 requests / minute. A JSON-RPC batch to /api/mcp counts once per message.
 *  - Embedding: 20 / minute for requests that run the Ask model (/api/ask, /api/v1/ask, MCP `ask_quran`), on top of the above.
 * Over the limit → 429 JSON `{ error: { status, code: "rate_limited", message } }` with `Retry-After` (seconds).
 * `API_RATE_LIMIT=off` disables it (unit tests, local e2e runs that hammer one server from 127.0.0.1).
 */
import { clientIp, SlidingWindow } from '@/lib/auth-ratelimit'
import { CORS } from './http'

export const API_RATE = { max: 60, windowMs: 60_000 }
export const EMBED_RATE = { max: 20, windowMs: 60_000 }

const apiWindow = new SlidingWindow(API_RATE.max, API_RATE.windowMs)
const embedWindow = new SlidingWindow(EMBED_RATE.max, EMBED_RATE.windowMs)

export const rateLimitEnabled = () => process.env.API_RATE_LIMIT !== 'off'

export interface LimitCost {
  /** API units (default 1; an MCP batch passes its message count). */
  api?: number
  /** Embedding units (Ask model runs). */
  embed?: number
}

export type LimitResult = { ok: true } | { ok: false; retryAfterSec: number; scope: 'api' | 'embed' }

/** Records the cost for this client; `ok: false` when it is over a limit. Pure apart from the shared windows (clock-injectable). */
export function checkRateLimit(req: Request, cost: LimitCost = {}, now = Date.now()): LimitResult {
  if (!rateLimitEnabled()) return { ok: true }
  const ip = clientIp(req.headers)
  const take = (w: SlidingWindow, n: number) => {
    for (let i = 0; i < n; i++) if (!w.hit(ip, now)) return false
    return true
  }
  if (!take(apiWindow, Math.max(1, cost.api ?? 1))) return { ok: false, scope: 'api', retryAfterSec: Math.max(1, Math.ceil(apiWindow.retryAfter(ip, now) / 1000)) }
  if (cost.embed && !take(embedWindow, cost.embed)) return { ok: false, scope: 'embed', retryAfterSec: Math.max(1, Math.ceil(embedWindow.retryAfter(ip, now) / 1000)) }
  return { ok: true }
}

const MESSAGE = {
  api: `Too many requests: the API allows ${API_RATE.max} requests per minute per client.`,
  embed: `Too many meaning-based (Ask) searches: ${EMBED_RATE.max} per minute per client.`,
}

/** 429 JSON response for a failed check. */
export function tooManyRequests(r: Extract<LimitResult, { ok: false }>, body?: unknown): Response {
  const message = `${MESSAGE[r.scope]} Retry after ${r.retryAfterSec} s.`
  return new Response(JSON.stringify(body ?? { error: { status: 429, code: 'rate_limited', message } }), {
    status: 429,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': String(r.retryAfterSec), ...CORS },
  })
}

export const rateLimitMessage = (r: Extract<LimitResult, { ok: false }>) => `${MESSAGE[r.scope]} Retry after ${r.retryAfterSec} s.`

/** null when allowed, else the 429 response. */
export function limitRequest(req: Request, cost: LimitCost = {}): Response | null {
  const r = checkRateLimit(req, cost)
  return r.ok ? null : tooManyRequests(r)
}

/** Wraps a route handler with the API limit (and optionally the embedding limit). */
export function withRateLimit<A extends unknown[]>(handler: (req: Request, ...args: A) => Response | Promise<Response>, cost: LimitCost | ((req: Request) => LimitCost) = {}) {
  return async (req: Request, ...args: A): Promise<Response> => limitRequest(req, typeof cost === 'function' ? cost(req) : cost) ?? handler(req, ...args)
}

/** Test helper. */
export function _resetApiRateLimits() {
  apiWindow.clear()
  embedWindow.clear()
}
