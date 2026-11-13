import { describe, it, expect } from 'vitest'
import { reciters, getReciter, DEFAULT_RECITER, everyAyahUrl, monogram } from '@/lib/audio/reciters'

describe('reciter catalogue integrity', () => {
  it('ids are unique', () => expect(new Set(reciters.map((r) => r.id)).size).toBe(reciters.length))
  it('required fields present', () => {
    for (const r of reciters) {
      expect(r.name, String(r.id)).toBeTruthy()
      expect(r.ar).toMatch(/[؀-ۿ]/)
      expect(['Murattal', 'Mujawwad', 'Muallim']).toContain(r.style)
    }
  })
  it('chapter-file reciters have quran.com ids (≤200); everyayah-only have ids ≥1000 and a folder', () => {
    for (const r of reciters) {
      if (r.chapter) expect(r.id).toBeLessThanOrEqual(200)
      else { expect(r.id).toBeGreaterThanOrEqual(1000); expect(r.folder, r.name).toBeTruthy() }
    }
  })
  it('folders look like everyayah folder names', () => {
    for (const r of reciters) if (r.folder) expect(r.folder).toMatch(/^[A-Za-z0-9_.\-]+$/)
  })
  it('default reciter exists', () => expect(reciters.some((r) => r.id === DEFAULT_RECITER)).toBe(true))
  it('getReciter falls back to the first entry', () => {
    expect(getReciter(7).name).toContain('Alafasy')
    expect(getReciter(424242)).toBe(reciters[0])
  })
})

describe('everyAyahUrl', () => {
  it('zero-pads surah and ayah', () => {
    expect(everyAyahUrl(getReciter(7), 2, 255)).toBe('https://everyayah.com/data/Alafasy_128kbps/002255.mp3')
    expect(everyAyahUrl(getReciter(7), 1, 1)).toBe('https://everyayah.com/data/Alafasy_128kbps/001001.mp3')
    expect(everyAyahUrl(getReciter(7), 114, 6)).toMatch(/114006\.mp3$/)
  })
  it('falls back to Alafasy when no folder', () => {
    const tunaiji = reciters.find((r) => r.folder === null)!
    expect(everyAyahUrl(tunaiji, 1, 1)).toContain('Alafasy_128kbps')
  })
})

describe('monogram', () => {
  it('two letters from first/last significant name part', () => {
    expect(monogram('Mishary Rashid Alafasy')).toBe('MA')
    expect(monogram('Abdur-Rahman As-Sudais')).toBe('RS')
  })
  it('single word', () => expect(monogram('Sudais').length).toBeGreaterThan(0))
})
