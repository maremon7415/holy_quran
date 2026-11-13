import { describe, it, expect } from 'vitest'
import { getFamousAyah, curatedAyahKeys } from '@/lib/reader/famous'
import { chapters } from '@/lib/quran/chapters'

describe('famous ayah map', () => {
  it('Ayatul Kursi', () => {
    const f = getFamousAyah('2:255')
    expect(f?.en).toBe('Ayatul Kursi')
    expect(f?.aka).toContain('Throne Verse')
    expect(f?.bn).toBeTruthy()
  })
  it('fatihah and ikhlas expansion', () => {
    for (let i = 1; i <= 7; i++) expect(getFamousAyah(`1:${i}`)).not.toBeNull()
    expect(getFamousAyah('112:3')?.en).toBe('Surah Al-Ikhlas')
    expect(getFamousAyah('112:1')?.en).toBe('Qul Huwallahu Ahad') // not overwritten
  })
  it('unknown → null', () => {
    expect(getFamousAyah('2:1')).toBeNull()
    expect(getFamousAyah('garbage')).toBeNull()
  })
  it('curated keys are valid, unique ayahs, and all have a famous entry', () => {
    expect(new Set(curatedAyahKeys).size).toBe(curatedAyahKeys.length)
    for (const key of curatedAyahKeys) {
      const [s, a] = key.split(':').map(Number)
      expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(114)
      expect(a).toBeGreaterThanOrEqual(1); expect(a).toBeLessThanOrEqual(chapters[s - 1].versesCount)
      expect(getFamousAyah(key), key).not.toBeNull()
    }
  })
})
