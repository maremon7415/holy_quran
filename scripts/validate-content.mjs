#!/usr/bin/env node
// Validates every Quran reference in data/content/* against data/quran and prints topic verses for manual review.
// Usage: node --experimental-strip-types scripts/validate-content.mjs [--print-topics] [--print-duas] [--print-names]
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const args = new Set(process.argv.slice(2))
const load = (f) => import(pathToFileURL(path.join(root, 'data/content', f)).href)
const { topics, topicCategories } = await load('topics.ts')
const { duas } = await load('duas.ts')
const { asmaUlHusna } = await load('asma-ul-husna.ts')

const surahs = {}
const getSurah = (n) => (surahs[n] ??= JSON.parse(fs.readFileSync(path.join(root, 'data/quran/surah', `${n}.json`), 'utf8')))
let errors = 0
const fail = (m) => { errors++; console.error('  ✗ ' + m) }

function expand(ref, ctx) {
  const m = String(ref).trim().match(/^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/)
  if (!m) { fail(`${ctx}: malformed ref "${ref}"`); return [] }
  const s = +m[1], a = +m[2], b = m[3] ? +m[3] : a
  if (s < 1 || s > 114) { fail(`${ctx}: surah out of range "${ref}"`); return [] }
  const vs = getSurah(s)
  if (a < 1 || b < a || b > vs.length) { fail(`${ctx}: ayah out of range "${ref}" (surah ${s} has ${vs.length})`); return [] }
  return vs.slice(a - 1, b)
}

const norm = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[ءؤئ]/g, '')

// ── topics
console.log(`\nTOPICS: ${topics.length}`)
const slugs = new Set()
for (const t of topics) {
  if (slugs.has(t.slug)) fail(`duplicate topic slug ${t.slug}`); slugs.add(t.slug)
  if (!topicCategories.find((c) => c.id === t.cat)) fail(`${t.slug}: bad category`)
  if (t.refs.length < 5 || t.refs.length > 10) fail(`${t.slug}: ${t.refs.length} refs (want 5-10)`)
  for (const r of t.related) if (!topics.find((x) => x.slug === r)) fail(`${t.slug}: unknown related topic ${r}`)
  for (const d of t.duas) if (!duas.find((x) => x.slug === d)) fail(`${t.slug}: unknown dua ${d}`)
  if (args.has('--print-topics')) console.log(`\n## ${t.slug} — ${t.en}`)
  for (const r of t.refs) {
    const vs = expand(r, t.slug)
    if (args.has('--print-topics')) for (const v of vs) console.log(`  [${v.k}] ${v.en.slice(0, 230)}`)
  }
}

// ── duas
console.log(`\nDUAS: ${duas.length}`)
const dslugs = new Set()
for (const d of duas) {
  if (dslugs.has(d.slug)) fail(`duplicate dua slug ${d.slug}`); dslugs.add(d.slug)
  if (!d.refs && !(d.ar && d.tl && d.meaning)) fail(`${d.slug}: hadith dua needs ar, tl and meaning`)
  if (!d.source) fail(`${d.slug}: missing source`)
  for (const r of d.related ?? []) if (!duas.find((x) => x.slug === r)) fail(`${d.slug}: unknown related ${r}`)
  for (const r of d.refs ?? []) {
    const vs = expand(r, d.slug)
    if (args.has('--print-duas')) for (const v of vs) console.log(`  [${d.slug}] ${v.k} ${v.en.slice(0, 200)}`)
  }
  if (d.ar && /[a-zA-Z]/.test(d.ar)) fail(`${d.slug}: latin letters inside Arabic text`)
}

// ── names
console.log(`\nNAMES: ${asmaUlHusna.length}`)
if (asmaUlHusna.length !== 99) fail(`expected 99 names, got ${asmaUlHusna.length}`)
const nslugs = new Set()
for (const n of asmaUlHusna) {
  if (nslugs.has(n.slug)) fail(`duplicate name slug ${n.slug}`); nslugs.add(n.slug)
  const vs = expand(n.ref, `name ${n.n} ${n.tl}`)
  const stem = norm(n.ar).replace(/^ال/, '').replace(/^ذو ال/, '').replace(/\s/g, '')
  const text = norm(vs.map((v) => v.sim).join(' '))
  const textNoSp = text.replace(/\s/g, '')
  const found = textNoSp.includes(stem.slice(0, Math.max(3, stem.length - 1)))
  if (!n.attr && !found) fail(`name ${n.n} ${n.tl}: "${stem}" not found in ${n.ref} (set attr:true if only the attribute appears)`)
  if (n.attr && args.has('--print-names')) console.log(`  attr ${n.n} ${n.tl} → ${n.ref}: ${vs[0]?.en.slice(0, 140)}`)
  if (args.has('--print-names') && !n.attr) console.log(`  ok   ${n.n} ${n.tl} → ${n.ref}`)
}

console.log(errors ? `\nFAILED with ${errors} error(s)` : '\nOK: all references valid')
process.exit(errors ? 1 : 0)
