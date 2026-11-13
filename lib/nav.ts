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
  { href: '/names-of-allah', icon: 'names', label: { en: '99 Names of Allah', bn: 'আল্লাহর ৯৯ নাম', ar: 'أسماء الله الحسنى' }, desc: { en: 'Asma ul Husna with meanings', bn: 'আসমাউল হুসনা ও অর্থ', ar: 'الأسماء الحسنى ومعانيها' } },
  { href: '/prayer-times', icon: 'prayer', label: { en: 'Prayer Times', bn: 'নামাজের সময়', ar: 'مواقيت الصلاة' }, desc: { en: 'Accurate times for your city', bn: 'আপনার শহরের সঠিক সময়', ar: 'مواقيت دقيقة لمدينتك' } },
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
