import { normalizeArabic } from '@/lib/quran/normalize'

const LETTER = /[ء-يٱ-ۓ]/

/** Split an Uthmani ayah into words. Pause marks attach to the previous word; ۞ ۩ are dropped. */
export function tokenize(ar: string): string[] {
  const out: string[] = []
  for (const tok of ar.trim().split(/\s+/)) {
    if (!tok) continue
    if (LETTER.test(tok)) out.push(tok)
    else if (/[ۖ-ۜ]/.test(tok) && out.length) out[out.length - 1] += ` ${tok}`
  }
  return out
}

/** First letter plus its diacritics — used as a hint for a hidden word. */
export function firstLetter(word: string): string {
  let out = ''
  let letters = 0
  for (const ch of word) {
    if (LETTER.test(ch)) {
      letters++
      if (letters > 1) break
    }
    out += ch
  }
  return out
}

/** Deterministic pseudo-random order so the same words hide at each fade level. */
export function fadeOrder(count: number, seed = 7): number[] {
  const idx = Array.from({ length: count }, (_, i) => i)
  let s = seed * 9301 + count
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

/** Set of word indexes hidden at a fade percentage (0..100). */
export function hiddenSet(count: number, pct: number, seed = 7): Set<number> {
  const n = Math.round((count * pct) / 100)
  return new Set(fadeOrder(count, seed).slice(0, n))
}

export function shuffle<T>(arr: T[], seed = Math.random()): T[] {
  const a = [...arr]
  let s = Math.floor(seed * 2147483646) + 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Up to 3 choices (1 correct + 2 distractors) for the next word. */
export function wordChoices(words: string[], index: number, pool: string[] = []): string[] {
  const correct = words[index]
  const norm = normalizeArabic(correct)
  const candidates = [...words, ...pool].filter((w, i, arr) => normalizeArabic(w) !== norm && arr.findIndex((x) => normalizeArabic(x) === normalizeArabic(w)) === i)
  const picked = shuffle(candidates).slice(0, 2)
  return shuffle([correct, ...picked])
}

/* ---------------- recitation diff ---------------- */

const lev = (a: string, b: string) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

/** Lenient comparison for speech-to-text output (no diacritics, small spelling drift). */
export function wordsMatch(expected: string, heard: string): boolean {
  const a = normalizeArabic(expected).replace(/[^ء-ي]/g, '')
  const b = normalizeArabic(heard).replace(/[^ء-ي]/g, '')
  if (!a || !b) return false
  if (a === b) return true
  const d = lev(a, b)
  return d <= (Math.max(a.length, b.length) >= 5 ? 1 : 0)
}

export interface DiffItem {
  word: string
  ok: boolean
  /** what was heard in this slot (if any) */
  heard?: string
}

/** Align expected words against the spoken transcript (LCS) → per-expected-word match flags + extra words. */
export function diffRecitation(expected: string[], transcript: string): { items: DiffItem[]; extra: string[]; accuracy: number } {
  const heard = transcript.trim().split(/\s+/).filter(Boolean)
  const n = expected.length, m = heard.length
  const L = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = wordsMatch(expected[i], heard[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const items: DiffItem[] = []
  const used = new Set<number>()
  let i = 0, j = 0
  while (i < n && j < m) {
    if (wordsMatch(expected[i], heard[j])) {
      items.push({ word: expected[i], ok: true, heard: heard[j] })
      used.add(j); i++; j++
    } else if (L[i + 1][j] >= L[i][j + 1]) {
      items.push({ word: expected[i], ok: false }); i++
    } else j++
  }
  while (i < n) items.push({ word: expected[i++], ok: false })
  const extra = heard.filter((_, k) => !used.has(k))
  const ok = items.filter((x) => x.ok).length
  return { items, extra, accuracy: n ? ok / n : 0 }
}
