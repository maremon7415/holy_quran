import { NextResponse, type NextRequest } from 'next/server'
import { chapters, resolveChapterId } from '@/lib/quran/chapters'

const slugs = new Set(chapters.map((c) => c.slug))

/** Real HTTP 308s for non-canonical surah URLs: /surah/2 → /surah/al-baqarah, /surah/yasin/1 → /surah/ya-sin/1 */
export function proxy(req: NextRequest) {
  const [, , seg, ...rest] = req.nextUrl.pathname.split('/')
  if (!seg || slugs.has(seg)) return NextResponse.next()
  const id = resolveChapterId(seg)
  if (!id) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = ['/surah', chapters[id - 1].slug, ...rest].join('/')
  return NextResponse.redirect(url, 308)
}

export const config = { matcher: ['/surah/:path*'] }
