#!/usr/bin/env node
// Builds data/hadith/index.json: compact metadata (collections, books with hadith ranges, counts, grade summary,
// Muslim's Abdul-Baqi number map) from the open hadith corpus (github.com/fawazahmed0/hadith-api on jsDelivr).
// Hadith TEXTS are NOT stored in the repo: they are fetched at request time (see lib/hadith/fetch.ts).
// It also validates lib/hadith/featured.ts (every curated hadith must exist and contain its keyword).
// Usage: node --experimental-strip-types scripts/build-hadith-index.mjs [--check]
//   (downloads once into scripts/.cache/hadith, which is git-ignored)
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const cache = path.join(root, 'scripts', '.cache', 'hadith')
const out = path.join(root, 'data', 'hadith', 'index.json')
const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'
fs.mkdirSync(cache, { recursive: true })

// slug (our URL slug) → API key
const COLLECTIONS = { bukhari: 'bukhari', muslim: 'muslim', abudawud: 'abudawud', tirmidhi: 'tirmidhi', nasai: 'nasai', ibnmajah: 'ibnmajah', malik: 'malik', nawawi40: 'nawawi', qudsi40: 'qudsi' }
const GRADER = { abudawud: 'Al-Albani', tirmidhi: 'Al-Albani', nasai: 'Al-Albani', ibnmajah: 'Al-Albani', malik: 'Salim al-Hilali' }

async function get(name, url) {
  const f = path.join(cache, name)
  if (!fs.existsSync(f)) {
    let res = await fetch(url.replace('.json', '.min.json'))
    if (!res.ok) res = await fetch(url)
    if (!res.ok) return null
    fs.writeFileSync(f, await res.text())
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'))
}

const gradeCat = (g) => {
  const s = g.toLowerCase()
  if (/da['’]?if|daif|weak|munkar|mawdu|maudu|fabricat|shadh/.test(s)) return 'daif'
  if (/hasan/.test(s)) return 'hasan'
  if (/sahih/.test(s)) return 'sahih'
  return 'other'
}

const info = await get('info.json', `${BASE}/info.json`)
const index = { v: 1, source: 'fawazahmed0/hadith-api@1', generated: new Date().toISOString().slice(0, 10), collections: {} }
const texts = {} // slug → Map number → { ar, en, bn flags }

for (const [slug, key] of Object.entries(COLLECTIONS)) {
  const isMuslim = slug === 'muslim'
  const eds = {}
  for (const l of ['ara', 'eng', 'ben']) eds[l] = (await get(`${l}-${key}.json`, `${BASE}/editions/${l}-${key}.json`))?.hadiths ?? null
  const ara = eds.ara
  if (!ara) throw new Error(`no Arabic edition for ${key}`)
  const numOf = (h) => (isMuslim ? (h.arabicnumber == null ? null : Math.floor(parseFloat(h.arabicnumber))) : Math.floor(h.hadithnumber))

  // number → { runs of hadithnumber, book, has text per language }
  const groups = new Map()
  ara.forEach((h, i) => {
    const n = numOf(h)
    if (n == null || !(n >= 1)) return
    let g = groups.get(n)
    if (!g) groups.set(n, (g = { runs: [], book: h.reference.book, ar: false, en: false, bn: false }))
    const last = g.runs[g.runs.length - 1]
    if (last && last[0] + last[1] === h.hadithnumber) last[1]++
    else g.runs.push([h.hadithnumber, 1])
    for (const [l, k] of [['ara', 'ar'], ['eng', 'en'], ['ben', 'bn']]) if (eds[l]?.[i]?.text?.trim()) g[k] = true
  })
  for (const l of ['eng', 'ben']) if (eds[l] && eds[l].length !== ara.length) throw new Error(`${l}-${key} length differs from ara`)
  texts[slug] = groups

  const nums = [...groups.keys()].sort((a, b) => a - b)
  const dead = nums.filter((n) => { const g = groups.get(n); return !g.ar && !g.en && !g.bn })
  const sectionNames = info[key].metadata.sections
  // books: each entry's `reference.book` when set; otherwise (the corpus has book 0 for hundreds of Bukhari / Nasa'i / Ibn
  // Majah entries) the section whose hadithnumber range contains it, else the previous entry's book.
  const sd = info[key].metadata.section_details
  const named = (b) => !!sectionNames[b]?.trim()
  let lastBook = -1
  const bookOf = (h) => {
    if (h.reference.book > 0) return (lastBook = h.reference.book)
    for (const [b, r] of Object.entries(sd)) if (named(b) && r.hadithnumber_last > 0 && h.hadithnumber >= r.hadithnumber_first && h.hadithnumber <= r.hadithnumber_last) return (lastBook = Number(b))
    return lastBook
  }
  const bookMap = new Map()
  const seenBook = new Set()
  ara.forEach((h) => {
    const n = numOf(h)
    if (n == null || !(n >= 1)) return
    const b = bookOf(h)
    if (b < 0) throw new Error(`${slug} ${h.hadithnumber}: no book`)
    const k = `${b}:${n}`
    if (seenBook.has(k)) return
    seenBook.add(k)
    let e = bookMap.get(b)
    if (!e) bookMap.set(b, (e = { first: n, last: n, count: 0, nums: [] }))
    e.first = Math.min(e.first, n); e.last = Math.max(e.last, n); e.count++; e.nums.push(n)
  })
  const books = [...bookMap.entries()].sort((a, b) => a[0] - b[0])
    .filter(([b]) => sectionNames[b] && (b > 0 || !isMuslim))
    .map(([b, e]) => {
      const row = [b, sectionNames[b].trim(), e.first, e.last, e.count]
      if (!isMuslim && e.last - e.first + 1 !== e.count) {
        // interleaved book: list its runs [start, end, start, end …]
        const ns = [...e.nums].sort((x, y) => x - y)
        const runs = []
        for (const n of ns) { const r = runs[runs.length - 1]; if (r && r[1] === n - 1) r[1] = n; else runs.push([n, n]) }
        row.push(runs.flat())
      }
      return row
    })
  if (!isMuslim) {
    const total = books.reduce((a, b) => a + b[4], 0)
    if (total !== nums.length) throw new Error(`${slug}: books cover ${total} of ${nums.length} numbers`)
    const bad = books.filter((b) => b[5])
    if (bad.length) console.warn(`  note: ${slug}: interleaved books (stored as runs): ${bad.map((b) => b[0]).join(',')}`)
  }

  const c = {
    first: nums[0], last: nums[nums.length - 1], count: nums.length,
    langs: { ar: nums.filter((n) => groups.get(n).ar).length, en: nums.filter((n) => groups.get(n).en).length, bn: nums.filter((n) => groups.get(n).bn).length },
    books, dead,
  }
  if (isMuslim || nums.length !== c.last - c.first + 1) {
    // sparse / multi-run numbering: explicit map  number → [start, count, start, count …]
    c.map = Object.fromEntries(nums.map((n) => [n, groups.get(n).runs.flat()]))
  }
  const gr = GRADER[slug]
  if (gr) {
    const tally = { sahih: 0, hasan: 0, daif: 0, other: 0, ungraded: 0 }
    for (const h of info[key].hadiths) {
      const g = h.grades.find((x) => x.name === gr)
      if (!g) tally.ungraded++
      else tally[gradeCat(g.grade)]++
    }
    c.grades = { by: gr, ...tally }
  }
  index.collections[slug] = c
  console.log(`${slug}: ${c.count} numbers (${c.first}–${c.last}), ${books.length} books, dead ${dead.length}, map ${c.map ? 'yes' : 'no'}`)
}

fs.mkdirSync(path.dirname(out), { recursive: true })
if (!process.argv.includes('--check')) {
  fs.writeFileSync(out, JSON.stringify(index))
  console.log(`wrote ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`)
}

// ── validate curated hadiths against the English corpus ──
const { featured } = await import(pathToFileURL(path.join(root, 'lib/hadith/featured.ts')).href)
let bad = 0
for (const f of featured) {
  const key = COLLECTIONS[f.c]
  const eng = (await get(`eng-${key}.json`, `${BASE}/editions/eng-${key}.json`)).hadiths
  const isMuslim = f.c === 'muslim'
  const hits = eng.filter((h) => (isMuslim ? (h.arabicnumber == null ? -1 : Math.floor(parseFloat(h.arabicnumber))) : Math.floor(h.hadithnumber)) === f.n)
  const text = hits.map((h) => h.text).join(' ').toLowerCase()
  const norm = text.replace(/[‘’`´]/g, "'").replace(/\s+/g, ' ')
  if (!hits.length || !norm.includes(f.kw)) { bad++; console.log(`✗ ${f.c} ${f.n}: "${f.kw}" not found. Got: ${norm.slice(0, 160)}`) }
}
console.log(bad ? `\n${bad} curated hadith(s) failed validation` : `\nAll ${featured.length} curated hadiths verified against the corpus`)
process.exit(bad ? 1 : 0)
