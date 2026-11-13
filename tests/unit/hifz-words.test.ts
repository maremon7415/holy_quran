import { describe, it, expect } from 'vitest'
import { tokenize, firstLetter, fadeOrder, hiddenSet, shuffle, wordChoices, wordsMatch, diffRecitation } from '@/lib/hifz/words'

const AYAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'

describe('tokenize', () => {
  it('splits into words', () => expect(tokenize(AYAH)).toHaveLength(4))
  it('drops ۞ ۩ markers, attaches pause marks to previous word', () => {
    expect(tokenize('۞ قُلْ ۖ هُوَ')).toEqual(['قُلْ ۖ', 'هُوَ'])
    expect(tokenize('۩')).toEqual([])
  })
  it('empty / whitespace', () => { expect(tokenize('')).toEqual([]); expect(tokenize('   ')).toEqual([]) })
})

describe('firstLetter', () => {
  it('first letter with its diacritics', () => {
    expect(firstLetter('بِسْمِ')).toBe('بِ')
    expect(firstLetter('x')).toBe('x')
  })
})

describe('fade', () => {
  it('fadeOrder is a deterministic permutation', () => {
    const a = fadeOrder(10), b = fadeOrder(10)
    expect(a).toEqual(b)
    expect([...a].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
  it('hiddenSet sizes and nesting (more fade ⊇ less fade)', () => {
    expect(hiddenSet(10, 0).size).toBe(0)
    expect(hiddenSet(10, 100).size).toBe(10)
    expect(hiddenSet(10, 50).size).toBe(5)
    const small = hiddenSet(12, 25), big = hiddenSet(12, 75)
    for (const i of small) expect(big.has(i)).toBe(true)
  })
  it('count 0 / 1', () => { expect(fadeOrder(0)).toEqual([]); expect(hiddenSet(1, 100).size).toBe(1) })
})

describe('shuffle / wordChoices', () => {
  it('shuffle keeps elements, does not mutate', () => {
    const src = [1, 2, 3, 4, 5]
    const out = shuffle(src, 0.3)
    expect(src).toEqual([1, 2, 3, 4, 5])
    expect([...out].sort()).toEqual(src)
  })
  it('wordChoices contains the correct word, no duplicates (normalised)', () => {
    const words = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَـٰنِ', 'ٱلرَّحِيمِ']
    const c = wordChoices(words, 1)
    expect(c).toContain('ٱللَّهِ')
    expect(c).toHaveLength(3)
    expect(new Set(c).size).toBe(3)
  })
  it('few candidates → fewer choices, never throws', () => {
    expect(wordChoices(['الله'], 0)).toEqual(['الله'])
    expect(wordChoices(['الله', 'الله'], 0)).toEqual(['الله'])
  })
})

describe('wordsMatch', () => {
  it('ignores diacritics and alef variants', () => {
    expect(wordsMatch('ٱللَّهِ', 'الله')).toBe(true)
    expect(wordsMatch('أَحَدٌ', 'احد')).toBe(true)
  })
  it('allows one typo on long words only', () => {
    expect(wordsMatch('الرحمن', 'الرحمان')).toBe(true)
    expect(wordsMatch('احد', 'احذ')).toBe(false)
  })
  it('empty never matches', () => { expect(wordsMatch('', '')).toBe(false); expect(wordsMatch('الله', '')).toBe(false) })
})

describe('diffRecitation', () => {
  const exp = tokenize(AYAH)
  it('perfect', () => {
    const r = diffRecitation(exp, 'بسم الله الرحمن الرحيم')
    expect(r.accuracy).toBe(1)
    expect(r.extra).toEqual([])
    expect(r.items.every((i) => i.ok)).toBe(true)
  })
  it('missing word', () => {
    const r = diffRecitation(exp, 'بسم الله الرحيم')
    expect(r.accuracy).toBe(0.75)
    expect(r.items.map((i) => i.ok)).toEqual([true, true, false, true])
  })
  it('extra word is reported', () => {
    const r = diffRecitation(exp, 'بسم الله كلمة الرحمن الرحيم')
    expect(r.extra).toEqual(['كلمة'])
    expect(r.accuracy).toBe(1)
  })
  it('empty transcript → 0 accuracy; empty expected → 0, no NaN', () => {
    expect(diffRecitation(exp, '').accuracy).toBe(0)
    expect(diffRecitation([], 'foo').accuracy).toBe(0)
  })
})
