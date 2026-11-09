export interface NavItem {
  href: string
  icon: string // /public/icons/ui/<icon>.png
  label: { en: string; bn: string }
  desc?: { en: string; bn: string }
}

export const primaryNav: NavItem[] = [
  { href: '/quran', icon: 'quran', label: { en: 'Quran', bn: 'কুরআন' } },
  { href: '/listen', icon: 'listen', label: { en: 'Listen', bn: 'তিলাওয়াত' } },
  { href: '/hifz', icon: 'hifz', label: { en: 'Hifz', bn: 'হিফজ' } },
  { href: '/topics', icon: 'topics', label: { en: 'Topics', bn: 'বিষয়ভিত্তিক' } },
  { href: '/dua', icon: 'dua', label: { en: 'Duas', bn: 'দোয়া' } },
]

export const moreNav: NavItem[] = [
  { href: '/names-of-allah', icon: 'names', label: { en: '99 Names of Allah', bn: 'আল্লাহর ৯৯ নাম' }, desc: { en: 'Asma ul Husna with meanings', bn: 'আসমাউল হুসনা ও অর্থ' } },
  { href: '/prayer-times', icon: 'prayer', label: { en: 'Prayer Times', bn: 'নামাজের সময়' }, desc: { en: 'Accurate times for your city', bn: 'আপনার শহরের সঠিক সময়' } },
  { href: '/qibla', icon: 'qibla', label: { en: 'Qibla', bn: 'কিবলা' }, desc: { en: 'Live compass to the Kaaba', bn: 'কাবার দিক নির্ণয়' } },
  { href: '/calendar', icon: 'calendar', label: { en: 'Hijri Calendar', bn: 'হিজরি ক্যালেন্ডার' }, desc: { en: 'Islamic dates & events', bn: 'ইসলামিক তারিখ ও দিবস' } },
  { href: '/dhikr', icon: 'tasbih', label: { en: 'Tasbih', bn: 'তাসবীহ' }, desc: { en: 'Smart dhikr counter', bn: 'যিকির কাউন্টার' } },
  { href: '/journey', icon: 'journey', label: { en: 'My Journey', bn: 'আমার যাত্রা' }, desc: { en: 'Streaks, khatam planner & stats', bn: 'স্ট্রিক, খতম পরিকল্পনা ও পরিসংখ্যান' } },
  { href: '/saved', icon: 'bookmark', label: { en: 'Saved', bn: 'সংরক্ষিত' }, desc: { en: 'Bookmarks & notes', bn: 'বুকমার্ক ও নোট' } },
  { href: '/masayel', icon: 'tafsir', label: { en: 'Masayel', bn: 'মাসায়েল' }, desc: { en: 'Everyday Islamic rulings', bn: 'দৈনন্দিন মাসআলা' } },
  { href: '/settings', icon: 'settings', label: { en: 'Settings', bn: 'সেটিংস' }, desc: { en: 'Themes, fonts & reciters', bn: 'থিম, ফন্ট ও ক্বারী' } },
]

export const mobileTabs: NavItem[] = [
  { href: '/', icon: 'home', label: { en: 'Home', bn: 'হোম' } },
  { href: '/quran', icon: 'quran', label: { en: 'Quran', bn: 'কুরআন' } },
  { href: '/hifz', icon: 'hifz', label: { en: 'Hifz', bn: 'হিফজ' } },
  { href: '/dua', icon: 'dua', label: { en: 'Duas', bn: 'দোয়া' } },
]
