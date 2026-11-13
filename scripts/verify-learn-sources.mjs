#!/usr/bin/env node
// Verifies every hadith cited on the /learn pages (data/learn/hadith-sources.ts) against the open hadith corpus
// (github.com/fawazahmed0/hadith-api, Arabic editions; same source and cache as scripts/verify-hadith-sources.mjs).
// A citation passes when the numbered hadith contains every phrase listed in its `must` array (diacritics ignored).
// Muslim uses Muhammad Fuad Abdul Baqi numbering (`arabicnumber`). For a failing citation the script searches the whole
// collection and prints the hadith number that does contain the phrases, so the number can be corrected.
// Usage: node --experimental-strip-types scripts/verify-learn-sources.mjs
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const cacheDir = path.join(root, 'scripts', '.cache', 'hadith')
fs.mkdirSync(cacheDir, { recursive: true })
const { learnHadith } = await import(pathToFileURL(path.join(root, 'data/learn/hadith-sources.ts')).href)

async function edition(book) {
  const f = path.join(cacheDir, `ara-${book}.json`)
  if (!fs.existsSync(f)) {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}.min.json`)
    if (!res.ok) throw new Error(`download ${book}: ${res.status}`)
    fs.writeFileSync(f, await res.text())
  }
  return JSON.parse(fs.readFileSync(f, 'utf8')).hadiths
}
const norm = (s) => s
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
  .replace(/[‎‏"“”.,،؛:!?()\[\]{}«»]/g, ' ')
  .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/\s+/g, ' ').trim()
const numberOf = (book, h) => (book === 'muslim' ? Math.floor(parseFloat(h.arabicnumber)) : h.hadithnumber)

const lookup = {}
let bad = 0, ok = 0
for (const c of learnHadith) {
  const hs = (lookup[c.book] ??= await edition(c.book))
  const cand = hs.filter((h) => numberOf(c.book, h) === c.number)
  const must = c.must.map(norm)
  const has = (h) => { const t = norm(h.text); return must.every((m) => t.includes(m)) }
  if (cand.some(has)) { ok++; console.log(`✓  ${c.id}: ${c.ref}`); continue }
  bad++
  const found = hs.filter(has).map((h) => numberOf(c.book, h))
  const partial = cand.map((h) => `${must.filter((m) => norm(h.text).includes(m)).length}/${must.length}`).join(', ') || 'no such number'
  console.log(`✗  ${c.id}: ${c.ref} does not contain all phrases (${partial}); hadith that do: ${found.slice(0, 8).join(', ') || 'none'}`)
}
console.log(`\n${ok} verified, ${bad} failed`)
process.exit(bad ? 1 : 0)
