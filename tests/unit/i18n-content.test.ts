import { describe, it, expect } from 'vitest'
import { topics, topicCategories } from '@/data/content/topics'
import { duas, duaCategories } from '@/data/content/duas'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { getFamousAyah, curatedAyahKeys } from '@/lib/reader/famous'
import { pick, bnNum, num } from '@/lib/i18n/t'
import { refLabelFor, refLabelL } from '@/lib/i18n/quran'
import { sourceFor } from '@/lib/i18n/source-names'
import { reciters, reciterName, reciterNote, reciterStyle } from '@/lib/audio/reciters'
import { achievements } from '@/lib/hifz/achievements'
import { bnShapesCorrectly } from '@/lib/content/og'
import { REMINDER_NAMES } from '@/lib/prayer/times'

const ARABIC = /^[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿٠-٩\sA-Za-z0-9:\-–()«»﴿﴾ﷺ.،؟]+$/
const hasArabic = (s?: string) => !!s && /[؀-ۿ]/.test(s)

describe('Arabic names of hand-written content', () => {
  it('every topic has an Arabic name', () => {
    for (const t of topics) { expect(hasArabic(t.ar), t.slug).toBe(true); expect(t.ar, t.slug).toMatch(ARABIC) }
  })
  it('every topic and dua category has Arabic labels', () => {
    for (const c of topicCategories) { expect(hasArabic(c.title.ar), c.id).toBe(true); expect(hasArabic(c.blurb.ar), c.id).toBe(true) }
    for (const c of duaCategories) expect(hasArabic(c.title.ar), c.id).toBe(true)
  })
  it('every dua has an Arabic title (no Latin transliteration leaking in)', () => {
    for (const d of duas) {
      expect(hasArabic(d.title.ar), d.slug).toBe(true)
      expect(d.title.ar, d.slug).toMatch(ARABIC)
      expect(d.title.ar, d.slug).not.toMatch(/[A-Za-z]{3,}/)
    }
  })
  it('every Name of Allah has a short Arabic gloss', () => {
    expect(asmaUlHusna).toHaveLength(99)
    for (const n of asmaUlHusna) { expect(hasArabic(n.meaningAr), n.slug).toBe(true); expect(n.meaningAr!.length, n.slug).toBeGreaterThan(8) }
    expect(new Set(asmaUlHusna.map((n) => n.slug)).size).toBe(99)
  })
  it('every famous ayah name has an Arabic form', () => {
    for (const k of curatedAyahKeys) {
      const f = getFamousAyah(k)
      if (f) expect(hasArabic(f.ar), k).toBe(true)
    }
    expect(getFamousAyah('2:255')).toMatchObject({ en: 'Ayatul Kursi', ar: 'آية الكرسي' })
    expect(getFamousAyah('1:3')?.ar).toBe('سورة الفاتحة')
    expect(getFamousAyah('112:2')?.ar).toBe('سورة الإخلاص')
  })
  it('achievements and reminder names are fully trilingual', () => {
    const a = achievements({ totalVerses: 0, longestStreak: 0, currentStreak: 0, completedSurahs: [], bookmarks: 0, hifzAyahs: 0, hifzStreak: 0, khatams: 0, hifzSurahs: [] })
    expect(a).toHaveLength(14)
    for (const x of a) { expect(hasArabic(x.ar), x.id).toBe(true); expect(hasArabic(x.descAr), x.id).toBe(true); expect(/[ঀ-৿]/.test(x.bn), x.id).toBe(true) }
    for (const n of Object.values(REMINDER_NAMES)) expect(hasArabic(n.ar)).toBe(true)
  })
})

describe('i18n helpers', () => {
  it('pick falls back to English for missing translations and unknown languages', () => {
    expect(pick('ar', { en: 'Read', bn: 'পড়ুন' })).toBe('Read')
    expect(pick('bn', { en: 'Read', bn: 'পড়ুন', ar: 'اقرأ' })).toBe('পড়ুন')
    expect(pick('ar', { en: 'Read', ar: 'اقرأ' })).toBe('اقرأ')
    expect(pick('fr', { en: 'Read', bn: 'x' })).toBe('Read')
    expect(pick('ar', { en: 'Meaning', ar: '' })).toBe('') // an empty translation intentionally hides the text
  })
  it('bnNum / num use Bangla digits only for bn', () => {
    expect(bnNum(2026)).toBe('২০২৬')
    expect(bnNum('1,234')).toBe('১,২৩৪')
    expect(num('bn', 255)).toBe('২৫৫')
    expect(num('ar', 255)).toBe('255')
    expect(num('en', 255)).toBe('255')
  })
  it('refLabelFor renders surah references in each UI language', () => {
    expect(refLabelFor('en', '2:255')).toBe('Al-Baqarah 2:255')
    expect(refLabelFor('bn', '2:255')).toBe(refLabelL('bn', '2:255'))
    expect(refLabelFor('bn', '2:255')).toMatch(/^[ঀ-৿\- ]+ ২:২৫৫$/)
    expect(refLabelFor('ar', '2:255')).toBe('البقرة 2:255')
    expect(refLabelFor('ar', '112:1-4')).toBe('الإخلاص 112:1–4')
    expect(refLabelFor('ar', 'not-a-ref')).toBe('not-a-ref')
  })
  it('sourceFor translates collection names and Bangla digits', () => {
    expect(sourceFor('en', 'Sahih al-Bukhari 6306; Quran 2:201')).toBe('Sahih al-Bukhari 6306; Quran 2:201')
    expect(sourceFor('ar', 'Sahih al-Bukhari 6306; Quran 2:201')).toBe('صحيح البخاري 6306; القرآن 2:201')
    expect(sourceFor('bn', 'Sahih Muslim 2709')).toBe('সহীহ মুসলিম ২৭০৯')
    for (const d of duas) expect(sourceFor('ar', d.source), d.slug).not.toMatch(/Sahih|Jami|Sunan|Quran/)
  })
  it('reciter helpers localise name, style and note', () => {
    const r = reciters[0]
    expect(reciterName('en', r)).toBe(r.name)
    expect(reciterName('ar', r)).toBe(r.ar)
    expect(reciterStyle('ar', 'Murattal')).toBe('مرتّل')
    expect(reciterStyle('bn', 'Mujawwad')).toMatch(/[ঀ-৿]/)
    expect(reciterStyle('en', 'Muallim')).toBe('Muallim')
    for (const x of reciters) {
      if (x.note) { expect(reciterNote('ar', x.note), x.note).toMatch(/[؀-ۿ]/); expect(reciterNote('bn', x.note), x.note).toMatch(/[ঀ-৿]/) }
    }
    expect(reciterNote('ar', undefined)).toBe('')
  })
})

describe('Bangla OG image text', () => {
  it('flags strings Satori cannot shape (pre-base vowel signs and conjuncts)', () => {
    expect(bnShapesCorrectly('সূরা আল-বাকারা')).toBe(true)
    expect(bnShapesCorrectly('নূর কুরআন')).toBe(true)
    expect(bnShapesCorrectly('সূরা আল-ফাতিহা')).toBe(false) // ি is drawn after the consonant
    expect(bnShapesCorrectly('ধৈর্য')).toBe(false) // ৈ + র্য conjunct
    expect(bnShapesCorrectly('মাক্কী')).toBe(false) // hasanta conjunct
    expect(bnShapesCorrectly('কোরআন')).toBe(false) // ো
  })
})
