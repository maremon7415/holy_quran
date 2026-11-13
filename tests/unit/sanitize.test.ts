import { describe, expect, it } from 'vitest'
import { rewriteHref, sanitizeHtml, sanitizeTajweed } from '@/lib/reader/sanitize'

const XSS = [
  '<img/src=x/onerror=alert(1)>',
  '<a href=javascript:alert(1)>x</a>',
  '<a href="java&#115;cript:alert(1)">x</a>',
  '<a href="  JaVaScRiPt:alert(1)">x</a>',
  '<svg><animate/onbegin=alert(1) attributeName=x dur=1s>',
  '<script>alert(1)</script>',
  '<iframe src="https://evil.example"></iframe>',
  '<p onclick="alert(1)">hi</p>',
  '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
  '<p style="background:url(javascript:alert(1))">x</p>',
  '<div><form action="javascript:alert(1)"><button>go</button></form></div>',
  '"><img src=x onerror=alert(1)>',
  '<a href="//evil.example/x">x</a>',
]

describe('sanitizeHtml', () => {
  for (const p of XSS) {
    it(`neutralises ${p}`, () => {
      const out = sanitizeHtml(p)
      expect(out).not.toMatch(/<(script|img|svg|iframe|math|form|button|animate)\b/i)
      expect(out).not.toMatch(/\son\w+\s*=/i)
      expect(out).not.toMatch(/javascript:|data:text|style=/i)
      expect(out).not.toMatch(/href="\/\/evil/i)
    })
  }

  it('keeps allowed formatting', () => {
    expect(sanitizeHtml('<h2>T</h2><p><strong>b</strong> <em>i</em><sup>1</sup></p><ul><li>x</li></ul><blockquote>q</blockquote>')).toBe(
      '<h2>T</h2><p><strong>b</strong> <em>i</em><sup>1</sup></p><ul><li>x</li></ul><blockquote>q</blockquote>'
    )
  })

  it('rewrites Quran.com links and unwraps unknown ones', () => {
    expect(sanitizeHtml('<a href="/2">B</a>')).toBe('<a href="/surah/al-baqarah">B</a>')
    expect(sanitizeHtml('<a href="/29:10-11?font=v2&amp;translations=95">x</a>')).toBe('<a href="/surah/al-ankabut#ayah-10">x</a>')
    expect(sanitizeHtml('<a href="2/40-120">x</a>')).toBe('<a href="/surah/al-baqarah#ayah-40">x</a>')
    expect(sanitizeHtml('<a href="4/43">x</a>')).toBe('<a href="/surah/an-nisa#ayah-43">x</a>')
    expect(sanitizeHtml('<a href="/an-naba">x</a>')).toBe('<a href="/surah/an-naba">x</a>')
    expect(sanitizeHtml('<a href="/some/unknown/page">keep text</a>')).toBe('keep text')
    expect(sanitizeHtml('<a href="https://example.com/a" target="_blank">e</a>')).toBe('<a href="https://example.com/a">e</a>')
  })
})

describe('rewriteHref', () => {
  it('maps reference forms', () => {
    expect(rewriteHref('/2:255')).toBe('/surah/al-baqarah#ayah-255')
    expect(rewriteHref('/2/255')).toBe('/surah/al-baqarah#ayah-255')
    expect(rewriteHref('https://quran.com/2/255')).toBe('/surah/al-baqarah#ayah-255')
    expect(rewriteHref('/115')).toBeNull()
    expect(rewriteHref('javascript:alert(1)')).toBeNull()
  })
})

describe('sanitizeTajweed', () => {
  it('keeps tajweed markup only', () => {
    expect(sanitizeTajweed('<tajweed class=ghunnah>نّ</tajweed><span class=end>١</span>')).toBe('<tajweed class="ghunnah">نّ</tajweed><span class="end">١</span>')
    const out = sanitizeTajweed('<tajweed class=x onmouseover=alert(1)>a</tajweed><img src=x onerror=alert(1)><b>b</b>')
    expect(out).toBe('<tajweed class="x">a</tajweed>b')
  })
})
