import type { L } from './types'
import { tajweedRules } from './tajweed'

export type GuideSlug = 'tajweed' | 'kalima' | 'wudu' | 'salah' | 'arabic-alphabet'

export interface GuideMeta { title: string; description: string; keywords: string[] }
export interface LearnGuide {
  slug: GuideSlug
  path: string
  icon: string
  name: L
  /** card blurb on the hub */
  blurb: L
  /** SEO metadata per locale */
  meta: { en: GuideMeta; bn: GuideMeta }
  /** free-text aliases for the MCP tool / search */
  aliases: string[]
  /** how many steps / items to show on the hub card */
  count: { en: string; bn: string }
}

export const learnGuides: LearnGuide[] = [
  {
    slug: 'salah', path: '/learn/salah', icon: 'mosque',
    name: { en: 'Salah (prayer)', bn: 'নামাজ শিক্ষা', ar: 'تعلّم الصلاة' },
    blurb: { en: 'How to pray step by step: rak‘ah table, every recitation with Arabic, Bangla pronunciation and meaning.', bn: 'ধাপে ধাপে নামাজ পড়ার নিয়ম: রাকআতের তালিকা এবং প্রতিটি পাঠ আরবি, বাংলা উচ্চারণ ও অর্থসহ।', ar: 'كيفية الصلاة خطوة بخطوة مع عدد الركعات والأذكار.' },
    count: { en: '13 steps · 5 prayers', bn: '১৩ ধাপ · ৫ ওয়াক্ত' },
    aliases: ['salah', 'salat', 'namaz', 'namaaz', 'prayer', 'how to pray', 'how to pray salah', 'নামাজ', 'নামাজ শিক্ষা', 'নামাজের নিয়ম', 'صلاة'],
    meta: {
      en: { title: 'How to Pray Salah Step by Step: Rakats, Recitations & Meaning | নামাজ শিক্ষা', description: 'Learn how to pray salah step by step: niyyah, takbir, Fatiha, ruku, sujood, tashahhud and salam, with Arabic, pronunciation and meaning, plus the rak‘ah table for the five daily prayers. নামাজ শিক্ষা বাংলা উচ্চারণসহ।', keywords: ['how to pray salah step by step', 'how to pray namaz', 'salah for beginners', 'rakats in each prayer', 'namaz sikkha', 'নামাজ শিক্ষা', 'নামাজ পড়ার নিয়ম', 'নামাজের রাকআত সংখ্যা'] },
      bn: { title: 'নামাজ শিক্ষা: নামাজ পড়ার নিয়ম ধাপে ধাপে, রাকআত সংখ্যা ও দোয়া বাংলা উচ্চারণসহ', description: 'নিয়ত, তাকবীর, সূরা ফাতিহা, রুকু, সিজদা, তাশাহহুদ ও সালাম পর্যন্ত নামাজ পড়ার পূর্ণ নিয়ম; আরবি, বাংলা উচ্চারণ ও অর্থসহ। পাঁচ ওয়াক্তের রাকআতের তালিকা।', keywords: ['নামাজ শিক্ষা', 'নামাজ পড়ার নিয়ম', 'নামাজের নিয়ম', 'নামাজ শিক্ষা বাংলা', 'নামাজের রাকআত সংখ্যা', 'নামাজের দোয়া বাংলা উচ্চারণ', 'ফরজ সুন্নত নফল'] },
    },
  },
  {
    slug: 'wudu', path: '/learn/wudu', icon: 'hands',
    name: { en: 'Wudu (ablution)', bn: 'অজুর নিয়ম', ar: 'الوضوء' },
    blurb: { en: 'The wudu steps with simple diagrams, the four obligatory acts, what breaks wudu and the dua afterwards.', bn: 'ছবিসহ ওযুর ধাপ, চার ফরজ, ওযু ভঙ্গের কারণ ও ওযুর পরের দোয়া।', ar: 'خطوات الوضوء مع الرسوم ونواقضه والدعاء بعده.' },
    count: { en: '10 steps · diagrams', bn: '১০ ধাপ · ছবিসহ' },
    aliases: ['wudu', 'wuzu', 'ablution', 'how to perform wudu', 'ozu', 'ojhu', 'অজু', 'ওযু', 'ওজু', 'অজু করার নিয়ম', 'وضوء'],
    meta: {
      en: { title: 'How to Perform Wudu (Ablution) Step by Step with Pictures | অজু করার নিয়ম', description: 'How to perform wudu step by step with simple diagrams: the four obligatory acts from Quran 5:6, the sunnah acts, what breaks wudu and the dua after wudu. অজু করার নিয়ম ধাপে ধাপে।', keywords: ['how to perform wudu', 'wudu step by step', 'how to do wudu', 'wudu steps with pictures', 'what breaks wudu', 'অজু করার নিয়ম', 'ওযুর নিয়ম', 'অজুর ফরজ'] },
      bn: { title: 'অজু করার নিয়ম: ধাপে ধাপে ছবিসহ, ফরজ, সুন্নত ও অজু ভঙ্গের কারণ', description: 'অজু (ওযু) করার সহীহ নিয়ম ধাপে ধাপে ছবিসহ: কুরআনের ৫:৬ আয়াতের চার ফরজ, সুন্নত, অজু ভঙ্গের কারণ ও অজুর পরের দোয়া।', keywords: ['অজু করার নিয়ম', 'অজুর নিয়ম', 'ওযু করার নিয়ম', 'অজুর ফরজ কয়টি', 'অজু ভঙ্গের কারণ', 'অজুর দোয়া', 'ওজু করার নিয়ম'] },
    },
  },
  {
    slug: 'tajweed', path: '/learn/tajweed', icon: 'tajweed',
    name: { en: 'Tajweed', bn: 'তাজবীদ শিক্ষা', ar: 'أحكام التجويد' },
    blurb: { en: `${tajweedRules.length} rules with definitions, letters, pronunciation and real Quran examples in colour, with audio.`, bn: `${tajweedRules.length}টি নিয়ম: সংজ্ঞা, হরফ, উচ্চারণ এবং কুরআন থেকে রঙিন উদাহরণ, অডিওসহ।`, ar: 'أحكام التجويد بأمثلة ملوّنة من القرآن مع الصوت.' },
    count: { en: `${tajweedRules.length} rules · colour examples`, bn: `${tajweedRules.length}টি নিয়ম · রঙিন উদাহরণ` },
    aliases: ['tajweed', 'tajwid', 'tajweed rules', 'noon sakinah', 'madd', 'qalqalah', 'তাজবীদ', 'তাজবীদ শিক্ষা', 'تجويد'],
    meta: {
      en: { title: 'Tajweed Rules Explained with Quran Examples & Audio | তাজবীদ শিক্ষা', description: 'Learn tajweed rules: noon sakinah and tanween (izhar, idgham, iqlab, ikhfa), meem sakinah, qalqalah, ghunnah, madd, lam shamsiyyah and waqf signs, each with real Quran examples in colour and audio. তাজবীদ শিক্ষা।', keywords: ['tajweed rules', 'tajweed rules for beginners', 'noon sakinah rules', 'madd rules', 'qalqalah letters', 'izhar idgham iqlab ikhfa', 'learn tajweed online', 'তাজবীদ শিক্ষা', 'তাজবীদের নিয়ম'] },
      bn: { title: 'তাজবীদ শিক্ষা: নুন সাকিন, মাদ্দ, কলকলাসহ সব নিয়ম কুরআনের উদাহরণ ও অডিওসহ', description: 'তাজবীদের নিয়ম শিখুন: নুন সাকিন ও তানবীন (ইযহার, ইদগাম, ইকলাব, ইখফা), মীম সাকিন, কলকলা, গুন্নাহ, মাদ্দ, লাম শামসিয়্যাহ ও ওয়াকফের চিহ্ন; প্রতিটিতে কুরআন থেকে রঙিন উদাহরণ ও অডিও।', keywords: ['তাজবীদ শিক্ষা', 'তাজবীদের নিয়ম', 'নুন সাকিনের নিয়ম', 'মাদ্দের প্রকার', 'কলকলার হরফ', 'ইদগাম ইখফা ইকলাব ইযহার', 'তাজবীদ বাংলা'] },
    },
  },
  {
    slug: 'kalima', path: '/learn/kalima', icon: 'sparkle',
    name: { en: 'Six Kalimas', bn: '৬ কালেমা', ar: 'الكلمات الست' },
    blurb: { en: 'The six kalimas in Arabic with Bangla pronunciation, English transliteration and meaning.', bn: 'ছয় কালেমা আরবিতে, বাংলা উচ্চারণ, ইংরেজি ট্রান্সলিটারেশন ও অর্থসহ।', ar: 'الكلمات الست بالعربية مع النطق والمعنى.' },
    count: { en: '6 kalimas', bn: '৬টি কালেমা' },
    aliases: ['kalima', 'kalimah', 'six kalimas', '6 kalimas', 'kalma', 'কালেমা', '৬ কালেমা', 'ছয় কালেমা', 'كلمة'],
    meta: {
      en: { title: 'Six Kalimas in Arabic, English & Bangla Pronunciation | ৬ কালেমা বাংলা উচ্চারণ সহ', description: 'The six kalimas (Tayyibah, Shahadah, Tamjeed, Tawheed, Astaghfar, Radd-e-Kufr) in Arabic with transliteration, Bangla pronunciation and meaning. ৬ কালেমা বাংলা উচ্চারণ ও অর্থসহ।', keywords: ['six kalimas', '6 kalimas', 'six kalimas in english', 'first kalima tayyab', 'kalima shahadat', 'kalima tamjeed', '৬ কালেমা', 'ছয় কালেমা বাংলা উচ্চারণ সহ'] },
      bn: { title: '৬ কালেমা বাংলা উচ্চারণ সহ: আরবি, অর্থ ও ইংরেজি ট্রান্সলিটারেশন', description: 'ছয় কালেমা (তাইয়্যিবা, শাহাদাত, তামজীদ, তাওহীদ, ইস্তিগফার, রদ্দে কুফর) আরবি, বাংলা উচ্চারণ ও অর্থসহ। প্রতিটি কালেমার উৎস সম্পর্কে সততার সঙ্গে জানানো হয়েছে।', keywords: ['৬ কালেমা', 'ছয় কালেমা', '৬ কালেমা বাংলা উচ্চারণ সহ', 'প্রথম কালেমা তাইয়্যিবা', 'দ্বিতীয় কালেমা শাহাদাত', 'তৃতীয় কালেমা তামজীদ', 'কালেমা বাংলা অর্থসহ'] },
    },
  },
  {
    slug: 'arabic-alphabet', path: '/learn/arabic-alphabet', icon: 'read',
    name: { en: 'Arabic alphabet', bn: 'আরবি বর্ণমালা', ar: 'الحروف العربية' },
    blurb: { en: 'The 28 letters with names, four forms, articulation point, example Quran words, sound and a practice quiz.', bn: '২৮টি হরফ: নাম, চার রূপ, মাখরাজ, কুরআনের উদাহরণ শব্দ, উচ্চারণ ও অনুশীলন কুইজ।', ar: 'الحروف الثمانية والعشرون بأشكالها ومخارجها واختبار تدريبي.' },
    count: { en: '28 letters · quiz', bn: '২৮ হরফ · কুইজ' },
    aliases: ['arabic alphabet', 'arabic letters', 'hijaiyah', 'huroof', 'আরবি বর্ণমালা', 'আরবি হরফ', 'আরবি হরফ শিক্ষা', 'حروف'],
    meta: {
      en: { title: 'Arabic Alphabet for the Quran: 28 Letters, Forms, Makhraj & Quiz | আরবি বর্ণমালা', description: 'Learn the Arabic alphabet for reading the Quran: all 28 letters with names, isolated, initial, medial and final forms, makhraj (articulation point), example words from the Quran, audio and a practice quiz. আরবি বর্ণমালা।', keywords: ['arabic alphabet for Quran', 'arabic alphabet for beginners', 'arabic letters', '28 arabic letters', 'makhraj of arabic letters', 'আরবি বর্ণমালা', 'আরবি হরফ'] },
      bn: { title: 'আরবি বর্ণমালা: ২৮টি হরফ, উচ্চারণ, মাখরাজ ও কুইজ (কুরআন শেখার প্রথম ধাপ)', description: 'কুরআন পড়ার জন্য আরবি বর্ণমালা শিখুন: ২৮টি হরফের নাম, আলাদা/শুরু/মাঝ/শেষের রূপ, মাখরাজ, কুরআন থেকে উদাহরণ শব্দ, উচ্চারণ ও অনুশীলন কুইজ।', keywords: ['আরবি বর্ণমালা', 'আরবি হরফ', 'আরবি হরফ শিক্ষা', 'আরবি ২৮ হরফ', 'মাখরাজ', 'কুরআন শেখার নিয়ম'] },
    },
  },
]

export const hubMeta = {
  en: { title: 'Learn Islam Basics: Tajweed, Salah, Wudu, Six Kalimas & Arabic Alphabet | ইসলামি শিক্ষা', description: 'Free step-by-step guides: how to pray salah, how to perform wudu, tajweed rules with Quran examples, the six kalimas with Bangla pronunciation and the Arabic alphabet. নামাজ শিক্ষা, অজুর নিয়ম, তাজবীদ, ৬ কালেমা।', keywords: ['learn islam', 'how to pray salah step by step', 'how to perform wudu', 'tajweed rules', 'six kalimas', 'arabic alphabet for Quran', 'নামাজ শিক্ষা', 'তাজবীদ শিক্ষা', '৬ কালেমা', 'অজু করার নিয়ম', 'আরবি বর্ণমালা'] },
  bn: { title: 'ইসলামি শিক্ষা: নামাজ শিক্ষা, অজুর নিয়ম, তাজবীদ, ৬ কালেমা ও আরবি বর্ণমালা', description: 'বিনামূল্যে ধাপে ধাপে শিক্ষা: নামাজ পড়ার নিয়ম, অজু করার নিয়ম, কুরআনের উদাহরণসহ তাজবীদ, বাংলা উচ্চারণসহ ৬ কালেমা এবং আরবি বর্ণমালা।', keywords: ['ইসলামি শিক্ষা', 'নামাজ শিক্ষা', 'অজু করার নিয়ম', 'তাজবীদ শিক্ষা', '৬ কালেমা বাংলা উচ্চারণ সহ', 'আরবি বর্ণমালা', 'কুরআন শিক্ষা'] },
}

export const guideBySlug = (slug: string) => learnGuides.find((g) => g.slug === slug)

/** Every public learn path (English, without /bn): hub, guides and tajweed rule pages. */
export const learnPaths = (): string[] => ['/learn', ...learnGuides.map((g) => g.path), ...tajweedRules.map((r) => `/learn/tajweed/${r.slug}`)]
