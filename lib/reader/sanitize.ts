import { surahHref } from '@/lib/quran/chapters'

/**
 * Lightweight HTML sanitizer for trusted-but-external rich text (Quran.com chapter
 * info & tafsir). Works on server and client (regex based, no DOM required).
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<\s*(script|style|iframe|object|embed|noscript|template|form|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|input|button|form)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"')
    // Quran.com internal links "/2/67-73" or "/2:255" → our canonical reader URLs
    .replace(/href="\/(\d{1,3})[/:](\d{1,3})(?:-\d{1,3})?"/g, (_m, s, a) => {
      const sn = +s
      return sn >= 1 && sn <= 114 ? `href="${surahHref(sn)}#ayah-${+a}"` : 'href="#"'
    })
    .replace(/\s+target="_blank"/gi, '')
}

/** Strip all tags → plain text (for meta descriptions, JSON-LD). */
export function htmlToText(html: string | null | undefined, max?: number): string {
  if (!html) return ''
  const t = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
  return max && t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t
}
