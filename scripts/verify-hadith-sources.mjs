#!/usr/bin/env node
// Verifies every hadith reference in data/content/duas.ts against the open hadith corpus
// (github.com/fawazahmed0/hadith-api, Arabic editions). For each dua with hand-typed Arabic it
// checks that the cited hadith actually contains the dua text, and if not, searches the whole
// collection for the best-matching hadith and suggests the correct number.
// Usage: node --experimental-strip-types scripts/verify-hadith-sources.mjs
// Numbering: Bukhari / Abu Dawud / Tirmidhi / Ibn Majah / Nasai use the common (sunnah.com) numbers;
// Muslim uses Muhammad Fuad Abdul Baqi numbering (the `arabicnumber` field in the corpus).
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const cacheDir = path.join(root, 'scripts', '.cache', 'hadith')
fs.mkdirSync(cacheDir, { recursive: true })
const { duas } = await import(pathToFileURL(path.join(root, 'data/content/duas.ts')).href)

const BOOKS = {
  'sahih al-bukhari': 'bukhari', bukhari: 'bukhari',
  'sahih muslim': 'muslim', muslim: 'muslim',
  'jami at-tirmidhi': 'tirmidhi', 'jami` at-tirmidhi': 'tirmidhi', tirmidhi: 'tirmidhi',
  'sunan abi dawud': 'abudawud', 'sunan abu dawud': 'abudawud',
  'sunan ibn majah': 'ibnmajah', 'sunan an-nasai': 'nasai', "sunan an-nasa'i": 'nasai',
}

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
  .replace(/\([^)]*\)/g, ' ') // drop editorial notes like (ثلاثا)
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '') // harakat & Quranic marks
  .replace(/[‎‏"“”.,،؛:!?()\[\]{}«»ـ]/g, ' ') // punctuation, direction marks
  .replace(/[إأآٱا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/\s+/g, ' ').trim()
const shingles = (s, n = 3) => { const w = norm(s).split(' '); const out = new Set(); for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' ')); if (!out.size && w.length) out.add(w.join(' ')); return out }
const coverage = (dua, text) => { const sh = shingles(dua); const t = ' ' + norm(text) + ' '; let hit = 0; for (const s of sh) if (t.includes(' ' + s + ' ')) hit++; return sh.size ? hit / sh.size : 0 }

function parseSources(src) {
  return src.split(';').map((s) => s.trim()).map((s) => {
    const m = s.match(/^(.*?)\s+(\d+)[a-z]?$/i)
    if (!m) return null
    const book = BOOKS[m[1].toLowerCase().trim()]
    return book ? { label: s, book, n: +m[2] } : null
  }).filter(Boolean)
}

// Phrase the virtue hadith must contain for Quranic duas (keyed by dua slug)
const VIRTUE_KEYWORDS = {
  'ayatul-kursi': 'الكرسي',
  'surah-ikhlas-falaq-nas': 'قل هو الله احد',
  'dua-for-travel': 'سبحان الذي سخر لنا هذا',
  'dua-of-yunus': 'سبحانك اني كنت من الظالمين',
  'hasbunallahu-wa-nimal-wakil': 'حسبنا الله ونعم الوكيل',
  'rabbana-atina-fid-dunya-hasanah': 'ربنا اتنا في الدنيا حسنه',
  'rabbana-la-tuakhidhna': 'سوره البقره',
}

const lookup = {}
let bad = 0, ok = 0, skipped = 0
const report = []
for (const d of duas) {
  const srcs = parseSources(d.source || '')
  if (!srcs.length) { skipped++; continue }
  if (!d.ar) {
    // Quranic dua: the hadith is cited for its virtue — check that it mentions the dua/verse.
    const kw = VIRTUE_KEYWORDS[d.slug]
    for (const s of srcs) {
      const hs = (lookup[s.book] ??= await edition(s.book))
      const cand = s.book === 'muslim' ? hs.filter((h) => Math.floor(parseFloat(h.arabicnumber)) === s.n) : hs.filter((h) => h.hadithnumber === s.n)
      const hit = kw && cand.some((h) => norm(h.text).includes(norm(kw)))
      if (hit) { ok++; report.push(`✓  ${d.slug}: ${s.label} mentions “${kw}”`) }
      else if (!kw) { skipped++; report.push(`•  ${d.slug}: ${s.label} — add a VIRTUE_KEYWORDS entry to check it`) }
      else { bad++; report.push(`✗  ${d.slug}: ${s.label} does not mention “${kw}”`) }
    }
    continue
  }
  const short = norm(d.ar).split(' ').length < 3
  for (const s of srcs) {
    const hs = (lookup[s.book] ??= await edition(s.book))
    const cand = s.book === 'muslim'
      ? hs.filter((h) => Math.floor(parseFloat(h.arabicnumber)) === s.n)
      : hs.filter((h) => h.hadithnumber === s.n)
    const best = Math.max(0, ...cand.map((h) => coverage(d.ar, h.text)))
    if (best >= 0.5 || (short && best > 0)) { ok++; report.push(`✓  ${d.slug}: ${s.label} (${Math.round(best * 100)}%)`); continue }
    // search whole collection for the best match
    let top = null
    for (const h of hs) { const c = coverage(d.ar, h.text); if (!top || c > top.c) top = { c, h } }
    const num = top && (s.book === 'muslim' ? Math.floor(parseFloat(top.h.arabicnumber)) : top.h.hadithnumber)
    bad++
    report.push(`✗  ${d.slug}: ${s.label} matches only ${Math.round(best * 100)}% → best in ${s.book}: #${num} (${Math.round((top?.c ?? 0) * 100)}%)`)
  }
}
// Hadith cited on the Islamic-events pages (lib/events/hadith-refs.ts): each entry's Arabic keyword must occur in the
// Arabic hadith at exactly that collection + number.
const { EVENT_HADITH } = await import(pathToFileURL(path.join(root, 'lib/events/hadith-refs.ts')).href)
for (const h of Object.values(EVENT_HADITH)) {
  const hs = (lookup[h.c] ??= await edition(h.c))
  const cand = h.c === 'muslim' ? hs.filter((x) => Math.floor(parseFloat(x.arabicnumber)) === h.n) : hs.filter((x) => x.hadithnumber === h.n)
  if (cand.some((x) => norm(x.text).includes(norm(h.kw)))) { ok++; report.push(`✓  events/${h.id}: ${h.c} ${h.n} contains “${h.kw}”`) }
  else { bad++; report.push(`✗  events/${h.id}: ${h.c} ${h.n} does not contain “${h.kw}”`) }
}

console.log(report.join('\n'))
console.log(`\n${ok} verified, ${bad} mismatched, ${skipped} skipped (Quranic or no hadith number)`)
process.exit(bad ? 1 : 0)
