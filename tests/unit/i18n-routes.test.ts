import { describe, it, expect } from 'vitest'
import { alternatesFor, BN_ROUTES, hasBnTwin, isBnPath, localeHref, localeOfPath, stripLocale } from '@/lib/i18n/routes'

describe('stripLocale / isBnPath', () => {
  it('removes the /bn prefix and keeps query + hash', () => {
    expect(stripLocale('/bn')).toBe('/')
    expect(stripLocale('/bn/')).toBe('/')
    expect(stripLocale('/bn/dua/ayatul-kursi')).toBe('/dua/ayatul-kursi')
    expect(stripLocale('/bn?x=1')).toBe('/?x=1')
    expect(stripLocale('/bn#top')).toBe('/#top')
    expect(stripLocale('/bn/surah/al-baqarah/255?a=1#b')).toBe('/surah/al-baqarah/255?a=1#b')
  })
  it('leaves English and look-alike paths alone', () => {
    expect(stripLocale('/surah/al-baqarah')).toBe('/surah/al-baqarah')
    expect(stripLocale('/bnx')).toBe('/bnx')
    expect(stripLocale('/about')).toBe('/about')
    expect(isBnPath('/bnx')).toBe(false)
    expect(isBnPath('/abn/x')).toBe(false)
    expect(isBnPath('/bn')).toBe(true)
    expect(isBnPath('/bn/quran')).toBe(true)
  })
  it('localeOfPath', () => {
    expect(localeOfPath('/bn/topics')).toBe('bn')
    expect(localeOfPath('/topics')).toBe('en')
  })
})

describe('hasBnTwin', () => {
  it('matches every listed pattern with one segment per wildcard', () => {
    for (const ok of ['/', '/topics', '/topics/patience', '/dua', '/dua/ayatul-kursi', '/names-of-allah', '/names-of-allah/ar-rahman', '/hifz', '/listen', '/quran', '/surah/al-baqarah', '/surah/al-baqarah/255', '/juz/30', '/prayer-times']) {
      expect(hasBnTwin(ok), ok).toBe(true)
    }
  })
  it('rejects routes without a Bangla page', () => {
    for (const no of ['/search', '/about', '/qibla', '/calendar', '/settings', '/surah', '/surah/a/b/c', '/topics/a/b', '/juz', '/account', '/downloads']) {
      expect(hasBnTwin(no), no).toBe(false)
    }
  })
  it('ignores a trailing slash, query and hash, and accepts already-prefixed paths', () => {
    expect(hasBnTwin('/topics/')).toBe(true)
    expect(hasBnTwin('/surah/al-mulk?x=1#y')).toBe(true)
    expect(hasBnTwin('/bn/dua/x')).toBe(true)
    expect(hasBnTwin('/bn/search')).toBe(false)
  })
  it('every BN_ROUTES entry is covered', () => {
    for (const p of BN_ROUTES) expect(hasBnTwin(p.replace(/\*/g, 'x'))).toBe(true)
  })
})

describe('localeHref', () => {
  it('prefixes /bn for routes with a twin', () => {
    expect(localeHref('bn', '/')).toBe('/bn')
    expect(localeHref('bn', '/quran')).toBe('/bn/quran')
    expect(localeHref('bn', '/surah/al-baqarah/255')).toBe('/bn/surah/al-baqarah/255')
    expect(localeHref('bn', '/topics/patience?x=1#y')).toBe('/bn/topics/patience?x=1#y')
  })
  it('keeps routes without a twin in English even for bn', () => {
    expect(localeHref('bn', '/qibla')).toBe('/qibla')
    expect(localeHref('bn', '/search?q=mercy')).toBe('/search?q=mercy')
    expect(localeHref('bn', '/bn/qibla')).toBe('/qibla')
  })
  it('strips the prefix for English and other locales', () => {
    expect(localeHref('en', '/bn/quran')).toBe('/quran')
    expect(localeHref('en', '/bn')).toBe('/')
    expect(localeHref('ar', '/bn/dua')).toBe('/dua')
    expect(localeHref('en', '/quran')).toBe('/quran')
  })
  it('is idempotent and never touches external or protocol-relative links', () => {
    expect(localeHref('bn', localeHref('bn', '/hifz'))).toBe('/bn/hifz')
    expect(localeHref('bn', 'https://example.com/quran')).toBe('https://example.com/quran')
    expect(localeHref('bn', '//cdn.example.com/x')).toBe('//cdn.example.com/x')
    expect(localeHref('bn', '#ayah-1')).toBe('#ayah-1')
    expect(localeHref('bn', 'mailto:a@b.c')).toBe('mailto:a@b.c')
  })
})

describe('alternatesFor', () => {
  it('gives the hreflang triplet and a self canonical per locale', () => {
    const en = alternatesFor('/surah/al-baqarah', 'en')
    expect(en.canonical).toBe('/surah/al-baqarah')
    expect(en.languages).toEqual({ en: '/surah/al-baqarah', bn: '/bn/surah/al-baqarah', 'x-default': '/surah/al-baqarah' })
    const bn = alternatesFor('/surah/al-baqarah', 'bn')
    expect(bn.canonical).toBe('/bn/surah/al-baqarah')
    expect(bn.languages).toEqual(en.languages)
  })
  it('accepts either side of the pair as input', () => {
    expect(alternatesFor('/bn/dua/x', 'bn')).toEqual(alternatesFor('/dua/x', 'bn'))
    expect(alternatesFor('/bn', 'en').languages).toEqual({ en: '/', bn: '/bn', 'x-default': '/' })
  })
  it('defaults to English', () => {
    expect(alternatesFor('/quran').canonical).toBe('/quran')
  })
})
