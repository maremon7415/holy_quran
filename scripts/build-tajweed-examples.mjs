#!/usr/bin/env node
// Builds data/learn/tajweed-examples.json: real Quran examples for every tajweed rule page (/learn/tajweed/{rule}).
//
// Source: the open Quran.com (Quran Foundation) API v4 `uthmani_tajweed` markup, fetched once
//   https://api.quran.com/api/v4/quran/verses/uthmani_tajweed
// cached in scripts/.cache/tajweed.json (git-ignored). The markup colours most rules with <tajweed class=…> tags.
// Rules the markup does not tag (izhar, qamariyyah lams, tafkheem/tarqeeq, waqf signs, madd muttasil vs munfasil)
// are found programmatically from the text of the same verses and marked with synthetic classes
// (izhar, izhar_shafawi, qamariyyah, tafkheem, tarqeeq, waqf).
//
// Every example keeps ONLY the classes of the rule being taught (other colours are stripped), is sanitised to
// <tajweed class="x">…</tajweed> (nothing else), and its plain text is checked against the Quran corpus in data/quran
// (letters only) — a verse that does not match is dropped. Quran text is never typed by hand.
//
// Usage: node scripts/build-tajweed-examples.mjs
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const cacheDir = path.join(root, 'scripts', '.cache')
const cache = path.join(cacheDir, 'tajweed.json')
const out = path.join(root, 'data', 'learn', 'tajweed-examples.json')
const URL_API = 'https://api.quran.com/api/v4/quran/verses/uthmani_tajweed'

fs.mkdirSync(cacheDir, { recursive: true })
if (!fs.existsSync(cache)) {
  const res = await fetch(URL_API)
  if (!res.ok) throw new Error(`Quran.com API ${res.status}`)
  fs.writeFileSync(cache, await res.text())
}
const verses = JSON.parse(fs.readFileSync(cache, 'utf8')).verses
if (verses.length !== 6236) throw new Error(`expected 6236 verses, got ${verses.length}`)

// ── parse markup into per-character records ────────────────────────────────────────────────────────────────────────
const ALLOWED = new Set(['ham_wasl', 'slnt', 'laam_shamsiyah', 'madda_normal', 'madda_permissible', 'madda_necessary', 'madda_obligatory', 'qalaqah', 'ikhafa_shafawi', 'ikhafa', 'iqlab', 'idgham_shafawi', 'idgham_ghunnah', 'idgham_wo_ghunnah', 'ghunnah', 'idgham_mutajanisayn', 'idgham_mutaqaribayn',
  'izhar', 'izhar_shafawi', 'qamariyyah', 'tafkheem', 'tarqeeq', 'waqf'])

const SYNTH = new Set(['izhar', 'izhar_shafawi', 'qamariyyah', 'tafkheem', 'tarqeeq', 'waqf'])

function parse(markup) {
  const chars = []
  let cls = null
  const re = /<tajweed class=([a-z_]+)>|<\/tajweed>|<span class=end>[^<]*<\/span>|([^<]+)/g
  let m
  while ((m = re.exec(markup))) {
    if (m[1]) cls = m[1]
    else if (m[0] === '</tajweed>') cls = null
    else if (m[2]) for (const ch of m[2]) chars.push({ c: ch, k: cls })
  }
  return chars
}

const MARK = /[ؐ-ًؚ-ٰٟٲٳۖ-ۜ۟-۪ۨ-ۭ࣓-ࣿ‌‍]/
const isMark = (ch) => MARK.test(ch)
const SUKUN = 'ْ'
const TANWEEN = /[ًࣰٌࣱٍࣲۡ]/ // fathatan, dammatan, kasratan (+ open tanween forms)
const HALQI = new Set(['ء', 'أ', 'إ', 'آ', 'ؤ', 'ئ', 'ه', 'ع', 'ح', 'غ', 'خ'])
const MOON = new Set(['ا', 'ٱ', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي', 'ء', 'أ', 'إ'])
const WAQF = { 'ۘ': 'lazim', 'ۖ': 'sila', 'ۗ': 'qila', 'ۚ': 'jaiz', 'ۛ': 'muanaqah', 'ۙ': 'la', 'ۜ': 'saktah' }

/** Index of the first base letter at or after i (skipping marks / spaces / waqf signs); -1 if none. */
const nextLetter = (ch, i) => { for (let j = i; j < ch.length; j++) { if (!isMark(ch[j].c) && ch[j].c !== ' ') return j } return -1 }

function wordsOf(ch) {
  const w = []
  let s = 0
  for (let i = 0; i <= ch.length; i++) if (i === ch.length || ch[i].c === ' ') { if (i > s) w.push([s, i]); s = i + 1 }
  return w
}

const copy = (ch) => ch.map((x) => ({ ...x }))
/** Keep only the classes in `keep`, drop every other colour, then add synthetic marks (list of {from,to,cls} index ranges). */
function focus(ch, keep, extra = []) {
  const r = ch.map((x) => ({ c: x.c, k: x.k && keep.has(x.k) ? x.k : null }))
  for (const { from, to, cls } of extra) for (let i = from; i < to; i++) r[i].k = cls
  return r
}
function render(ch) {
  let html = '', cur = null
  for (const x of ch) {
    if (x.k !== cur) { if (cur) html += '</tajweed>'; if (x.k) html += `<tajweed class="${x.k}">`; cur = x.k }
    html += x.c
  }
  if (cur) html += '</tajweed>'
  return html
}
/** letter + its following marks */
const withMarks = (ch, i) => { let j = i + 1; while (j < ch.length && isMark(ch[j].c)) j++; return j }

// ── finders: (chars) → { cls, spans:[{from,to,cls}] , tag? } hits ──────────────────────────────────────────────────
function findIzhar(ch) {
  const hits = []
  for (let i = 0; i < ch.length; i++) {
    if (ch[i].k) continue
    // noon sakinah followed by a throat letter (same or next word)
    if (ch[i].c === 'ن' && ch[i + 1]?.c === SUKUN && !ch[i].k) {
      const j = nextLetter(ch, i + 2)
      if (j > 0 && HALQI.has(ch[j].c) && !ch[j].k) hits.push({ spans: [{ from: i, to: withMarks(ch, i), cls: 'izhar' }, { from: j, to: withMarks(ch, j), cls: 'izhar' }], letter: ch[j].c })
    }
    // tanween at the end of a word followed by a throat letter in the next word
    if (TANWEEN.test(ch[i].c)) {
      let e = i + 1
      while (e < ch.length && isMark(ch[e].c) && ch[e].c !== '‌') e++
      if (ch[e]?.c === 'ا' || ch[e]?.c === 'ى') e++ // silent alif carrying the fathatan
      while (e < ch.length && (isMark(ch[e].c) || ch[e].c === '‌')) e++
      if (ch[e]?.c !== ' ') continue
      const j = nextLetter(ch, e + 1)
      if (j > 0 && HALQI.has(ch[j].c) && !ch[j].k) {
        let b = i; while (b > 0 && isMark(ch[b].c)) b-- // letter carrying the tanween
        hits.push({ spans: [{ from: b, to: withMarks(ch, b), cls: 'izhar' }, { from: j, to: withMarks(ch, j), cls: 'izhar' }], letter: ch[j].c })
      }
    }
  }
  return hits
}

function findIzharShafawi(ch) {
  const hits = []
  for (let i = 0; i < ch.length; i++) {
    if (ch[i].c === 'م' && ch[i + 1]?.c === SUKUN && !ch[i].k) {
      // meem sakinah at the end of a word
      let e = i + 2; while (e < ch.length && isMark(ch[e].c)) e++
      if (ch[e]?.c !== ' ') continue
      const j = nextLetter(ch, e + 1)
      if (j > 0 && !['م', 'ب'].includes(ch[j].c) && !ch[j].k) hits.push({ spans: [{ from: i, to: withMarks(ch, i), cls: 'izhar_shafawi' }, { from: j, to: withMarks(ch, j), cls: 'izhar_shafawi' }], letter: ch[j].c })
    }
  }
  return hits
}

function findQamariyyah(ch) {
  const hits = []
  for (let i = 0; i < ch.length - 3; i++) {
    if (ch[i].c === 'ٱ' && ch[i + 1].c === 'ل' && ch[i + 2].c === SUKUN) {
      const j = nextLetter(ch, i + 3)
      if (j > 0 && MOON.has(ch[j].c) && !ch[i + 1].k) hits.push({ spans: [{ from: i + 1, to: withMarks(ch, i + 1), cls: 'qamariyyah' }, { from: j, to: withMarks(ch, j), cls: 'qamariyyah' }], letter: ch[j].c })
    }
  }
  return hits
}

/** vowel mark directly before position i (skipping spaces / waqf signs) */
function vowelBefore(ch, i) {
  for (let j = i - 1; j >= 0; j--) {
    const c = ch[j].c
    if (c === ' ' || c === '‌' || /[ۖ-ۜ]/.test(c)) continue
    if (c === 'َ' || c === 'ُ' || c === 'ِ' || c === SUKUN) return c
    if (/[ّٰٓ-ٟ]/.test(c)) continue
    return null
  }
  return null
}
function findLamAllah(ch, heavy) {
  const hits = []
  for (let i = 0; i < ch.length - 4; i++) {
    if (ch[i].c === 'ٱ' && ch[i + 1].c === 'ل' && ch[i + 2].c === 'ل' && ch[i + 3].c === 'ّ' && ch[i + 4].c === 'َ') {
      const v = i === 0 ? 'َ' : vowelBefore(ch, i)
      if (!v || v === SUKUN) continue
      const isHeavy = v === 'َ' || v === 'ُ'
      if (isHeavy === heavy) hits.push({ spans: [{ from: i + 2, to: withMarks(ch, i + 2), cls: heavy ? 'tafkheem' : 'tarqeeq' }] })
    }
  }
  return hits
}
function findRa(ch, heavy) {
  const hits = []
  for (let i = 0; i < ch.length; i++) {
    if (ch[i].c !== 'ر' || ch[i].k) continue
    let j = i + 1, v = null
    while (j < ch.length && isMark(ch[j].c)) { if ('َُِ'.includes(ch[j].c)) v = ch[j].c; j++ }
    if (!v) continue
    const isHeavy = v !== 'ِ'
    if (isHeavy === heavy) hits.push({ spans: [{ from: i, to: j, cls: heavy ? 'tafkheem' : 'tarqeeq' }] })
  }
  return hits
}

function findWaqf(sign) {
  return (ch) => {
    const hits = []
    for (let i = 0; i < ch.length; i++) if (ch[i].c === sign && i < ch.length - 1) hits.push({ spans: [{ from: i, to: i + 1, cls: 'waqf' }] })
    return hits
  }
}

/** madd runs by class, optionally filtered by what follows */
function findMadd(cls, kind) {
  return (ch) => {
    const hits = []
    for (let i = 0; i < ch.length; i++) {
      if (ch[i].k !== cls || (i > 0 && ch[i - 1].k === cls)) continue
      let e = i; while (e < ch.length && ch[e].k === cls) e++
      let j = e; while (j < ch.length && isMark(ch[j].c) && !ch[j].k) j++ // marks that belong to the madd letter (e.g. maddah)
      const HAMZA = /[ءأإؤئ]/
      let type
      if (HAMZA.test(ch[j]?.c ?? '')) type = 'muttasil'
      else if (ch[j]?.c === ' ' ) { const n = nextLetter(ch, j + 1); type = n > 0 && (HAMZA.test(ch[n].c) || ch[n].c === 'ٱ' ) ? 'munfasil' : 'other' }
      else if (j >= ch.length || (ch[j].c === ' ')) type = 'other'
      else type = 'other'
      if (cls === 'madda_permissible') {
        // madd 'arid lis-sukun: the madd letter is the last letter of the ayah's final word
        const rest = ch.slice(e).filter((x) => !isMark(x.c) && x.c !== ' ')
        const atEnd = rest.length <= 1
        if (atEnd) hits.push({ spans: [{ from: i, to: j, cls }] })
        continue
      }
      if (cls === 'madda_obligatory' && type !== kind) continue
      hits.push({ spans: [{ from: i, to: j, cls }] })
    }
    return hits
  }
}

const byClass = (cls) => (ch) => {
  const hits = []
  for (let i = 0; i < ch.length; i++) {
    if (ch[i].k !== cls || (i > 0 && ch[i - 1].k === cls)) continue
    let e = i; while (e < ch.length && ch[e].k === cls) e++
    while (e < ch.length && isMark(ch[e].c) && !ch[e].k && ch[e].c !== '\u200C') e++ // marks belong to the letter before them
    hits.push({ spans: [{ from: i, to: e, cls }] })
  }
  return hits
}

// ── rule definitions: slug → groups ───────────────────────────────────────────────────────────────────────────────
const G = (id, keep, find, n = 4) => ({ id, keep: new Set(keep), find, n })
const RULES = {
  izhar: [G('main', ['izhar'], findIzhar, 5)],
  'idgham-with-ghunnah': [G('main', ['idgham_ghunnah'], byClass('idgham_ghunnah'))],
  'idgham-without-ghunnah': [G('main', ['idgham_wo_ghunnah'], byClass('idgham_wo_ghunnah'))],
  iqlab: [G('main', ['iqlab'], byClass('iqlab'))],
  ikhfa: [G('main', ['ikhafa'], byClass('ikhafa'), 5)],
  'meem-sakinah': [G('ikhfa-shafawi', ['ikhafa_shafawi'], byClass('ikhafa_shafawi'), 3), G('idgham-shafawi', ['idgham_shafawi'], byClass('idgham_shafawi'), 3), G('izhar-shafawi', ['izhar_shafawi'], findIzharShafawi, 3)],
  qalqalah: [G('main', ['qalaqah'], byClass('qalaqah'), 5)],
  ghunnah: [G('main', ['ghunnah'], byClass('ghunnah'), 5)],
  'madd-natural': [G('main', ['madda_normal'], byClass('madda_normal'), 5)],
  'madd-muttasil': [G('main', ['madda_obligatory'], findMadd('madda_obligatory', 'muttasil'))],
  'madd-munfasil': [G('main', ['madda_obligatory'], findMadd('madda_obligatory', 'munfasil'))],
  'madd-lazim': [G('main', ['madda_necessary'], byClass('madda_necessary'))],
  'madd-arid': [G('main', ['madda_permissible'], findMadd('madda_permissible'))],
  'lam-shamsiyyah-qamariyyah': [G('shamsiyyah', ['laam_shamsiyah'], byClass('laam_shamsiyah'), 3), G('qamariyyah', ['qamariyyah'], findQamariyyah, 3)],
  'hamzatul-wasl': [G('main', ['ham_wasl'], byClass('ham_wasl'), 5)],
  'tafkheem-tarqeeq': [G('lam-heavy', ['tafkheem'], (c) => findLamAllah(c, true), 3), G('lam-light', ['tarqeeq'], (c) => findLamAllah(c, false), 3), G('ra-heavy', ['tafkheem'], (c) => findRa(c, true), 3), G('ra-light', ['tarqeeq'], (c) => findRa(c, false), 3)],
  'waqf-signs': Object.entries(WAQF).map(([sign, id]) => G(id, ['waqf'], findWaqf(sign), 3)),
}

// ── corpus check ──────────────────────────────────────────────────────────────────────────────────────────────────
const lettersOnly = (s) => s.replace(/[ؐ-ًؚ-ٰٟٲٳۖ-ۭ࣓-ࣿ‌‍ـ\s]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي')
const corpus = (s, a) => JSON.parse(fs.readFileSync(path.join(root, 'data', 'quran', 'surah', `${s}.json`), 'utf8'))[a - 1]?.ar ?? ''
const juzOf = (s, a) => JSON.parse(fs.readFileSync(path.join(root, 'data', 'quran', 'surah', `${s}.json`), 'utf8'))[a - 1]?.j ?? 0

const parsed = verses.map((v) => {
  const [s, a] = v.verse_key.split(':').map(Number)
  return { key: v.verse_key, s, a, ch: parse(v.text_uthmani_tajweed) }
})
let mismatches = 0
const verified = parsed.filter((p) => {
  const plain = p.ch.map((x) => x.c).join('')
  const ok = lettersOnly(plain) === lettersOnly(corpus(p.s, p.a))
  if (!ok) mismatches++
  return ok
})
console.log(`corpus match: ${verified.length}/${parsed.length} verses (${mismatches} differ in letters and are not used)`)

// ── pick examples ─────────────────────────────────────────────────────────────────────────────────────────────────
const result = {}
const used = new Set()
for (const [slug, groups] of Object.entries(RULES)) {
  result[slug] = { groups: [] }
  for (const g of groups) {
    const cands = []
    for (const p of verified) {
      const hits = g.find(p.ch)
      if (!hits.length) continue
      const letters = p.ch.filter((x) => !isMark(x.c) && x.c !== ' ').length
      // clear + short: few hits, short ayah, prefer the familiar short surahs of juz 30 and ayahs not already used
      const score = letters + (hits.length - 1) * 6 + (p.s >= 78 ? 0 : 10) + (used.has(p.key) ? 25 : 0) + (letters < 8 ? 12 : 0)
      cands.push({ p, hits, score })
    }
    cands.sort((x, y) => x.score - y.score)
    const picked = []
    const surahs = new Set(), letterTag = new Set()
    for (const c of cands) {
      if (picked.length >= g.n) break
      if (surahs.has(c.p.s)) continue
      const tag = c.hits[0].letter
      if (tag && letterTag.has(tag) && cands.length > 40 && picked.length < g.n - 1) continue // vary the following letter
      surahs.add(c.p.s); if (tag) letterTag.add(tag)
      const spans = c.hits.flatMap((h) => h.spans)
      const marked = focus(c.p.ch, g.keep, spans)
      const html = render(marked)
      const classes = [...new Set(marked.map((x) => x.k).filter(Boolean))]
      if (!classes.length || classes.some((k) => !ALLOWED.has(k))) continue
      picked.push({ ref: c.p.key, html, classes })
      used.add(c.p.key)
    }
    if (picked.length < 3) throw new Error(`rule ${slug}/${g.id}: only ${picked.length} examples`)
    result[slug].groups.push({ id: g.id, examples: picked })
  }
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify({ source: URL_API, note: 'Generated by scripts/build-tajweed-examples.mjs. Do not edit by hand.', rules: result }, null, 1) + '\n')
const count = Object.values(result).reduce((n, r) => n + r.groups.reduce((m, g) => m + g.examples.length, 0), 0)
console.log(`wrote ${path.relative(root, out)}: ${Object.keys(result).length} rules, ${count} examples`)
for (const [slug, r] of Object.entries(result)) console.log(' ', slug.padEnd(28), r.groups.map((g) => `${g.id}:${g.examples.map((e) => e.ref).join(',')}`).join(' | '))
