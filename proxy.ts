import { NextResponse, type NextRequest } from 'next/server'
import { chapters, resolveChapterId } from '@/lib/quran/chapters'

const slugs = new Set(chapters.map((c) => c.slug))
/** /2:255, /2.255, /2/255, /2:255-257, optionally under /bn */
const SHORT_REF = /^(\/bn)?\/(\d{1,3})(?::|%3A|\.|\/)(\d{1,3})(?:-\d{1,3})?$/i

/** Render the app's not-found page with a real 404 status (avoids soft-404s from the streamed reader routes). */
function notFound(req: NextRequest) {
  return NextResponse.rewrite(new URL('/__not-found__', req.url), { status: 404 })
}

/**
 * /surah/* gatekeeper:
 *  - real HTTP 308s for non-canonical surah URLs: /surah/2 → /surah/al-baqarah, /surah/yasin/1 → /surah/ya-sin/1
 *  - real HTTP 404s for unknown surahs and out-of-range / malformed ayah numbers
 *    (the pages stream behind a loading.tsx Suspense boundary, so notFound() there would come after a 200)
 */
export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  // Markdown alternates for LLMs: /surah/al-baqarah/255.md → /md/surah/al-baqarah/255 (route handler validates and 404s)
  if (path.endsWith('.md')) return NextResponse.rewrite(new URL(`/md${path.slice(0, -3)}`, req.url))
  // Short citation URLs: /2:255, /2/255, /2.255 (and /bn/…) → 308 to the canonical ayah page; ranges go to the first ayah
  const short = path.match(SHORT_REF)
  if (short) {
    const [, bnPrefix, s, a] = short
    const id = +s, n = +a
    if (id < 1 || id > 114 || n < 1 || n > chapters[id - 1].versesCount) return notFound(req)
    const url = req.nextUrl.clone()
    url.pathname = `${bnPrefix ?? ''}/surah/${chapters[id - 1].slug}/${n}`
    return NextResponse.redirect(url, 308)
  }
  // /bn/surah/* (Bangla twins) is handled exactly like /surah/*, keeping the /bn prefix on redirects.
  const bn = req.nextUrl.pathname.startsWith('/bn/')
  const parts = req.nextUrl.pathname.split('/')
  const [, , seg, ...rest] = bn ? parts.slice(1) : parts
  if (!seg) return NextResponse.next()
  let id: number | null
  if (slugs.has(seg)) id = chapters.findIndex((c) => c.slug === seg) + 1
  else {
    id = resolveChapterId(seg)
    if (!id) return notFound(req)
  }
  const tail = rest.filter(Boolean)
  // opengraph-image / twitter-image route files live under the page segments
  const isMeta = /^(opengraph|twitter)-image/.test(tail[tail.length - 1] ?? '')
  const ayahPart = isMeta ? tail.slice(0, -1) : tail
  if (ayahPart.length > 1) return notFound(req)
  if (ayahPart.length === 1) {
    const a = ayahPart[0]
    if (!/^\d{1,3}$/.test(a) || +a < 1 || +a > chapters[id - 1].versesCount) return notFound(req)
  }
  if (slugs.has(seg)) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = [bn ? '/bn/surah' : '/surah', chapters[id - 1].slug, ...rest].join('/')
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: [
    '/surah/:path*',
    '/bn/surah/:path*',
    // markdown alternates of juz / topic / dua / name pages (surah + ayah .md are covered above)
    '/((?:bn/)?(?:juz|topics|dua|names-of-allah)/[^/]+\\.md)',
    // short ayah URLs
    '/((?:bn/)?\\d{1,3}(?::|%3A|%3a|\\.)\\d{1,3}(?:-\\d{1,3})?)',
    '/((?:bn/)?\\d{1,3}/\\d{1,3})',
  ],
}
