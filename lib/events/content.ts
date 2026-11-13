/**
 * Editorial content for the Islamic-events pages (pure data, client + server safe).
 * Quran refs are rendered from the corpus (getVersesByRefs); hadith come from ./hadith-refs (verified against the corpus
 * by scripts/verify-hadith-sources.mjs); duas from data/content/duas.ts. Long copy stays in en/bn (ar is optional by design).
 */
import { EVENT_SLUGS, type EventSlug } from './calendar'

export interface Tr3 { en: string; bn: string; ar?: string }
export interface Link3 { href: string; label: Tr3 }

export interface EventContent {
  slug: EventSlug
  icon: string
  name: Tr3
  /** Alternative spellings / search terms (keywords + markdown) */
  alt: string[]
  /** What "Hijri date" means for this event, e.g. 10 Dhu al-Hijjah */
  hijriLabel: Tr3
  /** schema.org eventAttendanceMode */
  attendance: 'Offline' | 'Mixed'
  /** One-sentence answer-first definition */
  summary: Tr3
  what: Tr3[]
  observe: Tr3[]
  quran: { ref: string; why: Tr3 }[]
  hadith: string[]
  duas: string[]
  related: Link3[]
  faq: { q: Tr3; a: Tr3 }[]
}

const L = {
  ramadanPage: { href: '/ramadan', label: { en: 'Ramadan sehri & iftar timetable', bn: 'রমজানের সেহরি ও ইফতারের সময়সূচি', ar: 'جدول رمضان' } },
  hijri: { href: '/hijri-date', label: { en: 'Hijri date today & converter', bn: 'আজকের হিজরি তারিখ ও কনভার্টার', ar: 'التاريخ الهجري اليوم' } },
  prayer: { href: '/prayer-times/dhaka', label: { en: 'Dhaka prayer times', bn: 'ঢাকার নামাজের সময়', ar: 'مواقيت صلاة دكا' } },
  fasting: { href: '/topics/fasting-ramadan', label: { en: 'What the Quran says about fasting', bn: 'রোজা সম্পর্কে কুরআন কী বলে', ar: 'الصيام في القرآن' } },
  duas: { href: '/dua', label: { en: 'Duas from the Quran & Sunnah', bn: 'কুরআন ও সুন্নাহর দোয়া', ar: 'الأدعية' } },
  charity: { href: '/topics/charity', label: { en: 'What the Quran says about charity', bn: 'দান-সদকা সম্পর্কে কুরআন কী বলে', ar: 'الصدقة في القرآن' } },
  zakat: { href: '/zakat-calculator', label: { en: 'Zakat calculator', bn: 'যাকাত ক্যালকুলেটর', ar: 'حاسبة الزكاة' } },
  forgiveness: { href: '/topics/repentance', label: { en: 'What the Quran says about repentance', bn: 'তওবা সম্পর্কে কুরআন কী বলে', ar: 'التوبة في القرآن' } },
}

export const EVENTS: Record<EventSlug, EventContent> = {
  'ramadan-start': {
    slug: 'ramadan-start', icon: 'crescent', attendance: 'Offline',
    name: { en: 'Ramadan', bn: 'রমজান', ar: 'رمضان' },
    alt: ['Ramadan start date', 'first day of Ramadan', '1 Ramadan', 'Ramzan', 'রমজান কবে শুরু', 'রোজা কবে শুরু', 'প্রথম রোজা'],
    hijriLabel: { en: '1 Ramadan', bn: '১ রমজান', ar: '١ رمضان' },
    summary: {
      en: 'Ramadan is the ninth month of the Hijri calendar, the month of fasting from dawn to sunset and the month in which the Quran began to be revealed; its first day is 1 Ramadan.',
      bn: 'রমজান হিজরি পঞ্জিকার নবম মাস — ভোর থেকে সূর্যাস্ত পর্যন্ত রোজা রাখার মাস এবং যে মাসে কুরআন নাজিল শুরু হয়; এর প্রথম দিন ১ রমজান।',
      ar: 'رمضان هو الشهر التاسع من التقويم الهجري، شهر الصيام الذي أُنزل فيه القرآن.',
    },
    what: [
      { en: 'Muslims fast every day of Ramadan from the start of Fajr until sunset (Maghrib), and spend more time in prayer, Quran recitation, charity and good character. The month lasts 29 or 30 days and ends with Eid al-Fitr.', bn: 'রমজানের প্রতিদিন ফজরের শুরু থেকে সূর্যাস্ত (মাগরিব) পর্যন্ত মুসলিমরা রোজা রাখে এবং নামাজ, কুরআন তিলাওয়াত, দান ও উত্তম চরিত্রে বেশি সময় দেয়। মাসটি ২৯ বা ৩০ দিনের হয় এবং ঈদুল ফিতরে শেষ হয়।' },
      { en: 'The first fast is on the day after the crescent of Ramadan is sighted (or the month of Sha’ban completes thirty days). That is why the start can differ by a day between countries: Saudi Arabia follows the Umm al-Qura calendar, while Bangladesh, India and Pakistan usually begin from their own crescent sighting, typically a day later.', bn: 'রমজানের চাঁদ দেখা গেলে (বা শা’বান ত্রিশ দিন পূর্ণ হলে) পরের দিন প্রথম রোজা। তাই দেশভেদে শুরুর দিনে এক দিনের পার্থক্য হতে পারে: সৌদি আরব উম্মুল কুরা ক্যালেন্ডার অনুসরণ করে, আর বাংলাদেশ, ভারত ও পাকিস্তানে সাধারণত নিজস্ব চাঁদ দেখার ভিত্তিতে — প্রায়ই একদিন পরে — শুরু হয়।' },
    ],
    observe: [
      { en: 'Taraweeh prayers begin on the evening before the first fast, and sehri (the pre-dawn meal) is eaten before Fajr.', bn: 'প্রথম রোজার আগের সন্ধ্যা থেকে তারাবির নামাজ শুরু হয় এবং ফজরের আগে সেহরি খাওয়া হয়।' },
      { en: 'Check the sehri and iftar times for your city on the Ramadan timetable pages.', bn: 'আপনার শহরের সেহরি ও ইফতারের সময় রমজানের সময়সূচির পাতায় দেখুন।' },
    ],
    quran: [
      { ref: '2:185', why: { en: 'The month of Ramadan, in which the Quran was revealed; whoever sights the month is to fast it.', bn: 'রমজান মাস, যাতে কুরআন নাজিল হয়েছে; যে মাসটি পায় সে যেন রোজা রাখে।' } },
      { ref: '2:183', why: { en: 'Fasting was prescribed so that believers may become mindful of Allah.', bn: 'রোজা ফরজ করা হয়েছে যাতে মুমিনরা তাকওয়া অর্জন করে।' } },
    ],
    hadith: ['sighting'],
    duas: ['dua-for-breaking-fast-iftar', 'dua-laylatul-qadr'],
    related: [L.ramadanPage, L.fasting, L.prayer, L.hijri],
    faq: [
      { q: { en: 'Is Ramadan decided by calculation or by moon sighting?', bn: 'রমজান কি হিসাব নাকি চাঁদ দেখে নির্ধারিত হয়?', ar: 'هل يثبت رمضان بالحساب أم بالرؤية؟' }, a: { en: 'The hadith in Sahih al-Bukhari 1909 links fasting and ending the fast to sighting the crescent. Saudi Arabia publishes the Umm al-Qura calendar in advance, while Bangladesh and many other countries announce the month after a national moon-sighting meeting. This site shows the Umm al-Qura date and an expected Bangladesh date; follow your national announcement.', bn: 'সহীহ বুখারী ১৯০৯ নম্বর হাদিসে রোজা শুরু ও শেষ করাকে চাঁদ দেখার সঙ্গে যুক্ত করা হয়েছে। সৌদি আরব আগে থেকে উম্মুল কুরা ক্যালেন্ডার প্রকাশ করে, আর বাংলাদেশসহ অনেক দেশ জাতীয় চাঁদ দেখা কমিটির সভার পর মাস ঘোষণা করে। এই সাইটে উম্মুল কুরা তারিখ ও বাংলাদেশের সম্ভাব্য তারিখ দেওয়া আছে; আপনার দেশের ঘোষণা অনুসরণ করুন।' } },
    ],
  },

  'laylatul-qadr': {
    slug: 'laylatul-qadr', icon: 'moon',
    name: { en: 'Laylatul Qadr', bn: 'শবে কদর (লাইলাতুল কদর)', ar: 'ليلة القدر' },
    alt: ['Laylat al-Qadr', 'Night of Decree', 'Night of Power', 'Shab-e-Qadr', 'Shab e Qadr 2027', 'শবে কদর কবে', 'লাইলাতুল কদর', 'শবে ক্বদর', '২৭ রমজানের রাত'],
    hijriLabel: { en: 'Night of 27 Ramadan (odd nights of the last ten)', bn: '২৭ রমজানের রাত (শেষ দশকের বেজোড় রাত)', ar: 'ليلة ٢٧ رمضان (الوتر من العشر الأواخر)' },
    attendance: 'Offline',
    summary: {
      en: 'Laylatul Qadr, the Night of Decree, is the night the Quran began to be revealed and is better than a thousand months; it is sought in the odd nights of the last ten nights of Ramadan, and many Muslims especially observe the 27th night.',
      bn: 'লাইলাতুল কদর (শবে কদর) সেই রাত যে রাতে কুরআন নাজিল শুরু হয় এবং যা হাজার মাসের চেয়ে উত্তম; এটি রমজানের শেষ দশকের বেজোড় রাতগুলোতে খোঁজা হয়, আর অনেক মুসলিম বিশেষভাবে ২৭তম রাত পালন করেন।',
      ar: 'ليلة القدر هي الليلة التي بدأ فيها نزول القرآن وهي خير من ألف شهر، وتُلتمس في الوتر من العشر الأواخر من رمضان.',
    },
    what: [
      { en: 'Surah al-Qadr describes the Night of Decree as better than a thousand months, a night in which the angels and the Spirit descend by Allah’s permission, and which is peace until the break of dawn.', bn: 'সূরা আল-কদরে এই রাতকে হাজার মাসের চেয়ে উত্তম বলা হয়েছে — এ রাতে আল্লাহর অনুমতিক্রমে ফেরেশতা ও রূহ (জিবরীল) অবতরণ করেন এবং ফজর পর্যন্ত এটি শান্তিময়।' },
      { en: 'The Quran does not name the exact night. The hadith directs believers to seek it in the odd nights of the last ten nights of Ramadan, so the nights of the 21st, 23rd, 25th, 27th and 29th are the focus. Many Muslims, especially in South Asia, give particular attention to the 27th night; others strive on all the odd nights or on every night of the last ten. Scholars have held different views, and Allah knows best, so this page lists every odd night.', bn: 'কুরআনে রাতটির নির্দিষ্ট তারিখ বলা নেই। হাদিসে রমজানের শেষ দশকের বেজোড় রাতে এটি খোঁজার নির্দেশ এসেছে — অর্থাৎ ২১, ২৩, ২৫, ২৭ ও ২৯তম রাত। অনেক মুসলিম, বিশেষ করে দক্ষিণ এশিয়ায়, ২৭তম রাতকে বিশেষ গুরুত্ব দেন; অন্যরা সব বেজোড় রাতে বা শেষ দশকের প্রতি রাতেই ইবাদত করেন। আলেমদের মতভেদ আছে এবং আল্লাহই ভালো জানেন, তাই এই পাতায় সব বেজোড় রাতের তারিখ দেওয়া হয়েছে।' },
      { en: 'An Islamic night belongs to the day that follows it: the “night of the 27th” begins at sunset on the evening of 26 Ramadan and lasts until Fajr. The dates below are the evenings on which each night begins.', bn: 'ইসলামি রাত পরের দিনের অন্তর্ভুক্ত: “২৭তম রাত” শুরু হয় ২৬ রমজানের সন্ধ্যায় (সূর্যাস্তের পর) এবং ফজর পর্যন্ত থাকে। নিচের তারিখগুলো সেই সন্ধ্যার তারিখ, যেদিন রাতটি শুরু হয়।' },
    ],
    observe: [
      { en: 'Pray, recite the Quran, make dhikr and ask for forgiveness during the night. The Prophet ﷺ taught ‘A’ishah a short dua for this night (below).', bn: 'রাতে নামাজ, কুরআন তিলাওয়াত, যিকির ও ক্ষমা প্রার্থনা করুন। নবী ﷺ আয়েশা (রা.)-কে এই রাতের জন্য একটি ছোট দোয়া শিখিয়েছেন (নিচে)।' },
    ],
    quran: [
      { ref: '97:1-5', why: { en: 'Surah al-Qadr: the Night of Decree is better than a thousand months.', bn: 'সূরা আল-কদর: কদরের রাত হাজার মাসের চেয়ে উত্তম।' } },
      { ref: '44:3', why: { en: 'The Quran was sent down on a blessed night.', bn: 'কুরআন এক বরকতময় রাতে নাজিল করা হয়েছে।' } },
    ],
    hadith: ['oddNights'],
    duas: ['dua-laylatul-qadr', 'dua-for-forgiveness'],
    related: [L.ramadanPage, L.forgiveness, L.hijri, L.prayer],
    faq: [
      { q: { en: 'Which night is Laylatul Qadr?', bn: 'শবে কদর কোন রাত?', ar: 'أي ليلة هي ليلة القدر؟' }, a: { en: 'It is not specified. The hadith (Sahih al-Bukhari 2017) tells us to seek it in the odd nights of the last ten nights of Ramadan. Many Muslims give special attention to the 27th night, but scholars differ and Allah knows best, so strive on all the odd nights.', bn: 'নির্দিষ্ট করে বলা নেই। হাদিসে (সহীহ বুখারী ২০১৭) রমজানের শেষ দশকের বেজোড় রাতে এটি খোঁজার কথা এসেছে। অনেক মুসলিম ২৭তম রাতকে বিশেষ গুরুত্ব দেন, তবে আলেমদের মতভেদ আছে এবং আল্লাহই ভালো জানেন — তাই সব বেজোড় রাতে চেষ্টা করুন।' } },
      { q: { en: 'What should I recite on Laylatul Qadr?', bn: 'শবে কদরে কী পড়ব?', ar: 'ماذا أقول في ليلة القدر؟' }, a: { en: '‘A’ishah asked what to say if she found the night, and the Prophet ﷺ taught: “Allahumma innaka ‘afuwwun tuhibbul-‘afwa fa‘fu ‘anni” (O Allah, You are the Pardoner and love to pardon, so pardon me) — Jami at-Tirmidhi 3513.', bn: 'আয়েশা (রা.) জানতে চেয়েছিলেন রাতটি পেলে কী বলবেন; নবী ﷺ শিখিয়েছেন: “আল্লাহুম্মা ইন্নাকা আফুউউন, তুহিব্বুল আফওয়া ফা’ফু আন্নী” (হে আল্লাহ, আপনি ক্ষমাশীল, ক্ষমা করতে ভালোবাসেন, অতএব আমাকে ক্ষমা করুন) — জামে তিরমিযী ৩৫১৩।' } },
    ],
  },

  'eid-al-fitr': {
    slug: 'eid-al-fitr', icon: 'sparkle', attendance: 'Offline',
    name: { en: 'Eid ul Fitr', bn: 'ঈদুল ফিতর', ar: 'عيد الفطر' },
    alt: ['Eid al-Fitr', 'Eid ul-Fitr', 'Eid al Fitr', 'Ramzan Eid', 'Eid 2027', 'রোজার ঈদ', 'ঈদুল ফিতর কবে', 'ঈদ কবে'],
    hijriLabel: { en: '1 Shawwal', bn: '১ শাওয়াল', ar: '١ شوال' },
    summary: {
      en: 'Eid al-Fitr, the “festival of breaking the fast”, is celebrated on 1 Shawwal, the first day after Ramadan.',
      bn: 'ঈদুল ফিতর — রোজা ভাঙার উৎসব — রমজানের পরের দিন, ১ শাওয়ালে উদযাপিত হয়।',
      ar: 'عيد الفطر يوم ١ شوال، أول أيام بعد انتهاء شهر رمضان.',
    },
    what: [
      { en: 'Eid al-Fitr marks the end of the month of fasting. Muslims gather for the special Eid prayer in the morning, glorify Allah with takbir, visit family and friends and share food. Fasting is not permitted on this day.', bn: 'ঈদুল ফিতর রোজার মাসের সমাপ্তি চিহ্নিত করে। মুসলিমরা সকালে বিশেষ ঈদের নামাজে জমায়েত হন, তাকবির পাঠে আল্লাহর বড়ত্ব ঘোষণা করেন, আত্মীয়-বন্ধুদের সঙ্গে দেখা করেন ও খাবার ভাগ করে নেন। এই দিনে রোজা রাখা জায়েজ নয়।' },
      { en: 'The date depends on sighting the crescent of Shawwal, or completing thirty days of Ramadan. Saudi Arabia usually follows the Umm al-Qura date; in Bangladesh, India and Pakistan Eid is frequently a day later. The date is confirmed only by your national announcement.', bn: 'তারিখ নির্ভর করে শাওয়ালের চাঁদ দেখা বা রমজানের ত্রিশ দিন পূর্ণ হওয়ার উপর। সৌদি আরব সাধারণত উম্মুল কুরা তারিখ অনুসরণ করে; বাংলাদেশ, ভারত ও পাকিস্তানে ঈদ প্রায়ই একদিন পরে হয়। আপনার দেশের সরকারি ঘোষণাতেই তারিখ নিশ্চিত হয়।' },
    ],
    observe: [
      { en: 'The Eid prayer is held in the morning after sunrise; check the time announced by your local masjid or Eid ground.', bn: 'ঈদের নামাজ সূর্যোদয়ের পর সকালে হয়; আপনার স্থানীয় মসজিদ বা ঈদগাহের ঘোষিত সময় দেখুন।' },
    ],
    quran: [
      { ref: '2:185', why: { en: 'Complete the period of fasting and glorify Allah for having guided you, so that you may be grateful.', bn: 'রোজার সংখ্যা পূর্ণ করো, আল্লাহর বড়ত্ব ঘোষণা করো তিনি তোমাদের পথ দেখিয়েছেন বলে, আর যাতে তোমরা কৃতজ্ঞ হও।' } },
    ],
    hadith: ['eidNoFast', 'sighting'],
    duas: ['dua-for-breaking-fast-iftar'],
    related: [L.ramadanPage, L.charity, L.hijri, L.prayer],
    faq: [
      { q: { en: 'Is Eid al-Fitr the same day everywhere?', bn: 'ঈদুল ফিতর কি সব দেশে একই দিনে?', ar: 'هل عيد الفطر في يوم واحد في كل البلاد؟' }, a: { en: 'Not always. Countries that follow local moon sighting can differ from Saudi Arabia (Umm al-Qura) by a day, and Bangladesh is usually a day later. Follow your national announcement.', bn: 'সবসময় নয়। যেসব দেশ স্থানীয় চাঁদ দেখার উপর নির্ভর করে তাদের সঙ্গে সৌদি আরবের (উম্মুল কুরা) একদিনের পার্থক্য হতে পারে; বাংলাদেশে সাধারণত একদিন পরে হয়। আপনার দেশের ঘোষণা অনুসরণ করুন।' } },
    ],
  },

  'day-of-arafah': {
    slug: 'day-of-arafah', icon: 'kaaba', attendance: 'Offline',
    name: { en: 'Day of Arafah', bn: 'আরাফার দিন', ar: 'يوم عرفة' },
    alt: ['Arafat Day', 'Yawm Arafah', 'Arafa Day', '9 Dhul Hijjah', 'আরাফা দিবস', 'আরাফার রোজা', 'আরাফাতের দিন', 'জিলহজের ৯ তারিখ'],
    hijriLabel: { en: '9 Dhu al-Hijjah', bn: '৯ জিলহজ', ar: '٩ ذو الحجة' },
    summary: {
      en: 'The Day of Arafah is 9 Dhu al-Hijjah, the day pilgrims stand at the plain of Arafat during Hajj; for everyone else it is a day of fasting and supplication, the day before Eid al-Adha in Saudi Arabia.',
      bn: 'আরাফার দিন ৯ জিলহজ — হজের সময় হাজীরা এদিন আরাফার ময়দানে অবস্থান করেন; অন্যদের জন্য এটি রোজা ও দোয়ার দিন, সৌদি আরবে ঈদুল আজহার আগের দিন।',
      ar: 'يوم عرفة هو التاسع من ذي الحجة، يقف فيه الحجاج بعرفة.',
    },
    what: [
      { en: 'Standing at Arafat is the central rite of Hajj. For Muslims who are not performing Hajj, fasting on the Day of Arafah is recommended: the Prophet ﷺ said it expiates the sins of the previous and the coming year (Sahih Muslim 1162).', bn: 'আরাফায় অবস্থান হজের প্রধান রুকন। যারা হজ করছেন না তাদের জন্য আরাফার দিনে রোজা রাখা মুস্তাহাব: নবী ﷺ বলেছেন এটি আগের ও পরের এক বছরের গুনাহের কাফফারা (সহীহ মুসলিম ১১৬২)।' },
      { en: 'Which date to fast: the Saudi date is tied to the day pilgrims are at Arafat, while Bangladesh and others commonly begin Dhu al-Hijjah from their own sighting, usually a day later. Some Muslims abroad fast with the Saudi date, others on the 9th by their country’s calendar; scholars differ, so follow your local masjid or national announcement. The table shows both dates.', bn: 'কোন তারিখে রোজা: সৌদি তারিখ হাজীদের আরাফায় অবস্থানের দিনের সঙ্গে যুক্ত; আর বাংলাদেশসহ অনেক দেশে জিলহজ মাস নিজস্ব চাঁদ দেখার ভিত্তিতে — সাধারণত একদিন পরে — শুরু হয়। কেউ সৌদি তারিখ অনুসরণ করে রোজা রাখেন, কেউ নিজ দেশের ৯ জিলহজে; আলেমদের মতভেদ আছে, তাই স্থানীয় মসজিদ বা সরকারি ঘোষণা অনুসরণ করুন। নিচের সারণিতে দুটি তারিখই দেওয়া আছে।' },
    ],
    observe: [
      { en: 'Make plenty of dua, dhikr and istighfar on this day.', bn: 'এই দিনে বেশি করে দোয়া, যিকির ও ইসতিগফার করুন।' },
    ],
    quran: [
      { ref: '2:198-199', why: { en: 'The verses on departing from Arafat: remember Allah, and ask His forgiveness.', bn: 'আরাফা থেকে প্রস্থানের আয়াত: আল্লাহকে স্মরণ করো এবং তাঁর কাছে ক্ষমা চাও।' } },
    ],
    hadith: ['arafahFast'],
    duas: ['sayyidul-istighfar', 'dua-for-forgiveness'],
    related: [L.forgiveness, L.duas, L.hijri, L.prayer],
    faq: [
      { q: { en: 'Should I fast on the Saudi date or the Bangladesh date?', bn: 'সৌদি তারিখে নাকি বাংলাদেশের তারিখে রোজা রাখব?', ar: 'هل أصوم يوم عرفة بتاريخ السعودية أم بلدي؟' }, a: { en: 'Scholars differ. Some say to follow the day pilgrims are at Arafat (the Saudi date); others say to follow your own country’s moon sighting for the 9th of Dhu al-Hijjah. Ask your local scholar or follow your national announcement.', bn: 'আলেমদের মতভেদ আছে। কেউ বলেন হাজীরা যেদিন আরাফায় থাকেন (সৌদি তারিখ) সেদিন; কেউ বলেন নিজ দেশের চাঁদ দেখার ভিত্তিতে ৯ জিলহজে। আপনার স্থানীয় আলেমের পরামর্শ নিন বা সরকারি ঘোষণা অনুসরণ করুন।' } },
    ],
  },

  'eid-al-adha': {
    slug: 'eid-al-adha', icon: 'mosque', attendance: 'Offline',
    name: { en: 'Eid ul Adha', bn: 'ঈদুল আজহা', ar: 'عيد الأضحى' },
    alt: ['Eid al-Adha', 'Eid ul-Adha', 'Eid al Adha', 'Bakrid', 'Bakra Eid', 'Qurbani Eid', 'Festival of Sacrifice', 'কোরবানির ঈদ', 'ঈদুল আযহা', 'কুরবানি ঈদ কবে', 'ঈদুল আজহা কবে'],
    hijriLabel: { en: '10 Dhu al-Hijjah', bn: '১০ জিলহজ', ar: '١٠ ذو الحجة' },
    summary: {
      en: 'Eid al-Adha, the “festival of sacrifice”, is celebrated on 10 Dhu al-Hijjah, the day after the Day of Arafah, remembering Ibrahim’s devotion to Allah.',
      bn: 'ঈদুল আজহা — কোরবানির ঈদ — ১০ জিলহজে, আরাফার দিনের পরের দিন, ইবরাহীম (আ.)-এর আল্লাহর প্রতি আনুগত্যের স্মরণে উদযাপিত হয়।',
      ar: 'عيد الأضحى في العاشر من ذي الحجة، بعد يوم عرفة.',
    },
    what: [
      { en: 'Eid al-Adha falls during Hajj and recalls Prophet Ibrahim’s readiness to sacrifice for Allah, when Allah ransomed his son with a great sacrifice (Quran 37:107). Muslims pray the Eid prayer, and those who can afford it offer a Qurbani animal and share the meat with family, neighbours and the poor (22:28, 22:37).', bn: 'ঈদুল আজহা হজের সময় আসে এবং ইবরাহীম (আ.)-এর আল্লাহর জন্য উৎসর্গের প্রস্তুতি স্মরণ করায়, যখন আল্লাহ তাঁর পুত্রকে এক মহান কোরবানির বিনিময়ে মুক্ত করেন (কুরআন ৩৭:১০৭)। মুসলিমরা ঈদের নামাজ আদায় করেন এবং সামর্থ্যবানরা কোরবানি করে মাংস পরিবার, প্রতিবেশী ও গরিবদের মধ্যে বণ্টন করেন (২২:২৮, ২২:৩৭)।' },
      { en: 'Fasting is not permitted on the day of Eid, nor on the three days of Tashreeq (11–13 Dhu al-Hijjah) that follow, which are days of eating, drinking and remembering Allah (Sahih Muslim 1141). As with the other Eid, the date depends on crescent sighting: Bangladesh is usually a day after Saudi Arabia.', bn: 'ঈদের দিনে এবং পরের তিন দিন আইয়ামে তাশরীকে (১১–১৩ জিলহজ) রোজা রাখা জায়েজ নয়; এগুলো পানাহার ও আল্লাহর যিকিরের দিন (সহীহ মুসলিম ১১৪১)। অন্য ঈদের মতোই তারিখ চাঁদ দেখার উপর নির্ভর করে: বাংলাদেশে সাধারণত সৌদি আরবের একদিন পরে হয়।' },
    ],
    observe: [
      { en: 'Offer the Eid prayer, then Qurbani if you are able; check your local masjid for the Eid prayer time.', bn: 'ঈদের নামাজ আদায় করুন, সামর্থ্য থাকলে কোরবানি দিন; ঈদের নামাজের সময়ের জন্য স্থানীয় মসজিদে খোঁজ নিন।' },
    ],
    quran: [
      { ref: '22:28', why: { en: 'Mention the name of Allah on the known days over the sacrificial animals, eat of them and feed the poor.', bn: 'নির্দিষ্ট দিনগুলোতে পশুর উপর আল্লাহর নাম নাও, তা থেকে খাও এবং অভাবীকে খাওয়াও।' } },
      { ref: '22:37', why: { en: 'It is not the meat or blood that reaches Allah, but piety from you.', bn: 'আল্লাহর কাছে পৌঁছায় না এর গোশত বা রক্ত, পৌঁছায় তোমাদের তাকওয়া।' } },
      { ref: '37:107', why: { en: 'Allah ransomed Ibrahim’s son with a great sacrifice.', bn: 'আমি এক মহান কোরবানির বিনিময়ে তাঁকে মুক্ত করলাম।' } },
      { ref: '108:2', why: { en: '“So pray to your Lord and offer sacrifice.”', bn: '“অতএব তোমার রবের উদ্দেশ্যে নামাজ পড়ো ও কোরবানি করো।”' } },
    ],
    hadith: ['eidNoFast', 'tashreeq'],
    duas: ['dua-for-forgiveness'],
    related: [L.duas, L.charity, L.hijri, L.zakat],
    faq: [
      { q: { en: 'How many days after Day of Arafah is Eid al-Adha?', bn: 'আরাফার দিনের কত দিন পর ঈদুল আজহা?', ar: 'كم يومًا بعد عرفة يكون عيد الأضحى؟' }, a: { en: 'Eid al-Adha is the very next day: Arafah is 9 Dhu al-Hijjah and Eid is 10 Dhu al-Hijjah.', bn: 'পরের দিনই: আরাফার দিন ৯ জিলহজ এবং ঈদুল আজহা ১০ জিলহজ।' } },
    ],
  },

  'islamic-new-year': {
    slug: 'islamic-new-year', icon: 'calendar', attendance: 'Offline',
    name: { en: 'Islamic New Year', bn: 'ইসলামি নববর্ষ (হিজরি নববর্ষ)', ar: 'رأس السنة الهجرية' },
    alt: ['Hijri New Year', 'Islamic New Year', '1 Muharram', 'Muharram 1', 'Hijri year', 'Al-Hijra', 'হিজরি নববর্ষ', 'ইসলামিক নিউ ইয়ার', '১ মুহাররম', 'হিজরি নতুন বছর কবে'],
    hijriLabel: { en: '1 Muharram', bn: '১ মুহাররম', ar: '١ محرم' },
    summary: {
      en: 'The Islamic New Year is 1 Muharram, the first day of the first month of the Hijri calendar, which counts years from the Prophet’s migration (hijrah) to Madinah.',
      bn: 'ইসলামি নববর্ষ ১ মুহাররম — হিজরি পঞ্জিকার প্রথম মাসের প্রথম দিন; এই পঞ্জিকা নবী ﷺ-এর মদিনায় হিজরত থেকে বছর গণনা করে।',
      ar: 'رأس السنة الهجرية هو ١ محرم، أول أيام السنة الهجرية.',
    },
    what: [
      { en: 'The Hijri calendar is lunar: twelve months of 29 or 30 days, about 354 days a year, so every Islamic date moves roughly 10–11 days earlier against the Gregorian calendar each year. Muharram is one of the four sacred months mentioned in the Quran (9:36).', bn: 'হিজরি পঞ্জিকা চান্দ্র: ১২টি মাস, প্রতিটি ২৯ বা ৩০ দিনের, বছরে প্রায় ৩৫৪ দিন — তাই প্রতি বছর ইসলামি তারিখ ইংরেজি তারিখের তুলনায় প্রায় ১০–১১ দিন এগিয়ে আসে। মুহাররম কুরআনে উল্লিখিত চারটি সম্মানিত মাসের একটি (৯:৩৬)।' },
      { en: 'No specific act of worship is prescribed for the day itself, and scholars differ about whether to mark it, so this page simply gives the calendar date. Fasting in Muharram is encouraged: the Prophet ﷺ called it the best fast after Ramadan (Sahih Muslim 1163). See also Ashura on 10 Muharram.', bn: 'দিনটির জন্য নির্দিষ্ট কোনো ইবাদত নির্ধারিত নেই এবং এটি পালন করা নিয়ে আলেমদের মতভেদ আছে, তাই এই পাতায় শুধু পঞ্জিকার তারিখ দেওয়া হলো। মুহাররমে রোজা রাখা উৎসাহিত: নবী ﷺ একে রমজানের পর সর্বোত্তম রোজা বলেছেন (সহীহ মুসলিম ১১৬৩)। ১০ মুহাররমের আশুরাও দেখুন।' },
      { en: 'The first Hijri year began with the Prophet’s migration from Makkah to Madinah, and the calendar was adopted under the caliph ‘Umar ibn al-Khattab. Like the other dates, the start of Muharram depends on moon sighting, so Bangladesh is usually a day after Saudi Arabia.', bn: 'প্রথম হিজরি সাল নবী ﷺ-এর মক্কা থেকে মদিনায় হিজরত থেকে শুরু হয়, এবং খলিফা উমর ইবনুল খাত্তাব (রা.)-এর সময়ে এই পঞ্জিকা গৃহীত হয়। অন্য তারিখগুলোর মতো মুহাররমের শুরুও চাঁদ দেখার উপর নির্ভর করে, তাই বাংলাদেশে সাধারণত সৌদি আরবের একদিন পরে হয়।' },
    ],
    observe: [],
    quran: [
      { ref: '9:36', why: { en: 'The number of months with Allah is twelve, of which four are sacred.', bn: 'আল্লাহর কাছে মাসের সংখ্যা বারোটি, তার মধ্যে চারটি সম্মানিত।' } },
    ],
    hadith: ['muharramFast'],
    duas: ['dua-for-forgiveness'],
    related: [L.hijri, L.duas, L.prayer],
    faq: [
      { q: { en: 'Is the Islamic New Year a religious festival?', bn: 'ইসলামি নববর্ষ কি ধর্মীয় উৎসব?', ar: 'هل رأس السنة الهجرية عيد؟' }, a: { en: 'It is the start of the Hijri calendar. No specific rites are prescribed for the day, and scholars differ on how, or whether, to mark it. Fasting in Muharram is encouraged (Sahih Muslim 1163).', bn: 'এটি হিজরি পঞ্জিকার সূচনা। দিনটির জন্য নির্দিষ্ট কোনো ইবাদত নির্ধারিত নেই এবং এটি কীভাবে বা আদৌ পালন করা হবে তা নিয়ে আলেমদের মতভেদ আছে। মুহাররমে রোজা রাখা উৎসাহিত (সহীহ মুসলিম ১১৬৩)।' } },
    ],
  },

  ashura: {
    slug: 'ashura', icon: 'moon', attendance: 'Offline',
    name: { en: 'Ashura', bn: 'আশুরা', ar: 'عاشوراء' },
    alt: ['Day of Ashura', 'Ashura fast', '10 Muharram', 'Ashoora', 'Tasu’a and Ashura', 'আশুরা কবে', 'আশুরার রোজা', '১০ মুহাররম', 'আশুরার দিন'],
    hijriLabel: { en: '10 Muharram', bn: '১০ মুহাররম', ar: '١٠ محرم' },
    summary: {
      en: 'Ashura is 10 Muharram, a day on which the Prophet ﷺ fasted and encouraged fasting, together with the 9th, in memory of Allah saving Musa and the Children of Israel.',
      bn: 'আশুরা ১০ মুহাররম — মূসা (আ.) ও বনী ইসরাঈলকে আল্লাহর রক্ষার স্মরণে নবী ﷺ এদিন রোজা রেখেছেন এবং ৯ তারিখসহ রোজা রাখতে উৎসাহিত করেছেন।',
      ar: 'عاشوراء هو ١٠ محرم، يوم صامه النبي ﷺ وحث على صيامه.',
    },
    what: [
      { en: 'Ibn ‘Abbas reported that the Prophet ﷺ found the Jews of Madinah fasting on Ashura because Allah saved the Children of Israel on that day; he said “We have more claim over Musa than you”, fasted it and ordered the Muslims to fast it (Sahih al-Bukhari 2004). The Quran recounts that deliverance, e.g. Allah parting the sea (2:50).', bn: 'ইবনে আব্বাস (রা.) বর্ণনা করেন, নবী ﷺ মদিনায় ইহুদিদের আশুরার দিন রোজা রাখতে দেখেন, কারণ এদিন আল্লাহ বনী ইসরাঈলকে রক্ষা করেছিলেন; তিনি বলেন, “মূসার ব্যাপারে তোমাদের চেয়ে আমরাই অধিক হকদার”, তিনি রোজা রাখেন এবং মুসলিমদের রোজা রাখতে বলেন (সহীহ বুখারী ২০০৪)। কুরআনে সেই মুক্তির বর্ণনা আছে, যেমন সাগর দুই ভাগ করা (২:৫০)।' },
      { en: 'The Prophet ﷺ also said that if he lived to the next year he would fast the ninth as well (Sahih Muslim 1134), so many Muslims fast the 9th and 10th of Muharram. Fasting Ashura expiates the sins of the previous year (Sahih Muslim 1162). Fasting is voluntary.', bn: 'নবী ﷺ আরও বলেছেন, আগামী বছর বেঁচে থাকলে তিনি নবম তারিখেও রোজা রাখবেন (সহীহ মুসলিম ১১৩৪), তাই অনেক মুসলিম ৯ ও ১০ মুহাররম রোজা রাখেন। আশুরার রোজা আগের এক বছরের গুনাহের কাফফারা (সহীহ মুসলিম ১১৬২)। রোজাটি নফল।' },
      { en: 'Ashura is also observed by Shia Muslims as a day of mourning for the martyrdom of Husayn ibn ‘Ali at Karbala in 61 AH; this page covers only the date and the fast reported in the hadith collections cited.', bn: 'শিয়া মুসলিমরাও ৬১ হিজরিতে কারবালায় হুসাইন ইবনে আলী (রা.)-এর শাহাদাতের স্মরণে আশুরা শোকের দিন হিসেবে পালন করেন; এই পাতায় শুধু তারিখ ও উল্লিখিত হাদিস গ্রন্থে বর্ণিত রোজার কথা আছে।' },
    ],
    observe: [
      { en: 'To be safe about the date, many people fast the 9th and 10th (and some add the 11th). Dates for both days are in the table.', bn: 'তারিখের বিষয়ে নিশ্চিত থাকতে অনেকে ৯ ও ১০ (কেউ কেউ ১১) তারিখে রোজা রাখেন। সারণিতে দুই দিনের তারিখই দেওয়া আছে।' },
    ],
    quran: [
      { ref: '9:36', why: { en: 'Muharram is one of the four sacred months.', bn: 'মুহাররম চার সম্মানিত মাসের একটি।' } },
      { ref: '2:50', why: { en: 'Allah parted the sea, saved the Children of Israel and drowned Pharaoh’s people.', bn: 'আল্লাহ সাগর দুই ভাগ করে বনী ইসরাঈলকে রক্ষা করেন এবং ফেরাউনের লোকদের ডুবিয়ে দেন।' } },
    ],
    hadith: ['ashuraMusa', 'ashuraNinth', 'arafahFast', 'muharramFast'],
    duas: ['dua-for-forgiveness'],
    related: [L.fasting, L.hijri, L.prayer, L.duas],
    faq: [
      { q: { en: 'Should I fast on the 9th and 10th of Muharram?', bn: '৯ ও ১০ মুহাররম কি দুই দিন রোজা রাখব?', ar: 'هل أصوم التاسع والعاشر من محرم؟' }, a: { en: 'Fasting the 10th is established (Sahih al-Bukhari 2004), and the Prophet ﷺ expressed the intention to fast the 9th too (Sahih Muslim 1134), so many Muslims fast both. It is voluntary.', bn: '১০ তারিখে রোজা রাখা প্রমাণিত (সহীহ বুখারী ২০০৪) এবং নবী ﷺ ৯ তারিখেও রোজা রাখার ইচ্ছা প্রকাশ করেছেন (সহীহ মুসলিম ১১৩৪), তাই অনেকে দুই দিনই রাখেন। রোজাটি নফল।' } },
    ],
  },

  'white-days': {
    slug: 'white-days', icon: 'moon', attendance: 'Offline',
    name: { en: 'White Days (Ayyam al-Bid)', bn: 'আইয়ামে বীজ (চাঁদের ১৩-১৪-১৫ তারিখ)', ar: 'الأيام البيض' },
    alt: ['Ayyam al-Bid', 'White days fasting', 'Ayyam ul Beed', 'Ayyamul Bid', '13 14 15 fasting', 'monthly sunnah fasting', 'আইয়ামে বীজের রোজা', 'আইয়ামুল বীজ', 'চাঁদের ১৩ ১৪ ১৫ তারিখের রোজা', 'প্রতি মাসের তিন রোজা'],
    hijriLabel: { en: '13, 14 and 15 of each Hijri month', bn: 'প্রতি হিজরি মাসের ১৩, ১৪ ও ১৫ তারিখ', ar: '١٣ و١٤ و١٥ من كل شهر هجري' },
    summary: {
      en: 'The white days (Ayyam al-Bid) are the 13th, 14th and 15th of every Hijri month, the nights of the bright full moon, on which fasting is recommended each month.',
      bn: 'আইয়ামে বীজ (শুভ্র দিন) প্রতি হিজরি মাসের ১৩, ১৪ ও ১৫ তারিখ — উজ্জ্বল পূর্ণিমার রাতগুলো — যেদিন প্রতি মাসে নফল রোজা রাখা মুস্তাহাব।',
      ar: 'الأيام البيض هي الثالث عشر والرابع عشر والخامس عشر من كل شهر هجري.',
    },
    what: [
      { en: 'The Prophet ﷺ advised Abu Dharr: “When you fast three days of the month, fast the thirteenth, fourteenth and fifteenth” (Jami at-Tirmidhi 761), and he advised Abu Hurayrah to fast three days every month (Sahih al-Bukhari 1981). Fasting these days is voluntary.', bn: 'নবী ﷺ আবু যার (রা.)-কে বলেছেন: “মাসে তিন দিন রোজা রাখলে ১৩, ১৪ ও ১৫ তারিখে রাখো” (জামে তিরমিযী ৭৬১), এবং আবু হুরায়রা (রা.)-কে প্রতি মাসে তিন দিন রোজা রাখার উপদেশ দিয়েছেন (সহীহ বুখারী ১৯৮১)। এই রোজা নফল।' },
      { en: 'The table lists the white days of ten months of each year. Ramadan is left out because the whole month is fasted, and Dhu al-Hijjah is left out because the 13th is among the days of Tashreeq on which fasting is not permitted (Sahih Muslim 1141); scholars differ on how to make up the white days that month.', bn: 'সারণিতে প্রতি বছরের দশটি মাসের আইয়ামে বীজ দেওয়া আছে। রমজান বাদ দেওয়া হয়েছে কারণ পুরো মাসই রোজা, আর জিলহজ বাদ দেওয়া হয়েছে কারণ ১৩ তারিখ আইয়ামে তাশরীকের অন্তর্গত, যে দিনগুলোতে রোজা জায়েজ নয় (সহীহ মুসলিম ১১৪১); ওই মাসে আইয়ামে বীজ কীভাবে পূরণ করা হবে তা নিয়ে আলেমদের মতভেদ আছে।' },
      { en: 'Dates follow the Umm al-Qura calendar; in Bangladesh and South Asia the Hijri month usually begins a day later, so the white days are expected a day later too.', bn: 'তারিখ উম্মুল কুরা অনুযায়ী; বাংলাদেশ ও দক্ষিণ এশিয়ায় হিজরি মাস সাধারণত একদিন পরে শুরু হয়, তাই আইয়ামে বীজও একদিন পরে আশা করা হয়।' },
    ],
    observe: [],
    quran: [
      { ref: '2:184', why: { en: 'Fasting is prescribed for a limited number of days, and whoever volunteers good, it is better for him; to fast is better for you.', bn: 'নির্দিষ্ট কয়েক দিন রোজা; যে স্বেচ্ছায় আরও ভালো কাজ করে তা তার জন্য উত্তম, আর রোজা রাখা তোমাদের জন্য কল্যাণকর।' } },
      { ref: '33:35', why: { en: 'Among those for whom Allah has prepared forgiveness and a great reward are the fasting men and women.', bn: 'যাদের জন্য আল্লাহ ক্ষমা ও মহা প্রতিদান প্রস্তুত রেখেছেন, তাদের মধ্যে রোজাদার পুরুষ ও নারী।' } },
    ],
    hadith: ['whiteDays', 'threeDays', 'tashreeq'],
    duas: ['dua-for-breaking-fast-iftar'],
    related: [L.fasting, L.hijri, L.prayer, L.ramadanPage],
    faq: [
      { q: { en: 'Why are they called the white days?', bn: 'এগুলোকে আইয়ামে বীজ (শুভ্র দিন) বলা হয় কেন?', ar: 'لماذا سُميت الأيام البيض؟' }, a: { en: 'They are the days around the full moon, when the moon lights the whole night; “bid” means white in Arabic.', bn: 'এগুলো পূর্ণিমার আশপাশের দিন, যখন চাঁদ পুরো রাত আলোকিত করে; আরবিতে “বীজ” অর্থ সাদা।' } },
      { q: { en: 'Do I have to fast all three?', bn: 'তিন দিনই রোজা রাখতে হবে কি?', ar: 'هل يلزم صيام الأيام الثلاثة؟' }, a: { en: 'No, it is a voluntary (sunnah) fast. The hadith recommends three days of the month and names these days.', bn: 'না, এটি নফল (সুন্নাহ) রোজা। হাদিসে মাসে তিন দিনের কথা এসেছে এবং এই দিনগুলোর নাম বলা হয়েছে।' } },
    ],
  },
}

export const eventContent = (slug: EventSlug) => EVENTS[slug]
export const EVENT_LIST = EVENT_SLUGS.map((s) => EVENTS[s])

/** Short Bangla names for titles, headings and descriptions. */
export const BN_SHORT: Record<EventSlug, string> = {
  'ramadan-start': 'রমজান', 'laylatul-qadr': 'শবে কদর', 'eid-al-fitr': 'ঈদুল ফিতর', 'day-of-arafah': 'আরাফার দিন',
  'eid-al-adha': 'ঈদুল আজহা', 'islamic-new-year': 'ইসলামি নববর্ষ', ashura: 'আশুরা', 'white-days': 'আইয়ামে বীজ',
}

/** Page <title>: page language first, the other language after “|” (e.g. “Eid ul Adha 2027 Date in Bangladesh & Saudi Arabia | ঈদুল আজহা ২০২৭ কবে”). */
export function eventTitle(slug: EventSlug, year: number | null, bnYear: string, locale: 'en' | 'bn'): string {
  const y = year ?? ''
  const en: Record<EventSlug, string> = {
    'ramadan-start': year ? `Ramadan ${y} Start Date in Bangladesh & Saudi Arabia` : 'Ramadan Start Date — When Does Ramadan Begin?',
    'laylatul-qadr': year ? `Laylatul Qadr ${y} Date (27th Night) in Bangladesh & Saudi Arabia` : 'Laylatul Qadr Date — Odd Nights & 27th Night',
    'eid-al-fitr': year ? `Eid ul Fitr ${y} Date in Bangladesh & Saudi Arabia` : 'Eid ul Fitr Date — When Is Eid al-Fitr?',
    'day-of-arafah': year ? `Day of Arafah ${y} Date in Bangladesh & Saudi Arabia` : 'Day of Arafah Date — When Is Arafat Day?',
    'eid-al-adha': year ? `Eid ul Adha ${y} Date in Bangladesh & Saudi Arabia` : 'Eid ul Adha Date — When Is Eid al-Adha?',
    'islamic-new-year': year ? `Islamic New Year ${y} (1 Muharram) Date` : 'Islamic New Year Date — 1 Muharram',
    ashura: year ? `Ashura ${y} Date (10 Muharram) in Bangladesh & Saudi Arabia` : 'Ashura Date — 10 Muharram',
    'white-days': year ? `White Days (Ayyam al-Bid) ${y} — Monthly Fasting Dates` : 'White Days (Ayyam al-Bid) — Monthly Fasting Dates',
  }
  const b = BN_SHORT[slug]
  const bnShort = slug === 'white-days' ? `${b}${year ? ` ${bnYear}` : ''} রোজার তারিখ` : slug === 'ramadan-start' ? `${b}${year ? ` ${bnYear}` : ''} কবে শুরু` : `${b}${year ? ` ${bnYear}` : ''} কবে`
  const bnFull: Record<EventSlug, string> = {
    'ramadan-start': `${bnShort}? বাংলাদেশ ও সৌদি আরবের তারিখ`,
    'laylatul-qadr': `${bnShort}? লাইলাতুল কদরের তারিখ`,
    'eid-al-fitr': `${bnShort}? বাংলাদেশ ও সৌদি আরবের তারিখ`,
    'day-of-arafah': `${bnShort}? ৯ জিলহজের তারিখ`,
    'eid-al-adha': `${bnShort}? বাংলাদেশ ও সৌদি আরবের তারিখ`,
    'islamic-new-year': `${bnShort}? ১ মুহাররমের তারিখ`,
    ashura: `${bnShort}? ১০ মুহাররমের তারিখ`,
    'white-days': `${bnShort} — প্রতি মাসের ১৩, ১৪, ১৫ তারিখ`,
  }
  return locale === 'bn' ? `${bnFull[slug]} | ${en[slug].split(' in Bangladesh')[0]}` : `${en[slug]} | ${bnShort}`
}
