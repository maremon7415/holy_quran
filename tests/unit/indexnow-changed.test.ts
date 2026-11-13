/**
 * Regression tests for IndexNow over-submission: every push to master submitted all ~78.7k sitemap URLs.
 * Now a push submits only the URLs affected by the changed files (scripts/indexnow.mjs --changed-from <sha>),
 * falling back to the core pages, never the whole set; HTTP 429 is not a failure.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { hadithIndexChanges, MAX_CHANGED, selectorsForChanges, selectUrls, submissionOutcome } from '@/scripts/indexnow.mjs'

const S = 'https://noor.test'
const ALL = [
  '/', '/quran', '/topics', '/topics/patience', '/dua', '/dua/dua-for-anxiety', '/names-of-allah', '/names-of-allah/ar-rahman',
  '/surah/al-fatihah', '/surah/al-fatihah/1', '/surah/al-baqarah', '/surah/al-baqarah/255', '/juz/1',
  '/hadith', '/hadith/bukhari', '/hadith/bukhari/book/1', '/hadith/bukhari/1', '/hadith/bukhari/2', '/hadith/malik/469',
  '/learn', '/learn/salah', '/learn/tajweed/izhar', '/events', '/events/eid-al-adha', '/events/eid-al-adha/2027',
  '/prayer-times/dhaka', '/ramadan/2027/dhaka', '/hijri-date', '/zakat-calculator', '/ask',
].flatMap((p) => [`${S}${p}`, `${S}/bn${p === '/' ? '' : p}`])
const CORE = ['/', '/quran', '/topics', '/topics/patience', '/dua', '/dua/dua-for-anxiety', '/names-of-allah', '/names-of-allah/ar-rahman', '/surah/al-fatihah', '/surah/al-baqarah', '/juz/1', '/learn', '/learn/salah', '/ask'].map((p) => `${S}${p}`)
const opts = { surahSlug: (n: number) => (n === 2 ? 'al-baqarah' : n === 1 ? 'al-fatihah' : undefined) }
const pick = (files: string[], o: object = opts) => selectUrls(ALL, selectorsForChanges(files, o), CORE).map((u: string) => u.slice(S.length))

describe('selectorsForChanges: changed files → URL sets', () => {
  it('content files map to their sections (both language twins)', () => {
    expect(pick(['data/content/topics.ts'])).toEqual(['/topics', '/bn/topics', '/topics/patience', '/bn/topics/patience'])
    expect(pick(['data/content/duas.ts'])).toEqual(['/dua', '/bn/dua', '/dua/dua-for-anxiety', '/bn/dua/dua-for-anxiety'])
    expect(pick(['data/content/asma-ul-husna.ts']).every((p: string) => /names-of-allah/.test(p))).toBe(true)
    expect(new Set(pick(['data/content/ar.ts']).map((p: string) => p.split('/').filter((x) => x !== 'bn')[1]))).toEqual(new Set(['topics', 'dua', 'names-of-allah']))
  })
  it('learn, events, places, quran data', () => {
    expect(pick(['data/learn/salah.ts']).every((p: string) => /^(\/bn)?\/learn(\/|$)/.test(p))).toBe(true)
    expect(pick(['data/learn/salah.ts'])).toHaveLength(6)
    expect(pick(['lib/events/content.ts'])).toHaveLength(6)
    expect(pick(['data/places/cities.json']).sort()).toEqual(['/prayer-times/dhaka', '/ramadan/2027/dhaka', '/hijri-date', '/zakat-calculator'].flatMap((p) => [p, `/bn${p}`]).sort())
    expect(pick(['data/quran/surah/2.json'])).toEqual(['/surah/al-baqarah', '/bn/surah/al-baqarah', '/surah/al-baqarah/255', '/bn/surah/al-baqarah/255'])
  })
  it('app routes map to their section; /bn twins and non-page routes too', () => {
    expect(pick(['app/learn/salah/page.tsx'])).toEqual(pick(['data/learn/salah.ts']))
    expect(pick(['app/bn/events/[event]/page.tsx'])).toEqual(pick(['lib/events/calendar.ts']))
    expect(pick(['app/api/v1/ayah/[ref]/route.ts', 'app/md/[...path]/route.ts'])).toEqual([])
  })
  it('other site code → core pages only (never every URL)', () => {
    const core = pick(['components/ui-icon.tsx'])
    expect(core).toEqual(ALL.map((u) => u.slice(S.length)).filter((p) => CORE.some((c) => c.slice(S.length) === p.replace(/^\/bn(?=\/|$)/, '') || (p === '/bn' && c === `${S}/`))))
    expect(core).toContain('/bn')
    expect(core).not.toContain('/hadith/bukhari/1')
    expect(core.length).toBeLessThan(ALL.length)
    expect(pick(['app/layout.tsx'])).toEqual(core)
    expect(pick(['package.json'])).toEqual(core)
  })
  it('tests, docs, CI and scripts change no URL', () => {
    expect(pick(['tests/unit/x.test.ts', 'docs/ARCHITECTURE.md', '.github/workflows/ci.yml', 'scripts/indexnow.mjs', 'README.md'])).toEqual([])
  })
  it('hadith data: only the numbers / books whose index entry changed, plus the hubs', () => {
    const files = ['data/hadith/index.json']
    const changed = pick(files, { ...opts, hadithPaths: () => ['/hadith', '/hadith/malik', '/hadith/malik/470'] })
    expect(changed).toEqual(expect.arrayContaining(['/hadith', '/bn/hadith', '/hadith/malik/470', '/bn/hadith/malik/470']))
    expect(changed).not.toContain('/hadith/bukhari/1')
    // index diff unavailable → hubs only
    expect(pick(files, { ...opts, hadithPaths: () => null })).toEqual(['/hadith', '/bn/hadith', '/hadith/bukhari', '/bn/hadith/bukhari'])
  })
  it('caps a huge change set at MAX_CHANGED, keeping hubs first', () => {
    const many = Array.from({ length: MAX_CHANGED + 500 }, (_, i) => `${S}/hadith/bukhari/${i + 1}`)
    const all = [`${S}/hadith/bukhari/book/1`, ...many, `${S}/hadith`]
    const out = selectUrls(all, selectorsForChanges(['app/hadith/[collection]/[number]/page.tsx']), [])
    expect(out).toHaveLength(MAX_CHANGED)
    expect(out).toContain(`${S}/hadith`)
  })
})

describe('hadithIndexChanges', () => {
  it('diffs dead numbers, ranges and book rows per collection', () => {
    const a = { collections: { malik: { first: 1, last: 10, dead: [3], books: [[1, 'A', 1, 10, 10]] }, bukhari: { first: 1, last: 5, dead: [], books: [[1, 'R', 1, 5, 5]] } } }
    const b = { collections: { malik: { first: 1, last: 11, dead: [3, 7], books: [[1, 'A', 1, 11, 11]] }, bukhari: { first: 1, last: 5, dead: [], books: [[1, 'R', 1, 5, 5]] } } }
    expect(hadithIndexChanges(a, b).sort()).toEqual(['/hadith', '/hadith/malik', '/hadith/malik/11', '/hadith/malik/7', '/hadith/malik/book/1'].sort())
    expect(hadithIndexChanges(a, a)).toEqual([])
  })
})

describe('IndexNow responses', () => {
  it('200/202 accepted, 429 throttled (not a failure), other errors fail', () => {
    expect(submissionOutcome(200)).toBe('accepted')
    expect(submissionOutcome(202)).toMatch(/^accepted/)
    expect(submissionOutcome(429)).toBe('throttled')
    expect(submissionOutcome(403)).toBe('error')
    expect(submissionOutcome(500)).toBe('error')
  })
})

describe('workflow', () => {
  const yml = fs.readFileSync(path.join(__dirname, '../../.github/workflows/indexnow.yml'), 'utf8')
  it('push submits only changed URLs; a full submission needs the manual `full` input', () => {
    expect(yml).toMatch(/--changed-from "\$BEFORE"/)
    expect(yml).toMatch(/FULL" = "true" \]; then set -- --all/)
    expect(yml).toMatch(/fetch-depth: 0/)
    expect(yml).not.toMatch(/deployment_status/)
  })
})
