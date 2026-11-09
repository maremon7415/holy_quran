export interface AchievementInput {
  totalVerses: number
  longestStreak: number
  currentStreak: number
  completedSurahs: number[]
  bookmarks: number
  hifzAyahs: number
  hifzStreak: number
  khatams: number
  hifzSurahs: number[]
}

export interface Achievement {
  id: string
  icon: string
  en: string
  bn: string
  descEn: string
  descBn: string
  value: number
  target: number
}

const juzAmma = Array.from({ length: 37 }, (_, i) => 78 + i)

export function achievements(i: AchievementInput): Achievement[] {
  const amma = juzAmma.filter((s) => i.completedSurahs.includes(s)).length
  const streak = Math.max(i.longestStreak, i.currentStreak)
  const a = (id: string, icon: string, en: string, bn: string, descEn: string, descBn: string, value: number, target: number): Achievement => ({
    id, icon, en, bn, descEn, descBn, value: Math.min(value, target), target,
  })
  return [
    a('first-surah', 'quran', 'First Surah', 'প্রথম সূরা', 'Finish reading any surah.', 'যেকোনো একটি সূরা পড়া শেষ করুন।', i.completedSurahs.length, 1),
    a('streak-3', 'streak', 'Spark', 'স্ফুলিঙ্গ', 'Read 3 days in a row.', 'টানা ৩ দিন পড়ুন।', streak, 3),
    a('streak-7', 'streak', 'Week of Light', 'নূরের সপ্তাহ', 'Keep a 7-day streak.', '৭ দিনের স্ট্রিক রাখুন।', streak, 7),
    a('streak-30', 'moon', 'A Full Moon', 'পূর্ণিমা', 'Keep a 30-day streak.', '৩০ দিনের স্ট্রিক রাখুন।', streak, 30),
    a('verses-100', 'read', '100 Verses', '১০০ আয়াত', 'Read 100 verses.', '১০০ আয়াত পড়ুন।', i.totalVerses, 100),
    a('verses-1000', 'sparkle', '1,000 Verses', '১,০০০ আয়াত', 'Read 1,000 verses.', '১,০০০ আয়াত পড়ুন।', i.totalVerses, 1000),
    a('juz-amma', 'juz', 'Juz Amma Reader', 'জুয আম্মা পাঠক', 'Complete all 37 surahs of Juz Amma.', 'জুয আম্মার ৩৭টি সূরা সম্পূর্ণ করুন।', amma, 37),
    a('surahs-10', 'crescent', '10 Surahs', '১০টি সূরা', 'Complete 10 surahs.', '১০টি সূরা সম্পূর্ণ করুন।', i.completedSurahs.length, 10),
    a('bookmarks-10', 'bookmark', 'Collector', 'সংগ্রাহক', 'Bookmark 10 ayahs.', '১০টি আয়াত বুকমার্ক করুন।', i.bookmarks, 10),
    a('hifz-first', 'hifz', 'First Steps in Hifz', 'হিফজের প্রথম পদক্ষেপ', 'Learn your first ayah in Hifz Studio.', 'হিফজ স্টুডিওতে প্রথম আয়াত শিখুন।', i.hifzAyahs, 1),
    a('hifz-surah', 'heart', 'Surah Memorised', 'সূরা মুখস্থ', 'Fully memorise a surah.', 'একটি সূরা সম্পূর্ণ মুখস্থ করুন।', i.hifzSurahs.length, 1),
    a('hifz-100', 'lantern', 'Hafiz in the Making', 'হাফেজ হওয়ার পথে', 'Hold 100 ayahs in memory.', '১০০ আয়াত স্মৃতিতে রাখুন।', i.hifzAyahs, 100),
    a('hifz-streak', 'tasbih', 'Steady Heart', 'অটল হৃদয়', 'Practise hifz 7 days in a row.', 'টানা ৭ দিন হিফজ অনুশীলন করুন।', i.hifzStreak, 7),
    a('khatam', 'khatam', 'Khatam', 'খতম', 'Finish a full Khatam with the planner.', 'প্ল্যানারে একটি পূর্ণ খতম শেষ করুন।', i.khatams, 1),
  ]
}
