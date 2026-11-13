import sanitize from 'sanitize-html'
import { chapters, readerHref, resolveChapterId, surahHref } from '@/lib/quran/chapters'

/**
 * Map a link found in Quran.com rich text (chapter info, tafsir) to one of our URLs.
 * Returns null for anything we cannot resolve safely (the link is then unwrapped).
 *
 *   /2  /2:255  /2/255  /2:10-11?x=y  2/40-120  4/43  https://quran.com/2/255  /an-naba  an-naba
 *   https://example.com/… (kept as an external link)
 */
export function rewriteHref(raw: string | undefined | null): string | null {
  if (!raw) return null
  const href = raw.trim()
  // absolute URLs: Quran.com links become internal, other http(s) links are kept
  const abs = href.match(/^https?:\/\/([^/?#]+)(\/[^?#]*)?/i)
  if (abs) {
    if (/(^|\.)quran\.com$/i.test(abs[1])) return rewriteHref(abs[2] || '/') ?? null
    return /^https?:\/\/[^\s"'<>]+$/i.test(href) ? href : null
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return null // javascript:, data:, mailto:, protocol-relative…
  if (href.startsWith('#')) return /^#[\w-]+$/.test(href) ? href : null
  const path = href.replace(/[?#].*$/, '')
  // already one of ours
  if (/^\/(surah|juz)\/[\w-]+(\/\d{1,3})?\/?$/.test(path)) {
    const frag = href.match(/#ayah-\d{1,3}$/)?.[0] ?? ''
    return path + frag
  }
  const ref = path.match(/^\/?(\d{1,3})(?:[/:](\d{1,3})(?:-\d{1,3})?)?\/?$/)
  if (ref) {
    const s = +ref[1]
    if (s < 1 || s > 114) return null
    const a = ref[2] ? +ref[2] : 0
    if (!a) return surahHref(s)
    return a <= chapters[s - 1].versesCount ? readerHref(s, a) : surahHref(s)
  }
  const slug = path.match(/^\/?(?:surah\/)?([a-z][a-z-]{1,30})\/?$/i)
  if (slug) {
    const id = resolveChapterId(slug[1])
    return id ? surahHref(id) : null
  }
  return null
}

const RICH: sanitize.IOptions = {
  allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'span', 'sup', 'sub', 'a'],
  allowedAttributes: { a: ['href'], span: ['class', 'lang', 'dir'], p: ['lang', 'dir'] },
  allowedClasses: { span: ['arabic', 'ar', 'qpc-hafs', 'quran'] },
  allowedSchemes: ['http', 'https'],
  allowedSchemesAppliedToAttributes: ['href'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'template', 'iframe', 'object', 'svg', 'math', 'title'],
  transformTags: {
    a: (_tagName, attribs): sanitize.Tag => {
      const href = rewriteHref(attribs.href)
      // unknown target → unwrap (tag dropped, text kept)
      if (!href) return { tagName: 'x-unwrap', attribs: {} as sanitize.Attributes }
      return { tagName: 'a', attribs: { href } }
    },
  },
}

/**
 * Allow-list sanitizer for external rich text (Quran.com chapter info & tafsir), built on
 * sanitize-html. Works on the server and in the browser. Links are rewritten to our URLs.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitize(html, RICH)
}

const TAJWEED: sanitize.IOptions = {
  allowedTags: ['tajweed', 'span'],
  allowedAttributes: { tajweed: ['class'], span: ['class', 'data-w'] },
  disallowedTagsMode: 'discard',
  nonTextTags: ['script', 'style', 'textarea', 'noscript', 'template', 'iframe', 'object', 'svg', 'math', 'title'],
}

/** Quran.com tajweed HTML: only `<tajweed class>` and `<span class>` survive. */
export function sanitizeTajweed(html: string | null | undefined): string {
  if (!html) return ''
  return sanitize(html, TAJWEED)
}

/** Strip all tags → plain text (for meta descriptions, JSON-LD). */
export function htmlToText(html: string | null | undefined, max?: number): string {
  if (!html) return ''
  const t = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
  return max && t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t
}
