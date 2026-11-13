import { chapters, surahNamesBn, toBanglaDigits } from '@/lib/quran/chapters'
import { getVerse, getVersesByRefs } from '@/lib/quran/data'
import { topicBySlug } from '@/data/content/topics'
import { duaBySlug } from '@/data/content/duas'
import { asmaBySlug } from '@/data/content/asma-ul-husna'
import { shortTitle } from '@/lib/content/seo'
import { sourceFor } from '@/lib/i18n/source-names'
import { renderOg } from './og'

type Loc = 'en' | 'bn'
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, s.lastIndexOf(' ', n) > 0 ? s.lastIndexOf(' ', n) : n)} …` : s)
const FALLBACK = { title: 'Read the Holy Quran', bn: { title: 'পবিত্র কুরআন পড়ুন' } }

/** One builder per OG route, shared by `/x/.../opengraph-image` (en) and `/bn/x/.../opengraph-image` (bn). */
export async function ogHome(locale: Loc) {
  return renderOg({
    title: 'Read, listen, understand & memorise the Holy Quran',
    subtitle: 'Bangla & English translation · word-by-word · tafsir · duas · 99 Names of Allah',
    arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    arabicSize: 68,
    bn: { title: 'পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন', subtitle: 'বাংলা ও ইংরেজি অনুবাদ · শব্দে শব্দে অর্থ · তাফসীর · দোয়া · আল্লাহর ৯৯ নাম' },
  }, { locale })
}

export async function ogSurah(slugId: number | null, locale: Loc) {
  if (!slugId) return renderOg(FALLBACK, { locale })
  const c = chapters[slugId - 1]
  const bnName = surahNamesBn[slugId - 1]
  return renderOg({
    kicker: `Surah ${slugId}`,
    title: `Surah ${c.nameSimple}`,
    subtitle: `${c.meaning} · ${c.versesCount} ayahs · ${c.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}`,
    arabic: `سورة ${c.nameArabic}`,
    arabicSize: 92,
    bn: {
      kicker: `সূরা ${toBanglaDigits(slugId)}`,
      title: `সূরা ${bnName}`,
      subtitle: `${c.nameBn ?? c.meaning} · ${toBanglaDigits(c.versesCount)}টি আয়াত · ${c.revelationPlace === 'makkah' ? 'মাক্কী' : 'মাদানী'}`,
    },
  }, { locale })
}

export async function ogAyah(id: number | null, n: number, locale: Loc) {
  const v = id && Number.isInteger(n) ? await getVerse(id, n) : null
  if (!id || !v) return renderOg(FALLBACK, { locale })
  const c = chapters[id - 1]
  return renderOg({
    kicker: `Quran ${v.k}`,
    title: `Surah ${c.nameSimple} · Ayah ${n}`,
    subtitle: clip(`“${v.en}”`, 120),
    arabic: clip(v.ar, 70),
    arabicSize: 60,
    bn: { kicker: `কুরআন ${toBanglaDigits(v.k)}`, title: `সূরা ${surahNamesBn[id - 1]} · আয়াত ${toBanglaDigits(n)}`, subtitle: clip(`“${v.bn}”`, 110) },
  }, { locale })
}

export async function ogTopic(slug: string, locale: Loc) {
  const t = topicBySlug(slug)
  if (!t) return renderOg({ title: 'Quran topics', bn: { title: 'বিষয়ভিত্তিক কুরআন' } }, { locale })
  return renderOg({
    kicker: 'Quran topics',
    title: `What does the Quran say about ${t.en}?`,
    subtitle: `${t.refs.length} verses with Arabic, English & Bangla translation`,
    arabic: 'قُرْآن',
    arabicSize: 84,
    bn: { kicker: 'বিষয়ভিত্তিক কুরআন', title: `${t.bn} সম্পর্কে কুরআন কী বলে?`, subtitle: `${toBanglaDigits(t.refs.length)}টি আয়াত আরবি ও বাংলা অনুবাদসহ` },
  }, { locale })
}

export async function ogDua(slug: string, locale: Loc) {
  const d = duaBySlug(slug)
  if (!d) return renderOg({ title: 'Duas from the Quran & Sunnah', bn: { title: 'কুরআন ও সুন্নাহর দোয়া' } }, { locale })
  const ar = d.refs ? (await getVersesByRefs(d.refs)).map((v) => v.ar).join(' ') : d.ar!
  const short = ar.length > 60 ? `${ar.slice(0, ar.lastIndexOf(' ', 60))} …` : ar
  const src = d.source.split(';')[0]
  return renderOg({
    kicker: 'Dua',
    title: shortTitle(d.title.en),
    subtitle: src,
    arabic: short,
    arabicSize: 64,
    bn: { kicker: 'দোয়া', title: shortTitle(d.title.bn), subtitle: sourceFor('bn', src) },
  }, { locale })
}

export async function ogName(slug: string, locale: Loc) {
  const n = asmaBySlug(slug)
  if (!n) return renderOg({ title: '99 Names of Allah', bn: { title: 'আল্লাহর ৯৯ নাম' } }, { locale })
  return renderOg({
    kicker: `Name ${n.n} of 99`,
    title: `${n.tl}: ${n.en}`,
    subtitle: 'Meaning of the Name of Allah',
    arabic: n.ar,
    arabicSize: 140,
    bn: { kicker: `৯৯ নামের ${toBanglaDigits(n.n)} নম্বর`, title: `${n.tlBn}: ${n.bn}`, subtitle: 'আল্লাহর নামের অর্থ' },
  }, { locale })
}

