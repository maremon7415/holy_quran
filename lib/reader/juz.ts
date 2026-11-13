/** Well-known names of the 30 ajza (paras) — taken from their opening words. Client + server safe. */
export interface JuzName { ar: string; tl: string; bn: string }

export const juzNames: JuzName[] = [
  { ar: 'الٓمٓ', tl: 'Alif Lam Mim', bn: 'আলিফ লাম মীম' },
  { ar: 'سَيَقُولُ', tl: 'Sayaqul', bn: 'সাইয়াকুল' },
  { ar: 'تِلْكَ ٱلرُّسُلُ', tl: 'Tilkal Rusul', bn: 'তিলকার রুসুল' },
  { ar: 'لَن تَنَالُوا', tl: 'Lan Tanalu', bn: 'লান তানালু' },
  { ar: 'وَٱلْمُحْصَنَـٰتُ', tl: 'Wal Muhsanat', bn: 'ওয়াল মুহসানাত' },
  { ar: 'لَا يُحِبُّ ٱللَّهُ', tl: 'La Yuhibbullah', bn: 'লা ইউহিব্বুল্লাহ' },
  { ar: 'وَإِذَا سَمِعُوا', tl: 'Wa Iza Samiu', bn: 'ওয়া ইযা সামিউ' },
  { ar: 'وَلَوْ أَنَّنَا', tl: 'Wa Lau Annana', bn: 'ওয়া লাও আন্নানা' },
  { ar: 'قَالَ ٱلْمَلَأُ', tl: 'Qalal Mala', bn: 'কালাল মালাউ' },
  { ar: 'وَٱعْلَمُوا', tl: "Wa A'lamu", bn: 'ওয়া আলামু' },
  { ar: 'يَعْتَذِرُونَ', tl: "Ya'tadhirun", bn: 'ইয়াতাযিরুন' },
  { ar: 'وَمَا مِن دَآبَّةٍ', tl: 'Wa Ma Min Dabbah', bn: 'ওয়া মা মিন দাব্বাহ' },
  { ar: 'وَمَآ أُبَرِّئُ', tl: "Wa Ma Ubarri'u", bn: 'ওয়া মা উবাররিউ' },
  { ar: 'رُبَمَا', tl: 'Rubama', bn: 'রুবামা' },
  { ar: 'سُبْحَـٰنَ ٱلَّذِىٓ', tl: 'Subhanalladhi', bn: 'সুবহানাল্লাযী' },
  { ar: 'قَالَ أَلَمْ', tl: 'Qal Alam', bn: 'কাল আলাম' },
  { ar: 'ٱقْتَرَبَ', tl: 'Iqtaraba', bn: 'ইকতারাবা' },
  { ar: 'قَدْ أَفْلَحَ', tl: 'Qad Aflaha', bn: 'কাদ আফলাহা' },
  { ar: 'وَقَالَ ٱلَّذِينَ', tl: 'Wa Qalalladhina', bn: 'ওয়া কালাল্লাযীনা' },
  { ar: 'أَمَّنْ خَلَقَ', tl: "A'man Khalaq", bn: 'আম্মান খালাক' },
  { ar: 'ٱتْلُ مَآ أُوحِىَ', tl: 'Utlu Ma Uhiya', bn: 'উতলু মা উহিয়া' },
  { ar: 'وَمَن يَقْنُتْ', tl: 'Wa Man Yaqnut', bn: 'ওয়া মাই ইয়াকনুত' },
  { ar: 'وَمَا لِىَ', tl: 'Wa Mali', bn: 'ওয়া মালিয়া' },
  { ar: 'فَمَنْ أَظْلَمُ', tl: 'Faman Azlam', bn: 'ফামান আযলাম' },
  { ar: 'إِلَيْهِ يُرَدُّ', tl: 'Ilayhi Yuraddu', bn: 'ইলাইহি ইউরাদ্দু' },
  { ar: 'حمٓ', tl: 'Ha Mim', bn: 'হা-মীম' },
  { ar: 'قَالَ فَمَا خَطْبُكُمْ', tl: 'Qala Fama Khatbukum', bn: 'কালা ফামা খাতবুকুম' },
  { ar: 'قَدْ سَمِعَ ٱللَّهُ', tl: "Qad Sami' Allah", bn: 'কাদ সামিআল্লাহ' },
  { ar: 'تَبَـٰرَكَ ٱلَّذِى', tl: 'Tabarakalladhi', bn: 'তাবারাকাল্লাযী' },
  { ar: 'عَمَّ', tl: 'Amma', bn: 'আম্মা' },
]

export const getJuzName = (n: number) => juzNames[n - 1]
