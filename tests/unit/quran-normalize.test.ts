import { describe, it, expect } from 'vitest'
import { normalizeArabic, normalizeLatin, isArabic, isBangla } from '@/lib/quran/normalize'

describe('normalizeArabic', () => {
  it('strips harakat & tatweel', () => {
    expect(normalizeArabic('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ')).toBe('بسم الله الرحمن')
    expect(normalizeArabic('كـتـاب')).toBe('كتاب')
  })
  it('unifies alef forms, ya, ta marbuta, hamza carriers', () => {
    expect(normalizeArabic('أإآٱ')).toBe('اااا')
    expect(normalizeArabic('على')).toBe(normalizeArabic('علي'))
    expect(normalizeArabic('رحمة')).toBe('رحمه')
    expect(normalizeArabic('مؤمن')).toBe('مومن')
    expect(normalizeArabic('شائع')).toBe('شايع')
  })
  it('collapses whitespace and trims', () => {
    expect(normalizeArabic('  الله   أكبر ')).toBe('الله اكبر')
  })
  it('is idempotent', () => {
    const once = normalizeArabic('إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا')
    expect(normalizeArabic(once)).toBe(once)
  })
  it('empty string', () => expect(normalizeArabic('')).toBe(''))
})

describe('normalizeLatin', () => {
  it('lowercases, strips diacritics and punctuation', () => {
    expect(normalizeLatin("  Ṣabr — Patience!  ")).toBe('sabr patience')
    expect(normalizeLatin("Ya-Sin, 'Ali")).toBe('ya sin ali')
  })
  it('keeps digits', () => expect(normalizeLatin('Ayah 2:255')).toBe('ayah 2 255'))
})

describe('script detection', () => {
  it('isArabic', () => { expect(isArabic('الله')).toBe(true); expect(isArabic('allah')).toBe(false) })
  it('isBangla', () => { expect(isBangla('ধৈর্য')).toBe(true); expect(isBangla('abc')).toBe(false) })
})
