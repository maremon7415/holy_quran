import { describe, it, expect } from 'vitest'
import { subLetter, parseHadithNumber, urlNumberOf } from '@/lib/hadith/numbering'
import { parseHadithSource } from '@/lib/hadith/source'
import { bookUrl, collectionUrl, hadithUrl, searchUrl } from '@/lib/hadith/url'
import { hasBnTwin, localeHref } from '@/lib/i18n/routes'
import { cleanEnglish, deriveTitle, extractNarrator, clipText } from '@/lib/hadith/text'
import { gradeCategory, normalizeGrades } from '@/lib/hadith/grades'
import { collectionMeta, resolveCollectionSlug, COLLECTIONS } from '@/lib/hadith/collections'
import { hadithOfTheDay, dayPool, featured } from '@/lib/hadith/featured'
import { asciiDigits, detectLang, highlightParts, parseHadithReference, parseQuery, tokenRegex } from '@/lib/hadith/search-utils'
import { duas } from '@/data/content/duas'

describe('numbering (URL number = commonly cited number)', () => {
  it('Muslim uses the Abd al-Baqi number (arabicnumber), not the running hadithnumber', () => {
    expect(urlNumberOf('muslim', { hadithnumber: 6543, arabicnumber: '2564.03' })).toBe(2564)
    expect(urlNumberOf('muslim', { hadithnumber: 93, arabicnumber: '8.01' })).toBe(8)
    expect(urlNumberOf('muslim', { hadithnumber: 534, arabicnumber: 223 })).toBe(223)
  })
  it('Muslim introduction entries have no number', () => {
    expect(urlNumberOf('muslim', { hadithnumber: 1 })).toBeNull()
    expect(urlNumberOf('muslim', { hadithnumber: 1, arabicnumber: null })).toBeNull()
    expect(urlNumberOf('muslim', { hadithnumber: 7512, arabicnumber: undefined })).toBeNull()
  })
  it('other collections use the integer part of hadithnumber (Bukhari 402.2 belongs to 402)', () => {
    expect(urlNumberOf('bukhari', { hadithnumber: 1 })).toBe(1)
    expect(urlNumberOf('bukhari', { hadithnumber: 402.2 })).toBe(402)
    expect(urlNumberOf('tirmidhi', { hadithnumber: 391.2 })).toBe(391)
    expect(urlNumberOf('nawawi40', { hadithnumber: 42 })).toBe(42)
  })
  it('sub-letters', () => {
    expect([0, 1, 2, 25, 26].map(subLetter)).toEqual(['a', 'b', 'c', 'z', 'aa'])
  })
  it('parseHadithNumber is strict', () => {
    expect(parseHadithNumber('1')).toBe(1)
    expect(parseHadithNumber('7563')).toBe(7563)
    for (const bad of ['0', '012', '1.5', '1e3', '-1', '', 'abc', '1234567', undefined, null]) expect(parseHadithNumber(bad as string)).toBeNull()
  })
})

describe('source string parsing', () => {
  it('splits citations and links hadith ones', () => {
    const p = parseHadithSource('Sahih al-Bukhari 6306; Sahih Muslim 595; Quran 2:255')
    expect(p).toEqual([
      { text: 'Sahih al-Bukhari 6306', hadith: { collection: 'bukhari', number: 6306 } },
      { text: 'Sahih Muslim 595', hadith: { collection: 'muslim', number: 595 } },
      { text: 'Quran 2:255' },
    ])
  })
  it('knows the names used by the duas and common variants', () => {
    const n = (s: string) => parseHadithSource(s)[0].hadith
    expect(n('Sunan Abi Dawud 5095')).toEqual({ collection: 'abudawud', number: 5095 })
    expect(n('Jami at-Tirmidhi 3426')).toEqual({ collection: 'tirmidhi', number: 3426 })
    expect(n('Sunan Ibn Majah 925')).toEqual({ collection: 'ibnmajah', number: 925 })
    expect(n("Sunan an-Nasa'i 1304")).toEqual({ collection: 'nasai', number: 1304 })
    expect(n('Sunan an-Nasai 5')).toEqual({ collection: 'nasai', number: 5 })
    expect(n('Muwatta Malik 10')).toEqual({ collection: 'malik', number: 10 })
    expect(n('Sahih Muslim 2723a')).toEqual({ collection: 'muslim', number: 2723 })
  })
  it('does not link out-of-range numbers, Quran refs or unknown books', () => {
    expect(parseHadithSource('Sahih al-Bukhari 99999')[0].hadith).toBeUndefined()
    expect(parseHadithSource('Sahih Muslim 3034')[0].hadith).toBeUndefined()
    expect(parseHadithSource('Sahih Muslim 0')[0].hadith).toBeUndefined()
    expect(parseHadithSource('Quran 43:13–14')[0].hadith).toBeUndefined()
    expect(parseHadithSource('Riyad as-Salihin 12')[0].hadith).toBeUndefined()
    expect(parseHadithSource('Quran 112–114; Sahih al-Bukhari 5017').map((x) => !!x.hadith)).toEqual([false, true])
  })
  it('every hadith cited by a dua parses to a hadith link (no silently unlinked sources)', () => {
    for (const d of duas) {
      for (const part of d.source.split(';').map((x) => x.trim())) {
        if (/^Quran\b/.test(part)) continue
        const parsed = parseHadithSource(part)[0]
        expect(parsed.hadith, `${d.slug}: ${part}`).toBeDefined()
      }
    }
  })
})

describe('urls', () => {
  it('builds canonical paths per locale', () => {
    expect(hadithUrl('bukhari', 1)).toBe('/hadith/bukhari/1')
    expect(hadithUrl('bukhari', 1, 'bn')).toBe('/bn/hadith/bukhari/1')
    expect(collectionUrl('muslim', 'bn')).toBe('/bn/hadith/muslim')
    expect(bookUrl('muslim', 45)).toBe('/hadith/muslim/book/45')
    expect(bookUrl('muslim', 45, 'en', 1)).toBe('/hadith/muslim/book/45')
    expect(bookUrl('muslim', 45, 'bn', 3)).toBe('/bn/hadith/muslim/book/45/page/3')
    expect(searchUrl('patience')).toBe('/hadith/search?q=patience')
    expect(searchUrl('ধৈর্য', 'bn', { collection: 'bukhari', page: 2 })).toBe(`/bn/hadith/search?q=${encodeURIComponent('ধৈর্য')}&c=bukhari&page=2`)
  })
  it('every hadith route has a Bangla twin', () => {
    for (const p of ['/hadith', '/hadith/search', '/hadith/bukhari', '/hadith/bukhari/1', '/hadith/bukhari/book/1', '/hadith/bukhari/book/1/page/2']) {
      expect(hasBnTwin(p), p).toBe(true)
      expect(localeHref('bn', p)).toBe('/bn' + p)
    }
    expect(hasBnTwin('/hadith/bukhari/book/1/page/2/x')).toBe(false)
  })
})

describe('collections', () => {
  it('resolves slugs and aliases', () => {
    expect(resolveCollectionSlug('bukhari')).toEqual({ slug: 'bukhari', canonical: true })
    expect(resolveCollectionSlug('nawawi')).toEqual({ slug: 'nawawi40', canonical: false })
    expect(resolveCollectionSlug('abu-dawud')?.slug).toBe('abudawud')
    expect(resolveCollectionSlug('nope')).toBeNull()
    expect(resolveCollectionSlug('constructor')).toBeNull()
  })
  it('has Arabic, Bangla and English names for all nine', () => {
    expect(COLLECTIONS).toHaveLength(9)
    for (const c of COLLECTIONS) { expect(c.name.ar).toMatch(/[؀-ۿ]/); expect(c.name.bn).toMatch(/[ঀ-৿]/); expect(c.max).toBeGreaterThan(0) }
    expect(collectionMeta('malik')!.langs.bn).toBe(false)
  })
})

describe('text helpers', () => {
  const b1 = "Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger (ﷺ) saying, \"The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended. So whoever emigrated for worldly benefits or for a woman to marry, his emigration was for what he emigrated for"
  it('extracts narrators', () => {
    expect(extractNarrator(b1)).toBe("'Umar bin Al-Khattab")
    expect(extractNarrator("Abu Huraira reported Allah's Messenger (ﷺ) as saying:Don't nurse grudge")).toBe('Abu Huraira')
    expect(extractNarrator('It is narrated on the authority of Yahya b. Ya\'mur that the first man who discussed qadr')).toBe("Yahya b. Ya'mur")
    expect(extractNarrator('It was narrated from Tariq bin Shaihab that a man asked')).toBe('Tariq bin Shaihab')
    expect(extractNarrator('When the Prophet went out to relieve himself')).toBeUndefined()
  })
  it('derives a short factual title from the first sentence of the matn', () => {
    const t = deriveTitle(b1)
    expect(t.startsWith('The reward of deeds depends upon the intentions')).toBe(true)
    expect(t.length).toBeLessThanOrEqual(80)
    expect(deriveTitle("Abu Huraira reported Allah's Messenger (ﷺ) as saying:Don't nurse grudge and don't bid him out for raising the price.")).toMatch(/^Don't nurse grudge/)
    expect(deriveTitle('Narrated Anas:as above')).toBe('')
    expect(deriveTitle('The same hadith has been narrated through another chain')).toBe('')
    expect(deriveTitle(undefined)).toBe('')
    expect(deriveTitle('')).toBe('')
  })
  it('restores spacing after a glued colon but leaves verse refs alone', () => {
    expect(cleanEnglish('as saying:Don\'t nurse')).toBe("as saying: Don't nurse")
    expect(cleanEnglish('see 2:255 here')).toBe('see 2:255 here')
    expect(clipText('one two three four five', 14)).toBe('one two three…')
  })
  it('grades', () => {
    expect(gradeCategory('Sahih')).toBe('sahih')
    expect(gradeCategory('Hasan Sahih')).toBe('hasan')
    expect(gradeCategory('Isnaad Hasan')).toBe('hasan')
    expect(gradeCategory("Da'if")).toBe('daif')
    expect(gradeCategory('Daif Jiddan')).toBe('daif')
    expect(gradeCategory('Mawdu')).toBe('daif')
    expect(gradeCategory('Sahih Lighairihi')).toBe('sahih')
    expect(normalizeGrades([{ name: 'Al-Albani', grade: 'Sahih' }])).toEqual([{ grader: 'Al-Albani', grade: 'Sahih', category: 'sahih' }])
    expect(normalizeGrades(undefined)).toEqual([])
  })
})

describe('curated hadiths', () => {
  it('hadith of the day is deterministic by (UTC) date and cycles through the pool', () => {
    const a = hadithOfTheDay(new Date('2026-03-01T00:00:00Z'))
    expect(hadithOfTheDay(new Date('2026-03-01T23:59:59Z'))).toBe(a)
    expect(hadithOfTheDay(new Date('2026-03-02T00:00:00Z'))).not.toBe(a)
    const seen = new Set(Array.from({ length: dayPool.length }, (_, i) => hadithOfTheDay(new Date(Date.UTC(2026, 0, 1 + i)))))
    expect(seen.size).toBe(dayPool.length)
  })
  it('only authentic collections are used for the day pool', () => {
    for (const f of dayPool) expect(['bukhari', 'muslim', 'tirmidhi'].includes(f.c)).toBe(true)
  })
  it('every curated entry names a real collection with a title in en and bn', () => {
    for (const f of featured) { expect(collectionMeta(f.c), f.c).toBeDefined(); expect(f.en.length).toBeGreaterThan(5); expect(f.bn).toMatch(/[ঀ-৿]/); expect(f.n).toBeLessThanOrEqual(collectionMeta(f.c)!.max) }
  })
})

describe('search helpers', () => {
  it('detects language by script', () => {
    expect(detectLang('patience')).toBe('en')
    expect(detectLang('ধৈর্য')).toBe('bn')
    expect(detectLang('الصبر')).toBe('ar')
  })
  it('drops stop words but keeps them when nothing else is left', () => {
    expect(parseQuery('hadith about patience').tokens).toEqual(['patience'])
    expect(parseQuery('the').tokens).toEqual(['the'])
  })
  it('normalises Arabic queries (diacritics, alef/ya/ta marbuta variants)', () => {
    expect(parseQuery('الصَّبْرُ').tokens).toEqual(['الصبر'])
    expect(parseQuery('إِنَّمَا الأَعْمَالُ').phrase).toBe('انما الاعمال')
  })
  it('English tokens match word prefixes with light stemming', () => {
    const re = tokenRegex('patience', 'en')
    expect(re.test('Be patient in hardship')).toBe(true)
    expect(re.test('impatience')).toBe(false)
    expect(tokenRegex('mercy', 'en').test('Allah is merciful')).toBe(true)
  })
  it('Bangla tokens tolerate ি/ী and ু/ূ variants', () => {
    expect(tokenRegex('হাদিস', 'bn').test('এই হাদীসটি')).toBe(true)
    expect(tokenRegex('পূর্ব', 'bn').test('পুর্ব দিক')).toBe(true)
  })
  it('Bangla spelling variants of য় (নিয়ত / নিয়্যত / নিয়্যাত) match each other', () => {
    for (const w of ['নিয়ত', 'নিয়্যত', 'নিয়্যতের', 'নিয়্যাত']) expect(tokenRegex('নিয়ত', 'bn').test(w), w).toBe(true)
    expect(tokenRegex('দয়া', 'bn').test('আল্লাহর দয়ালু')).toBe(true)
    expect(tokenRegex('নিয়ত', 'bn').test('নি' + String.fromCharCode(0x9df) + 'ত')).toBe(true) // precomposed য়
  })
  it('highlights hits', () => {
    const p = highlightParts('Be patient and patience is light', ['patience'], 'en')
    expect(p.filter((x) => x.hit).map((x) => x.t)).toEqual(['patient', 'patience'])
    expect(highlightParts('plain', [], 'en')).toEqual([{ t: 'plain', hit: false }])
  })
  it('digits', () => { expect(asciiDigits('২৫৬৪ ٢٥')).toBe('2564 25') })
  it('parses direct hadith references in English, Bangla and Arabic', () => {
    const r = (q: string) => parseHadithReference(q)
    expect(r('Sahih Bukhari hadith 1')).toEqual({ collection: 'bukhari', number: 1 })
    expect(r('bukhari 1')).toEqual({ collection: 'bukhari', number: 1 })
    expect(r('Sahih al-Bukhari 6306')).toEqual({ collection: 'bukhari', number: 6306 })
    expect(r('muslim:2564')).toEqual({ collection: 'muslim', number: 2564 })
    expect(r('Sunan Abu Dawud 5095')).toEqual({ collection: 'abudawud', number: 5095 })
    expect(r('tirmidhi hadith 1987')).toEqual({ collection: 'tirmidhi', number: 1987 })
    expect(r('ibn majah 224')).toEqual({ collection: 'ibnmajah', number: 224 })
    expect(r('nawawi 12')).toEqual({ collection: 'nawawi40', number: 12 })
    expect(r('বুখারী হাদিস ১')).toEqual({ collection: 'bukhari', number: 1 })
    expect(r('মুসলিম শরীফ ২৫৬৪')).toEqual({ collection: 'muslim', number: 2564 })
    expect(r('বুখারী শরীফ হাদিস নং ৭৫৬৩')).toEqual({ collection: 'bukhari', number: 7563 })
    expect(r('صحيح البخاري 1')).toEqual({ collection: 'bukhari', number: 1 })
    expect(r('مسلم ٢٥٦٤')).toEqual({ collection: 'muslim', number: 2564 })
  })
  it('does not treat topics or out-of-range numbers as references', () => {
    expect(parseHadithReference('patience')).toBeNull()
    expect(parseHadithReference('hadith about patience 5')).toBeNull()
    expect(parseHadithReference('bukhari 99999')).toBeNull()
    expect(parseHadithReference('muslim 3034')).toBeNull()
    expect(parseHadithReference('bukhari')).toBeNull()
    expect(parseHadithReference('1')).toBeNull()
    expect(parseHadithReference('muslim women 100')).toBeNull()
    expect(parseHadithReference('prophet muhammad 5')).toBeNull()
    expect(parseHadithReference('মুসলিম নারী ১০০')).toBeNull()
    expect(parseHadithReference('বুখারী ও মুসলিম ৫')).toBeNull()
  })
})
