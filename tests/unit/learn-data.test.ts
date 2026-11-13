import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import examples from '@/data/learn/tajweed-examples.json'
import { tajweedGroups, tajweedRules } from '@/data/learn/tajweed'
import { kalimas } from '@/data/learn/kalima'
import { wuduBreakers, wuduSteps } from '@/data/learn/wudu'
import { beginnerSurahs, prayerRows, recitations, salahMistakes, salahSteps, recitationById } from '@/data/learn/salah'
import { arabicLetters, letterForms, makhrajGroups } from '@/data/learn/alphabet'
import words from '@/data/learn/alphabet-words.json'
import { hubMeta, learnGuides, learnPaths } from '@/data/learn/guides'
import { learnHadith, learnHadithById } from '@/data/learn/hadith-sources'
import { duaBySlug } from '@/data/content/duas'
import { ALLOWED_TAJWEED_CLASSES, sanitizeTajweed, tajweedClassLabels, tajweedColors, tajweedText } from '@/lib/learn/tajweed'
import { hasBnTwin, localeHref } from '@/lib/i18n/routes'
import { learnMd, resolveLearnTopic } from '@/lib/learn/markdown'

const root = path.resolve(__dirname, '../..')
const surah = (n: number): { n: number; ar: string; sim: string }[] => JSON.parse(fs.readFileSync(path.join(root, `data/quran/surah/${n}.json`), 'utf8'))
const chapters: { id: number; versesCount: number }[] = JSON.parse(fs.readFileSync(path.join(root, 'data/quran/chapters.json'), 'utf8'))
const lettersOnly = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟٲٳۖ-ۭ࣓-ࣿ‌‍ـ\s]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي')
const bnRe = /[ঀ-৿]/
const arRe = /[؀-ۿ]/

/** every { en, bn } pair found anywhere in a value */
function pairs(v: unknown, trail = '$'): { at: string; en: string; bn: string }[] {
  if (!v || typeof v !== 'object') return []
  const o = v as Record<string, unknown>
  if (typeof o.en === 'string' && 'bn' in o) return [{ at: trail, en: o.en, bn: String(o.bn ?? '') }]
  return Object.entries(o).flatMap(([k, x]) => pairs(x, `${trail}.${k}`))
}

function refOk(ref: string) {
  const m = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) return false
  const [s, a, b] = [+m[1], +m[2], m[3] ? +m[3] : +m[2]]
  const c = chapters[s - 1]
  return !!c && a >= 1 && b >= a && b <= c.versesCount
}

describe('tajweed examples (data/learn/tajweed-examples.json)', () => {
  const rules = (examples as { rules: Record<string, { groups: { id: string; examples: { ref: string; html: string; classes: string[] }[] }[] }> }).rules

  it('has examples for every rule page, and every rule with several groups has all of them', () => {
    expect(tajweedRules.length).toBeGreaterThanOrEqual(15)
    for (const r of tajweedRules) {
      const g = rules[r.slug]?.groups
      expect(g, r.slug).toBeTruthy()
      const n = g.reduce((m, x) => m + x.examples.length, 0)
      expect(n, r.slug).toBeGreaterThanOrEqual(3)
      for (const grp of g) {
        expect(grp.examples.length, `${r.slug}/${grp.id}`).toBeGreaterThanOrEqual(3)
        expect(grp.examples.length, `${r.slug}/${grp.id}`).toBeLessThanOrEqual(5)
      }
      if (g.length > 1) expect(g.map((x) => x.id).sort(), r.slug).toEqual(Object.keys(r.groups ?? {}).sort())
    }
    expect(Object.keys(rules).sort()).toEqual(tajweedRules.map((r) => r.slug).sort())
  })

  it('every example ref is a valid ayah and its text matches the Quran corpus (letters only)', () => {
    let count = 0
    for (const [slug, r] of Object.entries(rules)) for (const g of r.groups) for (const ex of g.examples) {
      count++
      expect(refOk(ex.ref), `${slug} ${ex.ref}`).toBe(true)
      const [s, a] = ex.ref.split(':').map(Number)
      expect(lettersOnly(tajweedText(ex.html)), `${slug} ${ex.ref}`).toBe(lettersOnly(surah(s)[a - 1].ar))
    }
    expect(count).toBeGreaterThanOrEqual(90)
  })

  it('every example contains the tajweed classes it declares, only allowed classes, and is already sanitised', () => {
    for (const [slug, r] of Object.entries(rules)) for (const g of r.groups) for (const ex of g.examples) {
      const found = [...ex.html.matchAll(/<tajweed class="([a-z_]+)">/g)].map((m) => m[1])
      expect(found.length, `${slug} ${ex.ref}`).toBeGreaterThan(0)
      expect([...new Set(found)].sort(), `${slug} ${ex.ref}`).toEqual([...ex.classes].sort())
      for (const k of found) {
        expect(ALLOWED_TAJWEED_CLASSES as readonly string[], k).toContain(k)
        expect(tajweedColors[k], k).toBeTruthy()
        expect(tajweedClassLabels[k], k).toBeTruthy()
      }
      expect(sanitizeTajweed(ex.html), `${slug} ${ex.ref}`).toBe(ex.html)
      expect(ex.html).not.toMatch(/<(?!\/?tajweed)/)
    }
  })

  it('the rule page’s own class is among its examples (so the colour on the page matches the legend)', () => {
    for (const r of tajweedRules) {
      const used = new Set(rules[r.slug].groups.flatMap((g) => g.examples.flatMap((e) => e.classes)))
      expect(used.has(r.cls) || (r.slug === 'meem-sakinah' && used.has('ikhafa_shafawi')) || (r.slug === 'tafkheem-tarqeeq' && used.has('tafkheem')), r.slug).toBe(true)
    }
  })

  it('sanitizeTajweed strips scripts, attributes and unknown classes', () => {
    const dirty = '<script>alert(1)</script><tajweed class="ghunnah" onclick="x()">م</tajweed><tajweed class="evil">ب</tajweed><img src=x onerror=y>'
    const clean = sanitizeTajweed(dirty)
    expect(clean.replace(/<\/?tajweed[^>]*>/g, '')).not.toContain('<')
    expect(clean).not.toMatch(/class="evil"/)
    expect(clean).toContain('&lt;script&gt;')
    expect((clean.match(/<tajweed/g) ?? []).length).toBe((clean.match(/<\/tajweed>/g) ?? []).length)
    expect(sanitizeTajweed('<tajweed class="ghunnah">نّ</tajweed>')).toBe('<tajweed class="ghunnah">نّ</tajweed>')
  })
})

describe('tajweed rule content', () => {
  it('slugs are unique, groups exist, definitions are in en and bn, related rules exist', () => {
    const slugs = tajweedRules.map((r) => r.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const r of tajweedRules) {
      expect(tajweedGroups[r.group], r.slug).toBeTruthy()
      expect(r.ar, r.slug).toMatch(arRe)
      expect(r.how.length, r.slug).toBeGreaterThanOrEqual(2)
      expect(r.mistakes.length, r.slug).toBeGreaterThanOrEqual(2)
      expect(r.faqs.length, r.slug).toBeGreaterThanOrEqual(2)
      for (const rel of r.related) expect(slugs, `${r.slug} → ${rel}`).toContain(rel)
      if (r.letters) expect(r.letters.ar.length).toBeGreaterThan(0)
    }
  })
  it('every en/bn pair is complete (Bangla text written in Bangla script)', () => {
    const bad = pairs(tajweedRules).concat(pairs(tajweedGroups)).filter((p) => !p.en.trim() || !p.bn.trim() || !bnRe.test(p.bn))
    expect(bad.map((b) => b.at)).toEqual([])
  })
  it('covers the rule families users search for', () => {
    const slugs = tajweedRules.map((r) => r.slug)
    for (const s of ['izhar', 'idgham-with-ghunnah', 'idgham-without-ghunnah', 'iqlab', 'ikhfa', 'meem-sakinah', 'qalqalah', 'ghunnah', 'madd-natural', 'madd-muttasil', 'madd-munfasil', 'madd-lazim', 'lam-shamsiyyah-qamariyyah', 'hamzatul-wasl', 'tafkheem-tarqeeq', 'waqf-signs']) expect(slugs).toContain(s)
  })
})

describe('six kalimas', () => {
  it('has the six kalimas in order, complete in Arabic, Bangla uccharon, transliteration and en/bn meaning', () => {
    expect(kalimas.map((k) => k.slug)).toEqual(['tayyibah', 'shahadah', 'tamjeed', 'tawheed', 'astaghfar', 'radd-e-kufr'])
    for (const k of kalimas) {
      expect(k.ar, k.slug).toMatch(arRe)
      expect(k.bn, k.slug).toMatch(bnRe)
      expect(k.bn, k.slug).not.toMatch(/[A-Za-z]/)
      expect(k.tl, k.slug).toMatch(/[A-Za-z]/)
      expect(k.name.bn, k.slug).toMatch(bnRe)
    }
    expect(pairs(kalimas).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
  })
  it('sources: hadith ids, dua slugs and Quran refs all resolve; unverifiable forms are labelled commonly taught', () => {
    for (const k of kalimas) {
      for (const id of k.hadith ?? []) expect(learnHadithById(id), `${k.slug} ${id}`).toBeTruthy()
      for (const d of k.dua ?? []) expect(duaBySlug(d), `${k.slug} ${d}`).toBeTruthy()
      for (const r of k.quran ?? []) expect(refOk(r), `${k.slug} ${r}`).toBe(true)
      if (!k.hadith?.length && !k.quran?.length) expect(k.commonlyTaught, k.slug).toBe(true)
    }
    expect(kalimas.find((k) => k.slug === 'radd-e-kufr')!.commonlyTaught).toBe(true)
  })
})

describe('wudu', () => {
  it('has 10 steps with unique ids, exactly four fard acts (Quran 5:6) and bilingual text', () => {
    expect(wuduSteps).toHaveLength(10)
    expect(new Set(wuduSteps.map((s) => s.id)).size).toBe(10)
    expect(wuduSteps.filter((s) => s.kind === 'fard').map((s) => s.id)).toEqual(['face', 'arms', 'head', 'feet'])
    expect(pairs(wuduSteps).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
    expect(pairs(wuduBreakers).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
    expect(wuduBreakers.some((b) => b.agreed) && wuduBreakers.some((b) => !b.agreed)).toBe(true)
  })
})

describe('salah', () => {
  it('prayer table: 2/4/4/3/4 fard rak‘ahs = 17, Witr 3 after Isha, 12 emphasised sunnah', () => {
    expect(prayerRows.map((r) => r.fard.n)).toEqual([2, 4, 4, 3, 4])
    expect(prayerRows.reduce((n, r) => n + r.fard.n, 0)).toBe(17)
    expect(prayerRows.find((r) => r.id === 'isha')!.witr).toEqual({ n: 3, kind: 'wajib' })
    const emphasised = prayerRows.flatMap((r) => [r.before, r.after]).filter((c) => c?.kind === 'sunnah').reduce((n, c) => n + c!.n, 0)
    expect(emphasised).toBe(12)
  })
  it('every recitation is complete in Arabic, Bangla uccharon, transliteration and en/bn meaning', () => {
    for (const r of recitations) {
      expect(r.ar, r.id).toMatch(arRe)
      expect(r.bn, r.id).toMatch(bnRe)
      expect(r.bn, r.id).not.toMatch(/[A-Za-z]/)
      expect(r.tl, r.id).toMatch(/[A-Za-z]/)
    }
    expect(pairs(recitations).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
    expect(pairs(salahSteps).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
    expect(pairs(salahMistakes).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
    expect(pairs(prayerRows).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
  })
  it('steps cover niyyah → salam; every referenced recitation, hadith, dua and Quran ref exists', () => {
    const ids = salahSteps.map((s) => s.id)
    for (const id of ['niyyah', 'takbir', 'qiyam', 'ruku', 'qawmah', 'sujood', 'jalsa', 'tashahhud', 'durood', 'salam']) expect(ids, id).toContain(id)
    for (const s of salahSteps) {
      for (const id of s.recite ?? []) expect(recitationById(id), `${s.id} ${id}`).toBeTruthy()
      for (const d of s.dua ?? []) expect(duaBySlug(d), `${s.id} ${d}`).toBeTruthy()
      for (const q of s.quran ?? []) expect(refOk(q), `${s.id} ${q}`).toBe(true)
    }
    for (const r of recitations) {
      for (const h of r.hadith ?? []) expect(learnHadithById(h), `${r.id} ${h}`).toBeTruthy()
      if (r.dua) expect(duaBySlug(r.dua), `${r.id} ${r.dua}`).toBeTruthy()
    }
    expect(salahSteps.find((s) => s.id === 'qiyam')!.quran).toContain('1:1-7')
  })
  it('links the verified duas of salah and wudu', () => {
    const duas = salahSteps.flatMap((s) => s.dua ?? []).concat(recitations.map((r) => r.dua ?? ''))
    for (const slug of ['dua-durood-ibrahimiyya', 'dua-before-salam-refuge', 'dua-qunut', 'dua-after-salah-allahumma-antas-salam']) expect(duas, slug).toContain(slug)
    expect(wuduSteps.find((s) => s.id === 'dua')).toBeTruthy()
    expect(duaBySlug('dua-after-wudu')).toBeTruthy()
  })
  it('beginner surahs are Juz Amma surahs that exist', () => {
    for (const id of beginnerSurahs) expect(id >= 78 && id <= 114 && chapters[id - 1]).toBeTruthy()
  })
})

describe('Arabic alphabet', () => {
  it('has the 28 letters with unique ids and glyphs, names in en/bn/ar and a makhraj in each language', () => {
    expect(arabicLetters).toHaveLength(28)
    expect(new Set(arabicLetters.map((l) => l.id)).size).toBe(28)
    expect(new Set(arabicLetters.map((l) => l.ar)).size).toBe(28)
    for (const l of arabicLetters) {
      expect(l.name.ar, l.id).toMatch(arRe)
      expect(l.name.bn, l.id).toMatch(bnRe)
      expect(makhrajGroups[l.group], l.id).toBeTruthy()
    }
    expect(pairs(arabicLetters).filter((p) => !p.en.trim() || !bnRe.test(p.bn))).toEqual([])
  })
  it('forms: non-joining letters (ا د ذ ر ز و) keep their shape, the rest join with zero-width joiners', () => {
    expect(arabicLetters.filter((l) => l.rightJoinOnly).map((l) => l.ar).join('')).toBe('ادذرزو')
    const ba = letterForms(arabicLetters[1])
    expect(ba.initial).toBe('ب‍')
    expect(ba.medial).toBe('‍ب‍')
    expect(ba.final).toBe('‍ب')
  })
  it('every letter has a real Quran word from the corpus that starts with it', () => {
    const w = words as Record<string, { word: string; ref: string }>
    for (const l of arabicLetters) {
      const e = w[l.id]
      expect(e, l.id).toBeTruthy()
      expect(refOk(e.ref), `${l.id} ${e?.ref}`).toBe(true)
      const [s, a] = e.ref.split(':').map(Number)
      const v = surah(s)[a - 1]
      expect(v.ar.replace(/[ۖ-ۜ‌]/g, '')).toContain(e.word)
      expect(lettersOnly(e.word).charAt(0)).toBe(lettersOnly(l.ar))
    }
  })
})

describe('learn hadith citations and guides', () => {
  it('hadith sources are unique and every id used by the data exists', () => {
    expect(new Set(learnHadith.map((h) => h.id)).size).toBe(learnHadith.length)
    for (const h of learnHadith) { expect(h.ref.endsWith(String(h.number)), h.id).toBe(true); expect(h.must.length, h.id).toBeGreaterThan(0) }
    const used = [...kalimas.flatMap((k) => k.hadith ?? []), ...recitations.flatMap((r) => r.hadith ?? []), 'bukhari-135', 'bukhari-159', 'bukhari-631', 'bukhari-757', 'bukhari-756', 'bukhari-735', 'muslim-728', 'tirmidhi-415']
    for (const id of used) expect(learnHadithById(id), id).toBeTruthy()
    // the notes cite the same references (guards against drift between a note's text and the registry)
    expect(salahSteps.find((s) => s.id === 'takbir')!.note!.en).toContain(learnHadithById('bukhari-735')!.ref)
    expect(salahSteps.find((s) => s.id === 'qiyam')!.note!.en).toContain(learnHadithById('bukhari-756')!.ref)
  })
  it('guides: SEO metadata in en and bn, every path has a Bangla twin and a markdown alternate', async () => {
    expect(learnGuides.map((g) => g.slug).sort()).toEqual(['arabic-alphabet', 'kalima', 'salah', 'tajweed', 'wudu'])
    const paths = learnPaths()
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toHaveLength(1 + 5 + tajweedRules.length)
    for (const g of learnGuides) {
      expect(g.meta.bn.title).toMatch(bnRe)
      expect(g.meta.en.title.length).toBeGreaterThan(30)
      expect(g.meta.en.description.length).toBeLessThan(330)
      expect(g.meta.bn.keywords.length).toBeGreaterThan(3)
    }
    expect(hubMeta.bn.title).toMatch(bnRe)
    // target searches appear in titles/keywords
    const all = JSON.stringify([learnGuides.map((g) => g.meta), hubMeta])
    for (const q of ['tajweed rules', 'তাজবীদ শিক্ষা', '৬ কালেমা বাংলা উচ্চারণ সহ', 'six kalimas', 'নামাজ শিক্ষা', 'how to pray salah step by step', 'অজু করার নিয়ম', 'how to perform wudu', 'আরবি বর্ণমালা', 'Arabic alphabet for Quran'.toLowerCase()]) expect(all.toLowerCase(), q).toContain(q.toLowerCase())
    for (const p of paths) {
      expect(hasBnTwin(p), p).toBe(true)
      expect(localeHref('bn', p), p).toBe(`/bn${p}`)
      const [, , a, b] = p.split('/')
      for (const loc of ['en', 'bn'] as const) {
        const doc = await learnMd(a, b, loc)
        expect(doc, `${loc} ${p}`).toBeTruthy()
        expect(doc!.canonical).toContain(loc === 'bn' ? `/bn${p}` : p)
        expect(doc!.body).toMatch(/^# /)
        expect(doc!.body).toContain('Canonical:')
      }
    }
  })
  it('markdown carries Quran text from the corpus and Bangla pronunciation', async () => {
    const kalima = await learnMd('kalima', undefined, 'bn')
    expect(kalima!.body).toMatch(/[؀-ۿ]{3,}/)
    expect(kalima!.body).toMatch(/লা ইলাহা ইল্লাল্লাহু/)
    const rule = await learnMd('tajweed', 'ikhfa', 'en')
    expect(rule!.body).toMatch(/\/surah\/[a-z-]+\/\d+/)
    const salah = await learnMd('salah', undefined, 'en')
    expect(salah!.body).toContain('| Fajr |')
    expect(salah!.body).toMatch(/Hanafi/)
  })
  it('resolveLearnTopic understands free text', () => {
    expect(resolveLearnTopic('how to pray salah')).toBe('/learn/salah')
    expect(resolveLearnTopic('six kalimas')).toBe('/learn/kalima')
    expect(resolveLearnTopic('নামাজ শিক্ষা')).toBe('/learn/salah')
    expect(resolveLearnTopic('tajweed/izhar')).toBe('/learn/tajweed/izhar')
    expect(resolveLearnTopic('qalqalah')).toBe('/learn/tajweed/qalqalah')
    expect(resolveLearnTopic('arabic alphabet')).toBe('/learn/arabic-alphabet')
    expect(resolveLearnTopic('how to perform wudu')).toBe('/learn/wudu')
    expect(resolveLearnTopic('learn')).toBe('/learn')
    expect(resolveLearnTopic('zzzz nothing')).toBeNull()
  })
})
