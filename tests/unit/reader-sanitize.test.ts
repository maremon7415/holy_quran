import { describe, it, expect } from 'vitest'
import { sanitizeHtml, htmlToText } from '@/lib/reader/sanitize'

/** Anything an attacker could use to run script once the string is injected with dangerouslySetInnerHTML. */
const dangerous = (html: string) => {
  const reasons: string[] = []
  if (/<\s*(script|svg|iframe|object|embed|style|math|link|meta|form|base)\b/i.test(html)) reasons.push('dangerous tag')
  if (/\bon[a-z]+\s*=/i.test(html)) reasons.push('on* attribute')
  if (/javascript\s*:/i.test(html.replace(/&#?\w+;?/g, (e) => decodeEntity(e)))) reasons.push('javascript: url')
  if (/\bstyle\s*=/i.test(html)) reasons.push('style attribute')
  return reasons
}
const decodeEntity = (e: string) => {
  const m = e.match(/^&#(x?)([0-9a-f]+);?$/i)
  return m ? String.fromCharCode(parseInt(m[2], m[1] ? 16 : 10)) : e
}

const payloads: Record<string, string> = {
  'img onerror': '<p>x</p><img/src=x/onerror=alert(1)>',
  'img onerror quoted': '<img src="x" onerror="alert(1)">',
  'a javascript href': '<a href=javascript:alert(1)>click</a>',
  'a javascript href quoted': '<a href="javascript:alert(1)">click</a>',
  'a javascript uppercase': '<a href="JaVaScRiPt:alert(1)">click</a>',
  'a entity-encoded javascript': '<a href="java&#115;cript:x">click</a>',
  'a hex entity javascript': '<a href="&#x6A;avascript:alert(1)">click</a>',
  'a tab-split javascript': '<a href="java\tscript:alert(1)">click</a>',
  'svg animate onbegin': '<svg><animate/onbegin=alert(1) attributeName=x dur=1s>',
  'svg onload': '<svg onload=alert(1)>',
  'script tag': 'hi<script>alert(1)</script>there',
  'script with attrs': '<script src=//evil.example/x.js></script>',
  'script nested-split': '<scr<script>ipt>alert(1)</scr</script>ipt>',
  'style attr': '<p style="background:url(javascript:alert(1))">x</p>',
  'style tag': '<style>*{background:url(javascript:alert(1))}</style>',
  'iframe srcdoc': '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  'iframe javascript': '<iframe src="javascript:alert(1)"></iframe>',
  'form action': '<form action="javascript:alert(1)"><button>x</button></form>',
  'math': '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
  'data url': '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  'body onload': '<body onload=alert(1)>',
  'details ontoggle': '<details open ontoggle=alert(1)>x</details>',
  'case-mixed handler': '<img src=x OnErRoR=alert(1)>',
  'newline before handler': '<img src=x\nonerror=alert(1)>',
  'object data': '<object data="javascript:alert(1)"></object>',
  'embed': '<embed src="javascript:alert(1)">',
  'meta refresh': '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  'base href': '<base href="javascript:alert(1)//">',
  'unclosed script': '<script>alert(1)',
}

describe('sanitizeHtml — XSS payloads', () => {
  for (const [name, p] of Object.entries(payloads)) {
    it(`neutralises: ${name}`, () => {
      const out = sanitizeHtml(p)
      expect(dangerous(out), `output was: ${out}`).toEqual([])
    })
  }
})

describe('sanitizeHtml — preserves legitimate markup', () => {
  it('null/undefined/empty', () => {
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
    expect(sanitizeHtml('')).toBe('')
  })
  it('keeps paragraphs, emphasis, headings, lists', () => {
    const html = '<h2>Title</h2><p>Hello <em>world</em> <strong>!</strong></p><ul><li>a</li></ul>'
    expect(sanitizeHtml(html)).toBe(html)
  })
  it('keeps plain https links', () => {
    expect(sanitizeHtml('<a href="https://quran.com/2">q</a>')).toContain('href="https://quran.com/2"')
  })
  it('rewrites quran.com internal links to canonical reader URLs', () => {
    expect(sanitizeHtml('<a href="/2/255">x</a>')).toContain('href="/surah/al-baqarah#ayah-255"')
    expect(sanitizeHtml('<a href="/67:5">x</a>')).toContain('href="/surah/al-mulk#ayah-5"')
    expect(sanitizeHtml('<a href="/2/67-73">x</a>')).toContain('href="/surah/al-baqarah#ayah-67"')
  })
  it('invalid internal surah → "#"', () => {
    expect(sanitizeHtml('<a href="/999/1">x</a>')).toContain('href="#"')
  })
  it('keeps Arabic / Bangla text intact', () => {
    const s = '<p>بسم الله — বাংলা</p>'
    expect(sanitizeHtml(s)).toBe(s)
  })
  it('is idempotent', () => {
    const once = sanitizeHtml('<p onclick="x">a</p><a href="/2/255">b</a>')
    expect(sanitizeHtml(once)).toBe(once)
  })
})

describe('htmlToText', () => {
  it('strips tags, decodes common entities, collapses spaces', () => {
    expect(htmlToText('<p>Tom &amp; <b>Jerry</b></p>\n<p>&quot;hi&quot;&nbsp;there</p>')).toBe('Tom & Jerry "hi" there')
  })
  it('truncates at a word boundary with an ellipsis', () => {
    const t = htmlToText('<p>' + 'word '.repeat(100) + '</p>', 30)
    expect(t.length).toBeLessThanOrEqual(30)
    expect(t.endsWith('…')).toBe(true)
  })
  it('null → empty', () => expect(htmlToText(null)).toBe(''))
})
