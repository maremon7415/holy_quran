import { describe, it, expect } from 'vitest'
import { newCard, review, previewInterval, formatInterval, dueCards, interleave, retention, strength, cardKey, parseKey, dateStr, DAY, MIN_EASE, START_EASE, type Card, type Grade } from '@/lib/hifz/srs'

const T0 = Date.UTC(2026, 0, 1, 12)

describe('SM-2 review', () => {
  it('new card defaults', () => {
    const c = newCard('2:255', T0)
    expect(c).toMatchObject({ ease: START_EASE, interval: 0, reps: 0, lapses: 0, due: T0 })
  })
  it('first review intervals: Hard 1d, Good 1d, Easy 3d', () => {
    const c = newCard('1:1', T0)
    expect(review(c, 1, T0).interval).toBe(1)
    expect(review(c, 2, T0).interval).toBe(1)
    expect(review(c, 3, T0).interval).toBe(3)
  })
  it('second review intervals: 2 / 4 / 7 days', () => {
    const c1 = review(newCard('1:1', T0), 2, T0)
    expect(review(c1, 1, T0).interval).toBe(2)
    expect(review(c1, 2, T0).interval).toBe(4)
    expect(review(c1, 3, T0).interval).toBe(7)
  })
  it('third+ review multiplies by ease and always grows by at least a day', () => {
    let c = newCard('1:1', T0)
    c = review(c, 2, T0); c = review(c, 2, T0) // reps=2, interval 4, ease 2.5
    const good = review(c, 2, T0)
    expect(good.interval).toBe(10) // 4 * 2.5
    const hard = review(c, 1, T0)
    expect(hard.interval).toBe(5) // round(4*1.2)=5 (=max(5,5))
    const tiny: Card = { ...c, interval: 1 }
    expect(review(tiny, 1, T0).interval).toBeGreaterThanOrEqual(2)
  })
  it('Easy > Good > Hard intervals once graduated', () => {
    const c: Card = { ...newCard('1:1', T0), reps: 5, interval: 20, ease: 2.5 }
    const [h, g, e] = ([1, 2, 3] as Grade[]).map((x) => review(c, x, T0).interval)
    expect(e).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(h)
  })
  it('Again: lapse++, reps reset, interval 0, due in 10 minutes, ease -0.2', () => {
    const c: Card = { ...newCard('1:1', T0), reps: 4, interval: 30, ease: 2.5 }
    const r = review(c, 0, T0)
    expect(r).toMatchObject({ lapses: 1, reps: 0, interval: 0, ease: 2.3 })
    expect(r.due).toBe(T0 + 10 * 60_000)
  })
  it('ease never drops below the floor, however many lapses', () => {
    let c = newCard('1:1', T0)
    for (let i = 0; i < 30; i++) c = review(c, 0, T0)
    expect(c.ease).toBe(MIN_EASE)
    expect(c.lapses).toBe(30)
    for (let i = 0; i < 30; i++) c = review(c, 1, T0) // Hard also lowers ease
    expect(c.ease).toBeGreaterThanOrEqual(MIN_EASE)
  })
  it('Easy raises ease, Good keeps it, Hard lowers it', () => {
    const c: Card = { ...newCard('1:1', T0), reps: 3, interval: 10 }
    expect(review(c, 3, T0).ease).toBe(2.65)
    expect(review(c, 2, T0).ease).toBe(2.5)
    expect(review(c, 1, T0).ease).toBe(2.35)
  })
  it('does not mutate input and schedules due = now + interval days', () => {
    const c = newCard('1:1', T0)
    const frozen = JSON.stringify(c)
    const r = review(c, 3, T0)
    expect(JSON.stringify(c)).toBe(frozen)
    expect(r.due).toBe(T0 + 3 * DAY)
    expect(r.last).toBe(T0)
  })
  it('history is capped at 24 entries (most recent kept)', () => {
    let c = newCard('1:1', T0)
    for (let i = 0; i < 40; i++) c = review(c, 2, T0 + i)
    expect(c.history).toHaveLength(24)
    expect(c.history.at(-1)?.t).toBe(T0 + 39)
  })
  it('recovers after a lapse (restarts the 1d/4d ladder)', () => {
    let c: Card = { ...newCard('1:1', T0), reps: 6, interval: 60 }
    c = review(c, 0, T0)
    c = review(c, 2, T0)
    expect(c.interval).toBe(1)
  })
})

describe('preview / format', () => {
  it('previewInterval', () => {
    expect(previewInterval(undefined, 0)).toBeCloseTo(10 / 1440)
    expect(previewInterval(undefined, 3)).toBe(3)
  })
  it('formatInterval en', () => {
    expect(formatInterval(10 / 1440)).toBe('10m')
    expect(formatInterval(0.25)).toBe('6h')
    expect(formatInterval(4)).toBe('4d')
    expect(formatInterval(45)).toBe('1.5mo')
    expect(formatInterval(730)).toBe('2y')
  })
  it('formatInterval bn', () => {
    expect(formatInterval(4, 'bn')).toBe('4 দিন')
  })
})

describe('queues', () => {
  const mk = (key: string, due: number): Card => ({ ...newCard(key, 0), due })
  it('dueCards: only due, most overdue first', () => {
    const cards = { a: mk('1:1', 50), b: mk('1:2', 10), c: mk('1:3', 500) }
    expect(dueCards(cards, 100).map((c) => c.key)).toEqual(['1:2', '1:1'])
    expect(dueCards({}, 100)).toEqual([])
    expect(dueCards(cards, 50).map((c) => c.key)).toEqual(['1:2', '1:1']) // due <= now inclusive
  })
  it('interleave round-robins surahs and keeps all cards', () => {
    const cards = [mk('2:1', 1), mk('2:2', 2), mk('2:3', 3), mk('3:1', 4), mk('4:1', 5)]
    const out = interleave(cards).map((c) => c.key)
    expect(out).toEqual(['2:1', '3:1', '4:1', '2:2', '2:3'])
    expect(interleave([])).toEqual([])
  })
})

describe('retention & strength', () => {
  it('retention: 0 for unreviewed, 1 right after review, decays with time', () => {
    const base: Card = { ...newCard('1:1', T0), reps: 1, interval: 4, last: T0 }
    expect(retention(newCard('1:1', T0), T0)).toBe(0)
    expect(retention(base, T0)).toBe(1)
    expect(retention(base, T0 + 4 * DAY)).toBeLessThan(retention(base, T0 + DAY))
    expect(retention(base, T0 - DAY)).toBe(1) // clock skew
  })
  it('longer interval → higher retention at same elapsed time', () => {
    const a: Card = { ...newCard('1:1', T0), reps: 2, interval: 2, last: T0 }
    const b = { ...a, interval: 30 }
    expect(retention(b, T0 + 5 * DAY)).toBeGreaterThan(retention(a, T0 + 5 * DAY))
  })
  it('strength buckets', () => {
    expect(strength(undefined)).toBe(0)
    expect(strength(newCard('1:1', 0))).toBe(1)
    expect(strength({ ...newCard('1:1', 0), reps: 2, interval: 4 })).toBe(2)
    expect(strength({ ...newCard('1:1', 0), reps: 2, interval: 21 })).toBe(3)
    expect(strength({ ...newCard('1:1', 0), reps: 2, interval: 3 })).toBe(1)
  })
})

describe('keys & dates', () => {
  it('cardKey / parseKey round trip', () => expect(parseKey(cardKey(112, 3))).toEqual([112, 3]))
  it('dateStr is YYYY-MM-DD', () => expect(dateStr(new Date(2026, 5, 7, 23, 59))).toBe('2026-06-07'))
})
