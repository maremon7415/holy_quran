#!/usr/bin/env node
/**
 * Builds lib/seo/wikidata-surahs.json: surah number → Wikidata item + Wikipedia articles (en, bn, ar).
 * Source: Wikidata SPARQL (items that are instances of "surah", Q234262).
 *
 * A mapping is kept only when it is VERIFIED by at least two independent signals that agree on the number:
 *   - the P1545 (series ordinal) qualifier on "instance of: surah"
 *   - the P1545 qualifier on "part of: Qur'an" (Q428)
 *   - "work available at URL" (P953) = https://quran.com/{n}
 *   - the Arabic title / label matching our corpus' Arabic surah name
 * and no other item claims the same number. Unverifiable surahs are skipped.
 *
 * Run: node scripts/build-wikidata-surahs.mjs   (needs internet)
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const OUT = path.join(ROOT, 'lib/seo/wikidata-surahs.json')
const chapters = JSON.parse(await fs.readFile(path.join(ROOT, 'data/quran/chapters.json'), 'utf8'))

const query = `
SELECT ?item ?label ?arLabel ?ordA ?ordB ?qurancom ?en ?bn ?ar ?title WHERE {
  ?item p:P31 ?st . ?st ps:P31 wd:Q234262 .
  OPTIONAL { ?st pq:P1545 ?ordA }
  OPTIONAL { ?item p:P361 ?pt . ?pt ps:P361 wd:Q428 . ?pt pq:P1545 ?ordB }
  OPTIONAL { ?item wdt:P953 ?qurancom FILTER(STRSTARTS(STR(?qurancom), "https://quran.com/")) }
  OPTIONAL { ?item wdt:P1476 ?title FILTER(lang(?title) = "ar") }
  OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = "en") }
  OPTIONAL { ?item rdfs:label ?arLabel FILTER(lang(?arLabel) = "ar") }
  OPTIONAL { ?en schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }
  OPTIONAL { ?bn schema:about ?item ; schema:isPartOf <https://bn.wikipedia.org/> }
  OPTIONAL { ?ar schema:about ?item ; schema:isPartOf <https://ar.wikipedia.org/> }
}`

const res = await fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query), {
  headers: { Accept: 'application/sparql-results+json', 'User-Agent': 'noor-quran-seo-build/1.0 (open-source Quran website)' },
})
if (!res.ok) throw new Error(`SPARQL ${res.status}`)
const rows = (await res.json()).results.bindings

const strip = (s) => (s || '').replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/^سورة\s+/, '').replace(/\s+/g, ' ').trim()
const items = new Map()
for (const r of rows) {
  const id = r.item.value.split('/').pop()
  const it = items.get(id) ?? { id, label: r.label?.value, signals: new Map(), en: null, bn: null, ar: null, arNames: new Set() }
  const add = (k, v) => { if (v && /^\d+$/.test(v)) it.signals.set(k, +v) }
  add('instanceOrdinal', r.ordA?.value)
  add('partOfOrdinal', r.ordB?.value)
  add('quranCom', r.qurancom?.value.match(/^https:\/\/quran\.com\/(\d+)$/)?.[1])
  if (r.en) it.en = r.en.value
  if (r.bn) it.bn = r.bn.value
  if (r.ar) it.ar = r.ar.value
  if (r.title) it.arNames.add(strip(r.title.value))
  if (r.arLabel) it.arNames.add(strip(r.arLabel.value))
  items.set(id, it)
}

const byNumber = new Map()
const skipped = []
for (const it of items.values()) {
  const nums = new Set(it.signals.values())
  if (nums.size !== 1) { skipped.push(`${it.id} ${it.label}: conflicting/missing ordinals ${[...it.signals].join(' ')}`); continue }
  const n = [...nums][0]
  if (n < 1 || n > 114) { skipped.push(`${it.id}: out of range ${n}`); continue }
  let signals = it.signals.size
  if ([...it.arNames].some((a) => a === strip(chapters[n - 1].nameArabic))) signals++
  if (signals < 2) { skipped.push(`${it.id} ${it.label}: only ${signals} signal for #${n}`); continue }
  if (byNumber.has(n)) { skipped.push(`#${n}: claimed by ${byNumber.get(n).wikidata} and ${it.id}`); byNumber.set(n, null); continue }
  byNumber.set(n, { wikidata: it.id, label: it.label ?? null, wikipedia: { en: it.en, bn: it.bn, ar: it.ar }, signals })
}

const out = {}
for (let n = 1; n <= 114; n++) {
  const v = byNumber.get(n)
  if (v) out[n] = { wikidata: v.wikidata, ...(v.wikipedia.en ? { en: v.wikipedia.en } : {}), ...(v.wikipedia.bn ? { bn: v.wikipedia.bn } : {}), ...(v.wikipedia.ar ? { ar: v.wikipedia.ar } : {}) }
  else skipped.push(`#${n} (${chapters[n - 1].nameSimple}): no verified item`)
}
await fs.writeFile(OUT, JSON.stringify({ source: 'https://query.wikidata.org/sparql (instance of Q234262 surah)', generated: new Date().toISOString().slice(0, 10), count: Object.keys(out).length, surahs: out }, null, 1) + '\n')
console.log(`wrote ${Object.keys(out).length}/114 verified surah mappings → ${path.relative(ROOT, OUT)}`)
if (skipped.length) console.log('skipped:\n  ' + skipped.join('\n  '))
