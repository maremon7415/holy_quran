// Client-safe static description of the hadith collections served at /hadith.
// URL numbering (see numbering.ts): the number printed in the common citation (sunnah.com style).
import type { Tr } from '@/lib/i18n/t'

export type CollectionSlug = 'bukhari' | 'muslim' | 'abudawud' | 'tirmidhi' | 'nasai' | 'ibnmajah' | 'malik' | 'nawawi40' | 'qudsi40'
export type HadithLang = 'ar' | 'en' | 'bn'
export type L3 = Required<Tr>

export interface CollectionMeta {
  slug: CollectionSlug
  /** Edition key in the fawazahmed0/hadith-api corpus (`ara-bukhari`, `eng-bukhari`, `ben-bukhari`). */
  api: string
  name: L3
  /** Common Bangla name people search for ("বুখারী শরীফ"). */
  aliasBn: string
  /** English citation name, as used in dua sources ("Sahih al-Bukhari 6306"). */
  cite: string
  compiler: L3
  died: string
  /** Highest hadith number in the URL numbering. */
  max: number
  /** 'consensus' = Bukhari/Muslim (authentic by consensus of the ummah); 'graded' = per-hadith grades; 'mixed' = unweighted classical collection. */
  authenticity: 'consensus' | 'graded' | 'mixed' | 'selection'
  desc: L3
  /** Languages with text in the corpus. */
  langs: Record<HadithLang, boolean>
  icon: string
}

export const COLLECTIONS: CollectionMeta[] = [
  {
    slug: 'bukhari', api: 'bukhari', cite: 'Sahih al-Bukhari', max: 7563, died: '256 AH / 870 CE', authenticity: 'consensus', icon: 'quran',
    name: { en: 'Sahih al-Bukhari', bn: 'সহীহ বুখারী', ar: 'صحيح البخاري' }, aliasBn: 'বুখারী শরীফ',
    compiler: { en: 'Imam Muhammad ibn Isma‘il al-Bukhari', bn: 'ইমাম মুহাম্মাদ ইবনু ইসমাঈল আল-বুখারী', ar: 'الإمام محمد بن إسماعيل البخاري' },
    desc: {
      en: 'The most authentic book after the Quran according to the consensus of the scholars of Ahl as-Sunnah: 97 books arranged by topic, from revelation and faith to prayer, character and the end of time.',
      bn: 'আহলুস সুন্নাহর আলেমদের ঐকমত্যে কুরআনের পর সবচেয়ে বিশুদ্ধ গ্রন্থ: ওহী, ঈমান, নামাজ থেকে আখলাক ও কিয়ামত পর্যন্ত বিষয়ভিত্তিক ৯৭টি অধ্যায়।',
      ar: 'أصحّ كتاب بعد القرآن الكريم عند جمهور أهل السنة: سبعة وتسعون كتابًا مرتّبة على الموضوعات، من بدء الوحي والإيمان إلى الصلاة والأخلاق وأشراط الساعة.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'muslim', api: 'muslim', cite: 'Sahih Muslim', max: 3033, died: '261 AH / 875 CE', authenticity: 'consensus', icon: 'quran',
    name: { en: 'Sahih Muslim', bn: 'সহীহ মুসলিম', ar: 'صحيح مسلم' }, aliasBn: 'মুসলিম শরীফ',
    compiler: { en: 'Imam Muslim ibn al-Hajjaj an-Naysaburi', bn: 'ইমাম মুসলিম ইবনুল হাজ্জাজ আন-নায়সাপুরী', ar: 'الإمام مسلم بن الحجاج النيسابوري' },
    desc: {
      en: 'The second of the two Sahihs, famed for its precise arrangement and for gathering the different chains of each hadith in one place. Numbered by Muhammad Fu’ad ‘Abd al-Baqi, as cited worldwide.',
      bn: 'দুই সহীহর দ্বিতীয়টি; প্রতিটি হাদিসের বিভিন্ন সনদ এক জায়গায় সাজানোর নিখুঁত বিন্যাসের জন্য বিখ্যাত। বিশ্বজুড়ে প্রচলিত মুহাম্মাদ ফুআদ আবদুল বাকী নম্বর অনুসরণ করা হয়েছে।',
      ar: 'ثاني الصحيحين، اشتهر بدقة ترتيبه وجمعه طرق الحديث الواحد في موضع واحد. الترقيم المعتمد هو ترقيم محمد فؤاد عبد الباقي.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'abudawud', api: 'abudawud', cite: 'Sunan Abi Dawud', max: 5274, died: '275 AH / 889 CE', authenticity: 'graded', icon: 'read',
    name: { en: 'Sunan Abi Dawud', bn: 'সুনানে আবু দাউদ', ar: 'سنن أبي داود' }, aliasBn: 'আবু দাউদ শরীফ',
    compiler: { en: 'Imam Abu Dawud Sulayman as-Sijistani', bn: 'ইমাম আবু দাউদ সুলাইমান আস-সিজিস্তানী', ar: 'الإمام أبو داود سليمان السجستاني' },
    desc: {
      en: 'A collection focused on the hadiths of legal rulings (fiqh): purification, prayer, zakat, fasting, hajj, marriage and transactions. Individual hadiths carry grades from later scholars.',
      bn: 'ফিকহী বিধানের হাদিসকেন্দ্রিক সংকলন: পবিত্রতা, নামাজ, যাকাত, রোযা, হজ্জ, বিবাহ ও লেনদেন। পরবর্তী মুহাদ্দিসদের মান (গ্রেড) প্রতিটি হাদিসে উল্লেখ আছে।',
      ar: 'كتاب اعتنى بأحاديث الأحكام الفقهية: الطهارة والصلاة والزكاة والصيام والحج والنكاح والمعاملات. وتُذكر أحكام العلماء على كل حديث.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'tirmidhi', api: 'tirmidhi', cite: 'Jami at-Tirmidhi', max: 3956, died: '279 AH / 892 CE', authenticity: 'graded', icon: 'read',
    name: { en: 'Jami at-Tirmidhi', bn: 'জামে আত-তিরমিযী', ar: 'جامع الترمذي' }, aliasBn: 'তিরমিজি শরীফ',
    compiler: { en: 'Imam Abu ‘Isa Muhammad at-Tirmidhi', bn: 'ইমাম আবু ঈসা মুহাম্মাদ আত-তিরমিযী', ar: 'الإمام أبو عيسى محمد الترمذي' },
    desc: {
      en: 'Known for the compiler’s own comment on the grade of each hadith and for noting the opinions of the jurists. Also contains the book of virtues, manners and the Prophet’s character.',
      bn: 'প্রতিটি হাদিসের মান সম্পর্কে সংকলকের নিজস্ব মন্তব্য ও ফকীহদের মত উল্লেখের জন্য পরিচিত। ফযীলত, আদব ও নবী ﷺ-এর চরিত্র অধ্যায়ও রয়েছে।',
      ar: 'اشتهر بحكم مؤلفه على كل حديث وبذكر مذاهب الفقهاء، وفيه أبواب الفضائل والآداب وشمائل النبي ﷺ.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'nasai', api: 'nasai', cite: "Sunan an-Nasa'i", max: 5758, died: '303 AH / 915 CE', authenticity: 'graded', icon: 'read',
    name: { en: "Sunan an-Nasa'i", bn: 'সুনানে নাসায়ী', ar: 'سنن النسائي' }, aliasBn: 'নাসাঈ শরীফ',
    compiler: { en: "Imam Ahmad ibn Shu‘ayb an-Nasa'i", bn: 'ইমাম আহমাদ ইবনু শুআইব আন-নাসায়ী', ar: 'الإمام أحمد بن شعيب النسائي' },
    desc: {
      en: 'Regarded as having the fewest weak narrations among the Sunan, with rigorous conditions for narrators and detailed notes on the differences between chains.',
      bn: 'সুনান গ্রন্থগুলোর মধ্যে সবচেয়ে কম দুর্বল বর্ণনাযুক্ত বলে গণ্য; বর্ণনাকারীদের কঠোর শর্ত ও সনদের পার্থক্যের সূক্ষ্ম বিবরণ রয়েছে।',
      ar: 'يُعدّ أقلّ السنن ضعيفًا، واشترط في رواته شروطًا مشدّدة، وعُني ببيان علل الأسانيد واختلاف الطرق.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'ibnmajah', api: 'ibnmajah', cite: 'Sunan Ibn Majah', max: 4341, died: '273 AH / 887 CE', authenticity: 'graded', icon: 'read',
    name: { en: 'Sunan Ibn Majah', bn: 'সুনানে ইবনে মাজাহ', ar: 'سنن ابن ماجه' }, aliasBn: 'ইবনে মাজাহ শরীফ',
    compiler: { en: 'Imam Muhammad ibn Yazid Ibn Majah al-Qazwini', bn: 'ইমাম মুহাম্মাদ ইবনু ইয়াযীদ ইবনে মাজাহ আল-কাযভীনী', ar: 'الإمام محمد بن يزيد ابن ماجه القزويني' },
    desc: {
      en: 'The sixth of the six major books. It adds many hadiths not found in the other five, so it contains narrations of differing strength; each one is shown with the grades of later scholars.',
      bn: 'ছয় প্রধান গ্রন্থের ষষ্ঠটি। অন্য পাঁচ গ্রন্থে নেই এমন অনেক হাদিস থাকায় এতে বিভিন্ন মানের বর্ণনা আছে; প্রতিটির সঙ্গে পরবর্তী মুহাদ্দিসদের মান দেখানো হয়েছে।',
      ar: 'سادس الكتب الستة، فيه زوائد كثيرة على الخمسة، ولذلك تفاوتت درجات أحاديثه؛ وتُعرض مع أحكام العلماء عليها.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'malik', api: 'malik', cite: 'Muwatta Malik', max: 1858, died: '179 AH / 795 CE', authenticity: 'graded', icon: 'read',
    name: { en: 'Muwatta Malik', bn: 'মুয়াত্তা ইমাম মালিক', ar: 'موطأ مالك' }, aliasBn: 'মুয়াত্তা মালিক',
    compiler: { en: 'Imam Malik ibn Anas', bn: 'ইমাম মালিক ইবনু আনাস', ar: 'الإمام مالك بن أنس' },
    desc: {
      en: 'One of the earliest surviving hadith collections, from the scholar of Madinah. It combines hadiths of the Prophet ﷺ with the sayings of the Companions and the practice of the people of Madinah.',
      bn: 'মদীনার ইমামের সংকলিত প্রাচীনতম সংরক্ষিত হাদিস গ্রন্থগুলোর একটি; নবী ﷺ-এর হাদিসের সঙ্গে সাহাবীদের উক্তি ও মদীনাবাসীর আমল রয়েছে।',
      ar: 'من أقدم كتب الحديث المحفوظة، لإمام دار الهجرة، يجمع بين أحاديث النبي ﷺ وأقوال الصحابة وعمل أهل المدينة.',
    },
    langs: { ar: true, en: true, bn: false },
  },
  {
    slug: 'nawawi40', api: 'nawawi', cite: "An-Nawawi's Forty Hadith", max: 42, died: '676 AH / 1277 CE', authenticity: 'selection', icon: 'hands',
    name: { en: 'Forty Hadith of an-Nawawi', bn: 'চল্লিশ হাদিস (ইমাম নববী)', ar: 'الأربعون النووية' }, aliasBn: 'ইমাম নববীর চল্লিশ হাদিস',
    compiler: { en: 'Imam Yahya ibn Sharaf an-Nawawi', bn: 'ইমাম ইয়াহইয়া ইবনু শারাফ আন-নববী', ar: 'الإمام يحيى بن شرف النووي' },
    desc: {
      en: 'Forty-two comprehensive hadiths selected by Imam an-Nawawi, each a foundation of the religion: intention, Islam, Iman and Ihsan, sincerity, brotherhood and character. The classic first text for students.',
      bn: 'ইমাম নববী নির্বাচিত ৪২টি সারগর্ভ হাদিস, প্রতিটি দীনের একটি মূলনীতি: নিয়ত, ইসলাম-ঈমান-ইহসান, ইখলাস, ভ্রাতৃত্ব ও আখলাক। শিক্ষার্থীদের প্রথম পাঠ।',
      ar: 'اثنان وأربعون حديثًا جامعًا اختارها الإمام النووي، كلٌّ منها قاعدة من قواعد الدين: النية والإسلام والإيمان والإحسان والإخلاص والأخوّة والخلق.',
    },
    langs: { ar: true, en: true, bn: true },
  },
  {
    slug: 'qudsi40', api: 'qudsi', cite: 'Forty Hadith Qudsi', max: 40, died: '', authenticity: 'selection', icon: 'sparkle',
    name: { en: 'Forty Hadith Qudsi', bn: 'চল্লিশ হাদিসে কুদসি', ar: 'الأربعون القدسية' }, aliasBn: 'হাদিসে কুদসি',
    compiler: { en: 'Selection of sacred hadith (Hadith Qudsi)', bn: 'হাদিসে কুদসির নির্বাচিত সংকলন', ar: 'مختارات من الأحاديث القدسية' },
    desc: {
      en: 'Hadith Qudsi are sayings the Prophet ﷺ reported from his Lord, in his own words (unlike the Quran). This selection of forty is short, deeply personal and widely quoted.',
      bn: 'হাদিসে কুদসি হলো নবী ﷺ তাঁর রবের পক্ষ থেকে নিজের ভাষায় বর্ণিত বাণী (কুরআনের মতো নয়)। চল্লিশটির এই নির্বাচন সংক্ষিপ্ত ও হৃদয়স্পর্শী।',
      ar: 'الحديث القدسي ما رواه النبي ﷺ عن ربه بلفظه هو، وليس كالقرآن. وهذه أربعون حديثًا قدسيًّا مختارة، قصيرة وعميقة الأثر.',
    },
    langs: { ar: true, en: true, bn: false },
  },
]

export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug) as CollectionSlug[]
const bySlug = new Map<string, CollectionMeta>(COLLECTIONS.map((c) => [c.slug, c]))
// accepted alternative spellings in URLs (redirected to the canonical slug)
const ALIASES: Record<string, CollectionSlug> = { nawawi: 'nawawi40', nawawi40: 'nawawi40', qudsi: 'qudsi40', 'abu-dawud': 'abudawud', 'ibn-majah': 'ibnmajah', 'nasa-i': 'nasai' }

export const isCollectionSlug = (s: string): s is CollectionSlug => bySlug.has(s)
export const collectionMeta = (slug: string): CollectionMeta | undefined => bySlug.get(slug)
/** Resolve a URL segment (canonical slug or alias) to its collection; `canonical` is false for aliases. */
export function resolveCollectionSlug(seg: string): { slug: CollectionSlug; canonical: boolean } | null {
  const s = seg.toLowerCase()
  if (bySlug.has(s)) return { slug: s as CollectionSlug, canonical: s === seg }
  const a = Object.hasOwn(ALIASES, s) ? ALIASES[s] : undefined
  return a ? { slug: a, canonical: false } : null
}
