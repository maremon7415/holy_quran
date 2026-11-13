/**
 * Post-login redirect sanitiser. Pure (no browser imports) so it can be unit-tested.
 *
 * Only same-origin paths are allowed. Tricks such as `//evil.com`, `/\evil.com`, `/\t/evil.com` or `/%09/evil.com`
 * are rejected: browsers strip tabs/newlines and treat `\` like `/`, so these would resolve to another host.
 */
// eslint-disable-next-line no-control-regex
const BAD = /[\u0000-\u001F\u007F\\]/
const AUTH_PAGE = /^\/(?:bn\/)?(?:login|register)(?:[/?#]|$)/

export function safeCallback(raw: string | null | undefined, fallback = '/account', origin?: string): string {
  if (!raw || typeof raw !== 'string' || raw.length > 2048) return fallback
  if (BAD.test(raw)) return fallback
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return fallback
  }
  if (BAD.test(decoded)) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//') || decoded.startsWith('//')) return fallback
  const base = origin ?? (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost')
  let u: URL
  try {
    u = new URL(raw, base)
  } catch {
    return fallback
  }
  if (u.origin !== new URL(base).origin) return fallback
  const out = `${u.pathname}${u.search}${u.hash}`
  if (!out.startsWith('/') || out.startsWith('//')) return fallback
  if (AUTH_PAGE.test(out)) return fallback
  return out
}
