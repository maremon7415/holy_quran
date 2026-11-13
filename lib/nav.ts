export interface Tr { en: string; bn: string; ar: string }
export interface NavItem {
  href: string
  icon: string // /public/icons/ui/<icon>.png
  label: Tr
  desc?: Tr
}

export const primaryNav: NavItem[] = [
  { href: '/quran', icon: 'quran', label: { en: 'Quran', bn: 'কুরআন', ar: 'القرآن' } },
  { href: '/listen', icon: 'listen', label: { en: 'Listen', bn: 'তিলাওয়াত', ar: 'استماع' } },
  { href: '/hifz', icon: 'hifz', label: { en: 'Hifz', bn: 'হিফজ', ar: 'الحفظ' } },
  { href: '/topics', icon: 'topics', label: { en: 'Topics', bn: 'বিষয়ভিত্তিক', ar: 'الموضوعات' } },
  { href: '/dua', icon: 'dua', label: { en: 'Duas', bn: 'দোয়া', ar: 'الأدعية' } },
]

export const moreNav: NavItem[] = [
  { href: '/ask', icon: 'sparkle', label: { en: 'Ask the Quran', bn: 'কুরআনে প্রশ্ন করুন', ar: 'اسأل القرآن' }, desc: { en: 'Find verses by meaning', bn: 'অর্থ অনুযায়ী আয়াত খুঁজুন', ar: 'ابحث عن الآيات بالمعنى' } },
  { href: '/names-of-allah', icon: 'names', label: { en: '99 Names of Allah', bn: 'আল্লাহর ৯৯ নাম', ar: 'أسماء الله الحسنى' }, desc: { en: 'Asma ul Husna with meanings', bn: 'আসমাউল হুসনা ও অর্থ', ar: 'الأسماء الحسنى ومعانيها' } },
  { href: '/hadith', icon: 'read', label: { en: 'Hadith', bn: 'হাদিস', ar: 'الحديث' }, desc: { en: 'Bukhari, Muslim & more with Bangla', bn: 'বুখারী, মুসলিমসহ বাংলা অনুবাদ', ar: 'البخاري ومسلم وغيرهما' } },
  { href: '/learn', icon: 'tajweed', label: { en: 'Learn', bn: 'শিক্ষা', ar: 'تعلّم' }, desc: { en: 'Salah, wudu, tajweed, 6 kalimas & Arabic alphabet', bn: 'নামাজ, অজু, তাজবীদ, ৬ কালেমা ও আরবি বর্ণমালা', ar: 'الصلاة والوضوء والتجويد والكلمات الست والحروف' } },
  { href: '/prayer-times', icon: 'prayer', label: { en: 'Prayer Times', bn: 'নামাজের সময়', ar: 'مواقيت الصلاة' }, desc: { en: 'Accurate times for your city', bn: 'আপনার শহরের সঠিক সময়', ar: 'مواقيت دقيقة لمدينتك' } },
  { href: '/ramadan', icon: 'crescent', label: { en: 'Ramadan Timetable', bn: 'রমজানের সময়সূচি', ar: 'جدول رمضان' }, desc: { en: 'Sehri & iftar for every city', bn: 'প্রতি শহরের সেহরি ও ইফতার', ar: 'السحور والإفطار لكل مدينة' } },
  { href: '/events', icon: 'calendar', label: { en: 'Islamic Events', bn: 'ইসলামি দিবস', ar: 'المناسبات الإسلامية' }, desc: { en: 'Eid, Ramadan, Laylatul Qadr dates', bn: 'ঈদ, রমজান, শবে কদরের তারিখ', ar: 'مواعيد العيد ورمضان وليلة القدر' } },
  { href: '/hijri-date', icon: 'moon', label: { en: 'Hijri Date Today', bn: 'আজকের হিজরি তারিখ', ar: 'التاريخ الهجري اليوم' }, desc: { en: 'Converter & Islamic events', bn: 'কনভার্টার ও ইসলামি দিবস', ar: 'محوّل ومناسبات' } },
  { href: '/zakat-calculator', icon: 'hands', label: { en: 'Zakat Calculator', bn: 'যাকাত ক্যালকুলেটর', ar: 'حاسبة الزكاة' }, desc: { en: 'Nisab, gold, silver & 2.5%', bn: 'নিসাব, সোনা-রুপা ও ২.৫%', ar: 'النصاب والذهب والفضة' } },
  { href: '/qibla', icon: 'qibla', label: { en: 'Qibla', bn: 'কিবলা', ar: 'القبلة' }, desc: { en: 'Live compass to the Kaaba', bn: 'কাবার দিক নির্ণয়', ar: 'بوصلة حية نحو الكعبة' } },
  { href: '/calendar', icon: 'calendar', label: { en: 'Hijri Calendar', bn: 'হিজরি ক্যালেন্ডার', ar: 'التقويم الهجري' }, desc: { en: 'Islamic dates & events', bn: 'ইসলামিক তারিখ ও দিবস', ar: 'التواريخ والمناسبات الإسلامية' } },
  { href: '/dhikr', icon: 'tasbih', label: { en: 'Tasbih', bn: 'তাসবীহ', ar: 'التسبيح' }, desc: { en: 'Smart dhikr counter', bn: 'যিকির কাউন্টার', ar: 'عدّاد أذكار ذكي' } },
  { href: '/journey', icon: 'journey', label: { en: 'My Journey', bn: 'আমার যাত্রা', ar: 'رحلتي' }, desc: { en: 'Streaks, khatam planner & stats', bn: 'স্ট্রিক, খতম পরিকল্পনা ও পরিসংখ্যান', ar: 'المواظبة وخطة الختمة والإحصاءات' } },
  { href: '/saved', icon: 'bookmark', label: { en: 'Saved', bn: 'সংরক্ষিত', ar: 'المحفوظات' }, desc: { en: 'Bookmarks & notes', bn: 'বুকমার্ক ও নোট', ar: 'العلامات والملاحظات' } },
  { href: '/masayel', icon: 'tafsir', label: { en: 'Masayel', bn: 'মাসায়েল', ar: 'المسائل' }, desc: { en: 'Everyday Islamic rulings', bn: 'দৈনন্দিন মাসআলা', ar: 'أحكام شرعية يومية' } },
  { href: '/settings', icon: 'settings', label: { en: 'Settings', bn: 'সেটিংস', ar: 'الإعدادات' }, desc: { en: 'Themes, fonts & reciters', bn: 'থিম, ফন্ট ও ক্বারী', ar: 'السمات والخطوط والقرّاء' } },
]

export const mobileTabs: NavItem[] = [
  { href: '/', icon: 'home', label: { en: 'Home', bn: 'হোম', ar: 'الرئيسية' } },
  { href: '/quran', icon: 'quran', label: { en: 'Quran', bn: 'কুরআন', ar: 'القرآن' } },
  { href: '/hifz', icon: 'hifz', label: { en: 'Hifz', bn: 'হিফজ', ar: 'الحفظ' } },
  { href: '/dua', icon: 'dua', label: { en: 'Duas', bn: 'দোয়া', ar: 'الأدعية' } },
]
