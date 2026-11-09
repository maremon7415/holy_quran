// Downloads the Quran corpus from the open Quran.com (Quran Foundation) API v4
// and writes compact JSON files to /data/quran. Run: node scripts/fetch-quran-data.mjs
import fs from 'node:fs/promises'
import path from 'node:path'

const API = 'https://api.quran.com/api/v4'
const OUT = path.join(process.cwd(), 'data', 'quran')
const TR = { en: 20, bn: 161, translit: 57, enHaleem: 85 }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      return await res.json()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(1000 * 2 ** i)
    }
  }
}

const clean = (html = '') =>
  html
    .replace(/<sup[^>]*>.*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  const [en, bn] = await Promise.all([get(`${API}/chapters?language=en`), get(`${API}/chapters?language=bn`)])
  const chapters = []
  for (const c of en.chapters) {
    const b = bn.chapters.find((x) => x.id === c.id)
    const [infoEn, infoBn] = await Promise.all([
      get(`${API}/chapters/${c.id}/info?language=en`).catch(() => null),
      get(`${API}/chapters/${c.id}/info?language=bn`).catch(() => null),
    ])
    chapters.push({
      id: c.id,
      slug: slugify(c.name_simple),
      nameSimple: c.name_simple,
      nameComplex: c.name_complex,
      nameArabic: c.name_arabic,
      nameBn: b?.translated_name?.language_name === 'bengali' ? b.translated_name.name : null,
      meaning: c.translated_name.name,
      revelationPlace: c.revelation_place,
      revelationOrder: c.revelation_order,
      bismillahPre: c.bismillah_pre,
      versesCount: c.verses_count,
      pages: c.pages,
      summaryEn: infoEn?.chapter_info?.short_text ?? null,
      infoEn: infoEn?.chapter_info?.text ?? null,
      summaryBn: infoBn?.chapter_info?.language_name === 'bengali' ? infoBn.chapter_info.short_text : null,
      infoBn: infoBn?.chapter_info?.language_name === 'bengali' ? infoBn.chapter_info.text : null,
    })
    process.stdout.write(`info ${c.id}\r`)
  }

  const meta = chapters.map(({ infoEn, infoBn, ...rest }) => rest)
  await fs.writeFile(path.join(OUT, 'chapters.json'), JSON.stringify(meta))
  await fs.mkdir(path.join(OUT, 'info'), { recursive: true })
  for (const c of chapters) {
    await fs.writeFile(path.join(OUT, 'info', `${c.id}.json`), JSON.stringify({ en: c.infoEn, bn: c.infoBn }))
  }

  await fs.mkdir(path.join(OUT, 'surah'), { recursive: true })
  for (const c of chapters) {
    const url = `${API}/verses/by_chapter/${c.id}?per_page=300&fields=text_uthmani,text_imlaei_simple&translations=${Object.values(TR).join(',')}`
    const data = await get(url)
    const verses = data.verses.map((v) => {
      const t = (id) => clean(v.translations.find((x) => x.resource_id === id)?.text)
      return {
        n: v.verse_number,
        k: v.verse_key,
        ar: v.text_uthmani,
        sim: v.text_imlaei_simple,
        en: t(TR.en),
        enH: t(TR.enHaleem),
        bn: t(TR.bn),
        tl: t(TR.translit),
        j: v.juz_number,
        p: v.page_number,
        h: v.hizb_number,
        r: v.ruku_number,
        s: v.sajdah_number ? 1 : 0,
      }
    })
    if (verses.length !== c.versesCount) throw new Error(`surah ${c.id}: got ${verses.length}/${c.versesCount}`)
    await fs.writeFile(path.join(OUT, 'surah', `${c.id}.json`), JSON.stringify(verses))
    process.stdout.write(`surah ${c.id}   \r`)
  }

  const juzs = await get(`${API}/juzs`)
  const seen = new Map()
  for (const j of juzs.juzs) if (!seen.has(j.juz_number)) seen.set(j.juz_number, { juz: j.juz_number, map: j.verse_mapping, first: j.first_verse_id, last: j.last_verse_id, count: j.verses_count })
  await fs.writeFile(path.join(OUT, 'juzs.json'), JSON.stringify([...seen.values()].sort((a, b) => a.juz - b.juz)))
  console.log('\ndone')
}
main().catch((e) => { console.error(e); process.exit(1) })
