/**
 * Locale-aware URL helpers (server + client safe, no React).
 *
 * English lives at `/x`, Bangla at `/bn/x` (same slugs). Arabic is a UI-only language (no URLs).
 * Only routes listed in BN_ROUTES have a Bangla twin; `localeHref('bn', '/qibla')` stays `/qibla`.
 */
export type Locale = 'en' | 'bn'
export const LOCALES: Locale[] = ['en', 'bn']
export const BN_PREFIX = '/bn'

/** Path patterns (without the /bn prefix) that have a server-rendered Bangla twin. `*` = one segment. */
export const BN_ROUTES = [
  '/',
  '/topics', '/topics/*',
  '/dua', '/dua/*',
  '/names-of-allah', '/names-of-allah/*',
  '/hifz',
  '/listen',
  '/quran',
  '/surah/*', '/surah/*/*',
  '/juz/*',
  '/prayer-times',
] as const

const patterns = BN_ROUTES.map((p) => new RegExp('^' + p.replace(/\*/g, '[^/]+') + '$'))

const splitPath = (href: string): [string, string] => {
  const i = href.search(/[?#]/)
  return i === -1 ? [href, ''] : [href.slice(0, i), href.slice(i)]
}

export const isBnPath = (pathname: string) => pathname === BN_PREFIX || pathname.startsWith(BN_PREFIX + '/') || pathname.startsWith(BN_PREFIX + '?') || pathname.startsWith(BN_PREFIX + '#')

export const localeOfPath = (pathname: string): Locale => (isBnPath(pathname) ? 'bn' : 'en')

/** `/bn/dua/x` → `/dua/x`; `/bn` → `/`. Leaves English paths untouched. */
export function stripLocale(href: string): string {
  if (!isBnPath(href)) return href
  const rest = href.slice(BN_PREFIX.length)
  return !rest || rest[0] === '?' || rest[0] === '#' ? '/' + rest : rest
}

/** True when `/bn` + path is a real page. */
export function hasBnTwin(href: string): boolean {
  const [p] = splitPath(stripLocale(href))
  const clean = p.length > 1 ? p.replace(/\/$/, '') : p
  return patterns.some((re) => re.test(clean))
}

/** Localize an internal href. External / non-twin / already-prefixed hrefs are returned unchanged. */
export function localeHref(locale: Locale | string, href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  const base = stripLocale(href)
  if (locale !== 'bn') return base === href ? href : base
  if (!hasBnTwin(base)) return base
  const [p, rest] = splitPath(base)
  return (p === '/' ? BN_PREFIX : BN_PREFIX + p) + rest
}

/** Metadata `alternates` for a page pair: own canonical + hreflang en/bn/x-default. */
export function alternatesFor(path: string, locale: Locale = 'en') {
  const en = stripLocale(path)
  const bn = localeHref('bn', en)
  return {
    canonical: locale === 'bn' ? bn : en,
    languages: { en, bn, 'x-default': en } as Record<string, string>,
  }
}
