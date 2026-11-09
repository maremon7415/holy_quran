/** Single source of truth for brand + SEO configuration. */
export const site = {
  name: 'Noor Quran',
  shortName: 'Noor',
  tagline: 'Read, listen, understand & memorise the Holy Quran',
  taglineBn: 'পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন',
  description:
    'Noor Quran — the Holy Quran with Arabic text, Bangla and English translation, word-by-word meaning, tajweed colours, tafsir, 20+ reciters with word-synced audio, memorisation (hifz) studio, duas, 99 names of Allah, prayer times and Qibla. Free, fast, ad-free and open source.',
  descriptionBn:
    'নূর কুরআন — আরবি, বাংলা ও ইংরেজি অনুবাদ, শব্দে শব্দে অর্থ, তাজবীদ, তাফসীর, তিলাওয়াত, হিফজ, দোয়া, আল্লাহর ৯৯ নাম, নামাজের সময় ও কিবলা সহ সম্পূর্ণ আল কুরআন।',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://holy-quran-noor.vercel.app').replace(/\/$/, ''),
  locale: 'en_US',
  alternateLocales: ['bn_BD', 'ar_SA'],
  keywords: [
    'Quran', 'Holy Quran', 'Al Quran', 'Quran online', 'read Quran', 'Quran Bangla', 'Quran English translation',
    'Quran word by word', 'tajweed Quran', 'tafsir', 'Quran recitation', 'hifz', 'memorize Quran',
    'আল কুরআন', 'কুরআন বাংলা অনুবাদ', 'কুরআন শরীফ', 'দোয়া', 'Ayatul Kursi', 'Surah Yasin', 'Surah Mulk',
  ],
  github: 'https://github.com/maremon7415/holy_quran',
} as const

export const absoluteUrl = (path = '/') => `${site.url}${path.startsWith('/') ? path : `/${path}`}`
