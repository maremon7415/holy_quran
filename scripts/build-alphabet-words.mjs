#!/usr/bin/env node
// Builds data/learn/alphabet-words.json: one real Quran word per Arabic letter (/learn/arabic-alphabet).
// Each letter in data/learn/alphabet.ts has a plain `seed` word. The script looks for the first ayah (preferring short ayahs of
// the later surahs) whose simple-script text contains a word equal to the seed, and takes the SAME word position from the Uthmani
// text (`ar`) so the displayed word, with its vowels, always comes from the corpus. Nothing is typed by hand.
// Usage: node --experimental-strip-types scripts/build-alphabet-words.mjs
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const { arabicLetters } = await import(pathToFileURL(path.join(root, 'data/learn/alphabet.ts')).href)
const norm = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')

const ayahs = []
for (let s = 1; s <= 114; s++) {
  const vs = JSON.parse(fs.readFileSync(path.join(root, 'data/quran/surah', `${s}.json`), 'utf8'))
  for (const v of vs) ayahs.push({ s, a: v.n, ar: v.ar.trim().split(/\s+/), sim: v.sim.trim().split(/\s+/) })
}
const out = {}
const missing = []
for (const l of arabicLetters) {
  const seed = norm(l.seed)
  let best = null
  for (const v of ayahs) {
    if (v.ar.length !== v.sim.length) continue
    const i = v.sim.findIndex((w) => norm(w) === seed)
    if (i < 0) continue
    const word = v.ar[i]
    // first base letter of the Uthmani word must be the letter itself (hamza forms count for alif)
    const first = norm(word).charAt(0)
    if (first !== norm(l.ar)) continue
    const score = v.sim.length + (v.s >= 78 ? 0 : 8)
    if (!best || score < best.score) best = { score, word, ref: `${v.s}:${v.a}` }
  }
  if (!best) { missing.push(`${l.id} (seed ${l.seed})`); continue }
  out[l.id] = { word: best.word.replace(/[ۖ-ۜ‌]/g, ''), ref: best.ref }
}
if (missing.length) throw new Error(`no Quran word found for: ${missing.join(', ')}`)
fs.writeFileSync(path.join(root, 'data/learn/alphabet-words.json'), JSON.stringify(out, null, 1) + '\n')
console.log(Object.entries(out).map(([k, v]) => `${k} ${v.word} ${v.ref}`).join('\n'))
