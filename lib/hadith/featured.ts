// Curated, well-known authentic hadiths. Used for: static pre-rendering, the "Hadith of the day", titles,
// and "famous hadiths" lists. Every entry is validated against the corpus by `scripts/build-hadith-index.mjs`
// (`kw` must occur in the English text of that exact number). No imports: this file is read by Node directly.
export interface Featured {
  c: string // collection slug
  n: number // hadith number in the commonly cited numbering (see lib/hadith/numbering.ts)
  kw: string // lowercase fragment that must appear in the English text
  en: string // short factual title
  bn: string
  day?: boolean // eligible for "Hadith of the day" (short, well known, authentic)
}

export const featured: Featured[] = [
  { c: 'bukhari', n: 1, kw: 'intentions', en: 'Actions are judged by intentions', bn: 'কাজের ফলাফল নিয়তের ওপর নির্ভরশীল', day: true },
  { c: 'bukhari', n: 8, kw: 'islam is based on', en: 'Islam is built on five pillars', bn: 'ইসলামের ভিত্তি পাঁচটি স্তম্ভের ওপর', day: true },
  { c: 'bukhari', n: 10, kw: 'avoids harming muslims with his tongue', en: 'A Muslim is one from whose tongue and hands people are safe', bn: 'মুসলিম সে, যার জিহ্বা ও হাত থেকে অন্য মুসলিমরা নিরাপদ', day: true },
  { c: 'bukhari', n: 13, kw: 'what he likes for himself', en: 'Loving for your brother what you love for yourself', bn: 'নিজের জন্য যা পছন্দ, ভাইয়ের জন্যও তা পছন্দ করা', day: true },
  { c: 'bukhari', n: 50, kw: 'gabriel', en: 'The hadith of Jibril: Islam, Iman and Ihsan', bn: 'জিবরীলের হাদিস: ইসলাম, ঈমান ও ইহসান' },
  { c: 'bukhari', n: 52, kw: 'evident', en: 'The lawful is clear and the unlawful is clear', bn: 'হালাল স্পষ্ট এবং হারামও স্পষ্ট' },
  { c: 'bukhari', n: 3461, kw: 'even if it were a single sentence', en: 'Convey from me, even if it is one verse', bn: 'আমার পক্ষ থেকে পৌঁছে দাও, একটি আয়াত হলেও', day: true },
  { c: 'bukhari', n: 5027, kw: 'learn the qur\'an and teach it', en: 'The best of you learn the Quran and teach it', bn: 'তোমাদের মধ্যে সর্বোত্তম সে, যে কুরআন শেখে ও শেখায়', day: true },
  { c: 'bukhari', n: 5997, kw: 'not merciful', en: 'He who is not merciful to others will not be shown mercy', bn: 'যে দয়া করে না, তাকে দয়া করা হবে না', day: true },
  { c: 'bukhari', n: 6018, kw: 'talk what is good or keep quiet', en: 'Speak good or remain silent', bn: 'ভালো কথা বলো, নয়তো চুপ থাকো', day: true },
  { c: 'bukhari', n: 6094, kw: 'truthfulness', en: 'Truthfulness leads to righteousness', bn: 'সত্যবাদিতা নেক কাজের দিকে নিয়ে যায়', day: true },
  { c: 'bukhari', n: 6114, kw: 'anger', en: 'The strong person is the one who controls himself in anger', bn: 'প্রকৃত বীর সে, যে রাগের সময় নিজেকে নিয়ন্ত্রণ করে', day: true },
  { c: 'bukhari', n: 6306, kw: 'most superior way of asking for forgiveness', en: 'Sayyid al-Istighfar: the master of seeking forgiveness', bn: 'সাইয়্যিদুল ইসতিগফার: ক্ষমা প্রার্থনার সর্বোত্তম দোয়া' },
  { c: 'bukhari', n: 6407, kw: 'living creature compared to a dead one', en: 'The one who remembers his Lord is like the living, the one who does not is like the dead', bn: 'যে আল্লাহর যিকির করে সে জীবিত, যে করে না সে মৃতের মতো', day: true },
  { c: 'bukhari', n: 6412, kw: 'free time', en: 'Two blessings many people lose: health and free time', bn: 'দুটি নিয়ামত নিয়ে অনেক মানুষ প্রতারিত: সুস্থতা ও অবসর', day: true },
  { c: 'bukhari', n: 6416, kw: 'stranger', en: 'Be in this world as a stranger or a traveller', bn: 'দুনিয়াতে অপরিচিত বা পথিকের মতো থাকো', day: true },
  { c: 'bukhari', n: 6502, kw: 'declare war', en: 'Hadith Qudsi: whoever shows enmity to a friend of Allah', bn: 'হাদিসে কুদসি: আমার কোনো ওলির সঙ্গে শত্রুতা করলে' },
  { c: 'bukhari', n: 7563, kw: 'very light', en: 'Two words light on the tongue, heavy on the scale', bn: 'দুটি বাক্য জিহ্বায় হালকা, দাঁড়িপাল্লায় ভারী', day: true },
  { c: 'bukhari', n: 6065, kw: 'jealous', en: 'Do not envy, hate or turn away from one another', bn: 'পরস্পর হিংসা, বিদ্বেষ ও সম্পর্কচ্ছেদ করো না' },
  { c: 'bukhari', n: 6064, kw: 'suspicion', en: 'Beware of suspicion, for suspicion is the worst of speech', bn: 'ধারণা থেকে বেঁচে থাকো; ধারণা সবচেয়ে বড় মিথ্যা কথা' },
  { c: 'bukhari', n: 5984, kw: 'severs', en: 'The one who severs the ties of kinship', bn: 'আত্মীয়তার বন্ধন ছিন্নকারী জান্নাতে যাবে না' },
  { c: 'bukhari', n: 2444, kw: 'oppressor', en: 'Help your brother, whether oppressor or oppressed', bn: 'তোমার ভাইকে সাহায্য করো, জালিম হোক বা মজলুম' },
  { c: 'bukhari', n: 1417, kw: 'half a date', en: 'Protect yourself from the Fire, even with half a date', bn: 'অর্ধেক খেজুর দান করে হলেও জাহান্নাম থেকে বাঁচো' },
  { c: 'bukhari', n: 5063, kw: 'offer the prayer throughout the night', en: 'Whoever turns away from my Sunnah is not of me', bn: 'যে আমার সুন্নাত থেকে মুখ ফিরিয়ে নেয় সে আমার দলভুক্ত নয়' },

  { c: 'muslim', n: 8, kw: 'gabriel', en: 'The hadith of Jibril: Islam, Iman and Ihsan', bn: 'জিবরীলের হাদিস: ইসলাম, ঈমান ও ইহসান' },
  { c: 'muslim', n: 49, kw: 'modify it with the help of his hand', en: 'Changing an evil with hand, tongue or heart', bn: 'অন্যায় দেখলে হাত, মুখ বা অন্তর দিয়ে প্রতিরোধ করা' },
  { c: 'muslim', n: 55, kw: 'sincerity', en: 'The religion is sincerity (nasihah)', bn: 'দীন হলো কল্যাণকামিতা', day: true },
  { c: 'muslim', n: 223, kw: 'cleanliness', en: 'Cleanliness is half of faith', bn: 'পবিত্রতা ঈমানের অর্ধেক', day: true },
  { c: 'muslim', n: 1631, kw: 'three', en: 'When a person dies, his deeds end except three', bn: 'মানুষ মারা গেলে তিনটি আমল ছাড়া সব আমল বন্ধ হয়ে যায়', day: true },
  { c: 'muslim', n: 2564, kw: 'looks to your hearts', en: 'Allah does not look at your forms but at your hearts', bn: 'আল্লাহ তোমাদের চেহারা নয়, অন্তর দেখেন', day: true },
  { c: 'muslim', n: 2581, kw: 'bankrupt', en: 'Who is the bankrupt person?', bn: 'প্রকৃত দেউলিয়া কে?' },
  { c: 'muslim', n: 2586, kw: 'one body', en: 'The believers are like one body', bn: 'মুমিনরা একটি দেহের মতো', day: true },
  { c: 'muslim', n: 2664, kw: 'strong believer', en: 'The strong believer is better and more beloved to Allah', bn: 'শক্তিশালী মুমিন আল্লাহর কাছে অধিক প্রিয়' },
  { c: 'muslim', n: 2674, kw: 'righteousness', en: 'Whoever calls to guidance earns a reward like those who follow it', bn: 'যে হিদায়াতের দিকে ডাকে সে অনুসারীদের সমান সওয়াব পায়' },
  { c: 'muslim', n: 2699, kw: 'alleviate', en: 'Whoever relieves a believer of distress', bn: 'যে কোনো মুমিনের দুঃখ দূর করে আল্লাহ তার দুঃখ দূর করবেন' },
  { c: 'muslim', n: 2999, kw: 'strange are the ways of a believer', en: 'How wonderful is the affair of the believer', bn: 'মুমিনের বিষয়টি কতই না চমৎকার', day: true },
  { c: 'nawawi40', n: 1, kw: 'intended', en: 'Actions are judged by intentions', bn: 'কাজের ফলাফল নিয়তের ওপর নির্ভরশীল' },
  { c: 'nawawi40', n: 2, kw: 'jibril', en: 'The hadith of Jibril: Islam, Iman and Ihsan', bn: 'জিবরীলের হাদিস: ইসলাম, ঈমান ও ইহসান' },
  { c: 'nawawi40', n: 13, kw: 'loves for his brother', en: 'Loving for your brother what you love for yourself', bn: 'নিজের জন্য যা পছন্দ, ভাইয়ের জন্যও তা পছন্দ করা' },
  { c: 'nawawi40', n: 16, kw: 'do not become angry', en: 'Do not become angry', bn: 'রাগ করো না' },
  { c: 'nawawi40', n: 18, kw: 'wherever you may be', en: 'Fear Allah wherever you are', bn: 'যেখানেই থাকো আল্লাহকে ভয় করো' },
  { c: 'nawawi40', n: 12, kw: 'does not concern him', en: 'Leaving what does not concern you', bn: 'অনর্থক বিষয় ছেড়ে দেওয়া ইসলামের সৌন্দর্য' },
  { c: 'tirmidhi', n: 1987, kw: 'wherever you are', en: 'Fear Allah wherever you are', bn: 'যেখানেই থাকো আল্লাহকে ভয় করো', day: true },
  { c: 'tirmidhi', n: 2317, kw: 'does not concern him', en: 'Leaving what does not concern you', bn: 'অনর্থক বিষয় ছেড়ে দেওয়া ইসলামের সৌন্দর্য', day: true },
  { c: 'tirmidhi', n: 1956, kw: 'smiling', en: 'Smiling in the face of your brother is charity', bn: 'ভাইয়ের মুখের দিকে হাসি দেওয়াও সদকা' },
  { c: 'abudawud', n: 4941, kw: 'merciful', en: 'He who does not show mercy to our young is not one of us', bn: 'যে আমাদের ছোটদের দয়া করে না সে আমাদের দলভুক্ত নয়' },
]

/** Hadith-of-the-day pool, in list order (deterministic rotation by UTC date). */
export const dayPool = featured.filter((f) => f.day)

/** Day number since the Unix epoch (UTC) → stable pick for that date. */
export function hadithOfTheDay(date: Date = new Date()): Featured {
  const day = Math.floor(date.getTime() / 86_400_000)
  return dayPool[((day % dayPool.length) + dayPool.length) % dayPool.length]
}
