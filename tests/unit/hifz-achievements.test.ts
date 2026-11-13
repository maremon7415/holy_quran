import { describe, it, expect } from 'vitest'
import { achievements, type AchievementInput } from '@/lib/hifz/achievements'

const base: AchievementInput = { totalVerses: 0, longestStreak: 0, currentStreak: 0, completedSurahs: [], bookmarks: 0, hifzAyahs: 0, hifzStreak: 0, khatams: 0, hifzSurahs: [] }
const by = (i: AchievementInput) => Object.fromEntries(achievements(i).map((a) => [a.id, a]))

describe('achievements', () => {
  it('ids unique, all bilingual, nothing complete at zero', () => {
    const list = achievements(base)
    expect(new Set(list.map((a) => a.id)).size).toBe(list.length)
    for (const a of list) {
      expect(a.en && a.bn && a.descEn && a.descBn && a.icon).toBeTruthy()
      expect(a.value).toBe(0)
      expect(a.target).toBeGreaterThan(0)
    }
  })
  it('value is clamped to target', () => {
    const a = by({ ...base, totalVerses: 5000, bookmarks: 99 })
    expect(a['verses-100'].value).toBe(100)
    expect(a['verses-1000'].value).toBe(1000)
    expect(a['bookmarks-10'].value).toBe(10)
  })
  it('streak uses the max of longest/current', () => {
    const a = by({ ...base, longestStreak: 5, currentStreak: 2 })
    expect(a['streak-3'].value).toBe(3)
    expect(a['streak-7'].value).toBe(5)
    expect(by({ ...base, longestStreak: 1, currentStreak: 8 })['streak-7'].value).toBe(7)
  })
  it('juz amma counts only surahs 78–114', () => {
    expect(by({ ...base, completedSurahs: [1, 2, 3, 78, 114, 77] })['juz-amma'].value).toBe(2)
    expect(by({ ...base, completedSurahs: Array.from({ length: 37 }, (_, i) => 78 + i) })['juz-amma'].value).toBe(37)
  })
  it('hifz + khatam', () => {
    const a = by({ ...base, hifzAyahs: 150, hifzSurahs: [112], hifzStreak: 3, khatams: 1 })
    expect(a['hifz-100'].value).toBe(100)
    expect(a['hifz-surah'].value).toBe(1)
    expect(a['hifz-streak'].value).toBe(3)
    expect(a.khatam.value).toBe(1)
  })
})
