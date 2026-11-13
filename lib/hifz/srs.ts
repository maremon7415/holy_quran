/**
 * Spaced repetition for ayah memorisation — SM-2 variant with 4 grades and a
 * short "learning" step. Pure functions only (no I/O, `now` always injected).
 */
export type Grade = 0 | 1 | 2 | 3 // Again · Hard · Good · Easy
export const GRADES = [
  { g: 0 as Grade, en: 'Again', bn: 'আবার', ar: 'مرة أخرى' },
  { g: 1 as Grade, en: 'Hard', bn: 'কঠিন', ar: 'صعب' },
  { g: 2 as Grade, en: 'Good', bn: 'ভালো', ar: 'جيد' },
  { g: 3 as Grade, en: 'Easy', bn: 'সহজ', ar: 'سهل' },
]

export interface Card {
  /** "surah:ayah" */
  key: string
  ease: number
  /** days */
  interval: number
  /** epoch ms */
  due: number
  reps: number
  lapses: number
  last: number
  history: { t: number; g: Grade }[]
}

export const DAY = 86_400_000
export const MIN_EASE = 1.3
export const START_EASE = 2.5
const LEARN_STEP = 10 * 60_000 // "Again" comes back in 10 minutes
const MAX_HISTORY = 24

export function newCard(key: string, now: number): Card {
  return { key, ease: START_EASE, interval: 0, due: now, reps: 0, lapses: 0, last: 0, history: [] }
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Next state of a card after a review. */
export function review(card: Card, grade: Grade, now: number): Card {
  let { ease, interval, reps, lapses } = card
  if (grade === 0) {
    lapses += 1
    reps = 0
    interval = 0
    ease = Math.max(MIN_EASE, ease - 0.2)
  } else {
    if (reps === 0) interval = grade === 1 ? 1 : grade === 2 ? 1 : 3
    else if (reps === 1) interval = grade === 1 ? 2 : grade === 2 ? 4 : 7
    else {
      const mult = grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3
      interval = Math.max(card.interval + 1, Math.round(card.interval * mult))
    }
    ease = Math.max(MIN_EASE, ease + (grade === 1 ? -0.15 : grade === 2 ? 0 : 0.15))
    reps += 1
  }
  const due = grade === 0 ? now + LEARN_STEP : now + interval * DAY
  return {
    ...card,
    ease: Math.round(ease * 100) / 100,
    interval,
    due,
    reps,
    lapses,
    last: now,
    history: [...card.history, { t: now, g: grade }].slice(-MAX_HISTORY),
  }
}

/** Human preview of when a grade would schedule the next review (for buttons). */
export function previewInterval(card: Card | undefined, grade: Grade): number {
  const c = review(card ?? newCard('x', 0), grade, 0)
  return grade === 0 ? LEARN_STEP / DAY : c.interval
}

export function formatInterval(days: number, lang: 'en' | 'bn' | 'ar' = 'en'): string {
  const mins = Math.round(days * 24 * 60)
  const bn = lang === 'bn'
  if (lang === 'ar') {
    if (mins < 60) return `${mins} د`
    if (days < 1) return `${Math.round(mins / 60)} س`
    if (days < 30) return `${Math.round(days)} يوم`
    if (days < 365) return `${round1(days / 30)} شهر`
    return `${round1(days / 365)} سنة`
  }
  if (mins < 60) return bn ? `${mins} মি.` : `${mins}m`
  if (days < 1) return bn ? `${Math.round(mins / 60)} ঘ.` : `${Math.round(mins / 60)}h`
  if (days < 30) return bn ? `${Math.round(days)} দিন` : `${Math.round(days)}d`
  if (days < 365) return bn ? `${round1(days / 30)} মাস` : `${round1(days / 30)}mo`
  return bn ? `${round1(days / 365)} বছর` : `${round1(days / 365)}y`
}

export const isDue = (c: Card, now: number) => c.due <= now

/** Due cards, most overdue first. */
export function dueCards(cards: Record<string, Card>, now: number): Card[] {
  return Object.values(cards)
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due)
}

/** Interleave due cards from different surahs (round-robin) so reviews don't run in one block. */
export function interleave(cards: Card[]): Card[] {
  const groups = new Map<string, Card[]>()
  for (const c of cards) {
    const s = c.key.split(':')[0]
    groups.set(s, [...(groups.get(s) ?? []), c])
  }
  const lists = [...groups.values()]
  const out: Card[] = []
  let i = 0
  while (out.length < cards.length) {
    const l = lists[i % lists.length]
    const next = l.shift()
    if (next) out.push(next)
    i++
  }
  return out
}

/** Estimated recall probability 0..1 (exponential forgetting curve around the interval). */
export function retention(c: Card, now: number): number {
  if (c.reps === 0) return 0
  const elapsed = Math.max(0, now - c.last) / DAY
  const stability = Math.max(0.5, c.interval) * 2.2
  return Math.exp(-elapsed / stability)
}

/** "memorised" strength bucket for heat maps: 0 none, 1 learning, 2 young, 3 strong. */
export function strength(c: Card | undefined): 0 | 1 | 2 | 3 {
  if (!c || c.reps === 0) return c ? 1 : 0
  return c.interval >= 21 ? 3 : c.interval >= 4 ? 2 : 1
}

export const cardKey = (surah: number, ayah: number) => `${surah}:${ayah}`
export const parseKey = (key: string): [number, number] => {
  const [s, a] = key.split(':')
  return [+s, +a]
}

/** Local-date helpers shared by hifz/journey (YYYY-MM-DD, device timezone). */
export const dateStr = (d: number | Date = Date.now()) => new Date(d).toLocaleDateString('en-CA')
