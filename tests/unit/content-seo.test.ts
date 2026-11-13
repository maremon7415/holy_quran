import { describe, it, expect } from 'vitest'
import { breadcrumbLd, faqLd, articleLd, howToLd, collectionLd, clip, buildMeta, shortTitle, publisherLd } from '@/lib/content/seo'
import { absoluteUrl, site } from '@/lib/site'

describe('absoluteUrl', () => {
  it('joins with or without leading slash', () => {
    expect(absoluteUrl('/a')).toBe(`${site.url}/a`)
    expect(absoluteUrl('a')).toBe(`${site.url}/a`)
    expect(absoluteUrl()).toBe(`${site.url}/`)
  })
  it('site.url has no trailing slash', () => expect(site.url.endsWith('/')).toBe(false))
})

describe('JSON-LD builders', () => {
  it('breadcrumbLd positions start at 1 with absolute urls', () => {
    const ld = breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Quran', href: '/quran' }]) as any
    expect(ld['@type']).toBe('BreadcrumbList')
    expect(ld.itemListElement.map((i: any) => i.position)).toEqual([1, 2])
    expect(ld.itemListElement[1].item).toBe(`${site.url}/quran`)
  })
  it('faqLd', () => {
    const ld = faqLd([{ q: 'Q?', a: 'A.' }]) as any
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity[0]).toMatchObject({ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } })
  })
  it('articleLd', () => {
    const ld = articleLd({ headline: 'H', description: 'D', path: '/surah/al-mulk', keywords: ['a', 'b'], about: 'Mulk' }) as any
    expect(ld['@type']).toBe('Article')
    expect(ld.url).toBe(`${site.url}/surah/al-mulk`)
    expect(ld.keywords).toBe('a, b')
    expect(ld.about.name).toBe('Mulk')
    expect(ld.publisher).toEqual(publisherLd)
    expect(ld.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('howToLd / collectionLd', () => {
    const h = howToLd({ name: 'n', description: 'd', path: '/x', steps: [{ name: 's', text: 't' }] }) as any
    expect(h['@type']).toBe('HowTo'); expect(h.step[0].position).toBe(1)
    const c = collectionLd({ name: 'n', description: 'd', path: '/x', items: [{ name: 'i', href: '/i' }] }) as any
    expect(c.mainEntity.numberOfItems).toBe(1)
    expect(c.mainEntity.itemListElement[0].url).toBe(`${site.url}/i`)
  })
  it('all builders produce JSON-serialisable output', () => {
    expect(() => JSON.stringify(articleLd({ headline: 'h', description: 'd', path: '/' }))).not.toThrow()
  })
})

describe('clip', () => {
  it('leaves short text', () => expect(clip('  a   b ')).toBe('a b'))
  it('cuts at a word boundary within max', () => {
    const out = clip('word '.repeat(60), 50)
    expect(out.length).toBeLessThanOrEqual(50)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toMatch(/wor…$/)
  })
})

describe('buildMeta', () => {
  it('canonical + OG + twitter consistent', () => {
    const m = buildMeta({ title: 'T', description: 'D', path: '/quran' }) as any
    expect(m.alternates.canonical).toBe('/quran')
    expect(m.openGraph.url).toBe(`${site.url}/quran`)
    expect(m.openGraph.title).toBe('T')
    expect(m.twitter.title).toBe('T')
    expect(m.robots).toBeUndefined()
  })
  it('noindex', () => {
    expect((buildMeta({ title: 'T', description: 'D', path: '/search', noindex: true }) as any).robots).toEqual({ index: false, follow: true })
  })
})

describe('shortTitle', () => {
  it('cuts at ": " and " — "', () => {
    expect(shortTitle('Anxiety: what the Quran says')).toBe('Anxiety')
    expect(shortTitle('Patience — sabr')).toBe('Patience')
  })
  it('keeps titles with parentheses and bare colons in refs', () => {
    expect(shortTitle('Ayatul Kursi (Quran 2:255)')).toBe('Ayatul Kursi (Quran 2:255)')
  })
})
