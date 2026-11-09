/**
 * Popular names people search for specific ayahs. Used to enrich titles, H1s and FAQ
 * copy on the single-ayah landing pages (e.g. "2:255 (Ayatul Kursi)").
 */
export interface FamousAyah { en: string; bn: string; ar?: string; aka?: string[] }

const famous: Record<string, FamousAyah> = {
  '1:1': { en: 'Bismillah', bn: 'বিসমিল্লাহ', ar: 'البسملة' },
  '2:152': { en: 'Fadhkuruni Adhkurkum', bn: 'ফাযকুরূনী আযকুরকুম', aka: ['Remember Me, I will remember you'] },
  '2:153': { en: 'Allah is with the patient', bn: 'আল্লাহ ধৈর্যশীলদের সাথে আছেন' },
  '2:155': { en: 'Tests of fear and hunger', bn: 'ভয় ও ক্ষুধার পরীক্ষা' },
  '2:156': { en: "Inna Lillahi wa Inna Ilayhi Raji'un", bn: 'ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন', ar: 'إنا لله وإنا إليه راجعون' },
  '2:183': { en: 'The verse of fasting', bn: 'রোজা ফরজের আয়াত' },
  '2:186': { en: 'I am near — I answer the caller', bn: 'আমি নিকটেই আছি', aka: ['Dua verse'] },
  '2:201': { en: 'Rabbana Atina fid-Dunya Hasanah', bn: 'রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ', ar: 'ربنا آتنا في الدنيا حسنة' },
  '2:250': { en: 'Rabbana Afrigh Alayna Sabran', bn: 'রাব্বানা আফরিগ আলাইনা সাবরান' },
  '2:255': { en: 'Ayatul Kursi', bn: 'আয়াতুল কুরসি', ar: 'آية الكرسي', aka: ['Ayat al-Kursi', 'Throne Verse'] },
  '2:256': { en: 'La Ikraha fid-Din', bn: 'লা ইকরাহা ফিদ্দীন', aka: ['No compulsion in religion'] },
  '2:285': { en: 'Amanar Rasul', bn: 'আমানার রাসূল', ar: 'آمن الرسول', aka: ['Last two ayahs of Al-Baqarah'] },
  '2:286': { en: 'La Yukallifullahu Nafsan (Amanar Rasul)', bn: 'লা ইউকাল্লিফুল্লাহু নাফসান', aka: ['Last ayah of Al-Baqarah'] },
  '3:8': { en: 'Rabbana La Tuzigh Qulubana', bn: 'রাব্বানা লা তুযিগ কুলূবানা' },
  '3:26': { en: 'Qulillahumma Malikal Mulk', bn: 'কুলিল্লাহুম্মা মালিকাল মুলক' },
  '3:139': { en: 'Do not lose hope nor be sad', bn: 'হতাশ হয়ো না, দুঃখ করো না' },
  '3:173': { en: "Hasbunallahu wa Ni'mal Wakil", bn: 'হাসবুনাল্লাহু ওয়া নি‘মাল ওয়াকীল', ar: 'حسبنا الله ونعم الوكيل' },
  '3:185': { en: 'Every soul shall taste death', bn: 'প্রত্যেক প্রাণী মৃত্যুর স্বাদ গ্রহণ করবে' },
  '3:190': { en: 'Signs in the creation of the heavens', bn: 'আসমান-জমিন সৃষ্টিতে নিদর্শন' },
  '7:23': { en: 'Rabbana Zalamna Anfusana (Dua of Adam)', bn: 'রাব্বানা যালামনা আনফুসানা' },
  '9:129': { en: 'Hasbiyallahu La Ilaha Illa Huwa', bn: 'হাসবিয়াল্লাহু লা ইলাহা ইল্লা হুওয়া' },
  '13:28': { en: 'In the remembrance of Allah hearts find rest', bn: 'আল্লাহর স্মরণে অন্তর প্রশান্ত হয়' },
  '14:7': { en: 'If you are grateful, I will increase you', bn: 'কৃতজ্ঞ হলে আমি বাড়িয়ে দেব' },
  '14:41': { en: 'Rabbanaghfirli wa li Walidayya', bn: 'রাব্বানাগফিরলি ওয়া লিওয়ালিদাইয়া' },
  '17:24': { en: 'Rabbirhamhuma Kama Rabbayani Saghira', bn: 'রাব্বির হামহুমা কামা রাব্বায়ানী সাগীরা', aka: ['Dua for parents'] },
  '18:10': { en: 'Rabbana Atina min Ladunka Rahmah', bn: 'রাব্বানা আতিনা মিল্লাদুনকা রাহমাহ' },
  '20:25': { en: 'Rabbish Rahli Sadri', bn: 'রাব্বিশ রাহলী সাদরী', aka: ['Dua of Musa'] },
  '20:114': { en: 'Rabbi Zidni Ilma', bn: 'রাব্বি যিদনী ইলমা', ar: 'رب زدني علما' },
  '21:87': { en: 'Ayat-e-Karima (Dua of Yunus)', bn: 'দোয়া ইউনুস (আয়াতে কারীমা)', ar: 'لا إله إلا أنت سبحانك' },
  '23:118': { en: 'Rabbighfir Warham', bn: 'রাব্বিগফির ওয়ারহাম' },
  '24:35': { en: 'Ayat an-Nur (The Verse of Light)', bn: 'আয়াতুন নূর' },
  '25:74': { en: 'Rabbana Hab Lana min Azwajina', bn: 'রাব্বানা হাবলানা মিন আযওয়াজিনা' },
  '28:24': { en: 'Rabbi Inni Lima Anzalta Ilayya', bn: 'রাব্বি ইন্নী লিমা আনযালতা ইলাইয়া' },
  '33:56': { en: 'Durood — Salawat upon the Prophet', bn: 'দরুদ শরীফের আয়াত' },
  '39:53': { en: 'Do not despair of the mercy of Allah', bn: 'আল্লাহর রহমত থেকে নিরাশ হয়ো না' },
  '40:60': { en: 'Call upon Me, I will respond', bn: 'আমাকে ডাকো, আমি সাড়া দেব' },
  '49:13': { en: 'We made you nations and tribes', bn: 'তোমাদের জাতি ও গোত্রে বিভক্ত করেছি' },
  '55:13': { en: 'Fabi Ayyi Ala-i Rabbikuma Tukadhdhiban', bn: 'ফাবিআইয়ি আলা-ই রাব্বিকুমা তুকাযযিবান' },
  '59:22': { en: 'Huwallahulladhi (Last ayahs of Al-Hashr)', bn: 'হুওয়াল্লাহুল্লাযী (সূরা হাশরের শেষ আয়াত)' },
  '59:23': { en: 'Huwallahulladhi (Last ayahs of Al-Hashr)', bn: 'হুওয়াল্লাহুল্লাযী (সূরা হাশরের শেষ আয়াত)' },
  '59:24': { en: 'Huwallahul Khaliqul Bari (Last ayah of Al-Hashr)', bn: 'হুওয়াল্লাহুল খালিকুল বারি' },
  '65:2': { en: 'Whoever fears Allah, He will make a way out', bn: 'যে আল্লাহকে ভয় করে, তিনি তার পথ করে দেন' },
  '65:3': { en: 'Wa Man Yatawakkal Alallah', bn: 'ওয়া মাই ইয়াতাওয়াক্কাল আলাল্লাহ' },
  '94:5': { en: "Inna Ma'al Usri Yusra", bn: 'ইন্না মাআল উসরি ইউসরা', ar: 'إن مع العسر يسرا' },
  '94:6': { en: "Inna Ma'al Usri Yusra", bn: 'ইন্না মাআল উসরি ইউসরা', ar: 'إن مع العسر يسرا' },
  '112:1': { en: 'Qul Huwallahu Ahad', bn: 'কুল হুওয়াল্লাহু আহাদ' },
}

/** Fatihah ayahs */
for (let i = 1; i <= 7; i++) if (!famous[`1:${i}`]) famous[`1:${i}`] = { en: 'Surah Al-Fatihah', bn: 'সূরা ফাতিহা' }
for (let i = 2; i <= 4; i++) famous[`112:${i}`] = { en: 'Surah Al-Ikhlas', bn: 'সূরা ইখলাস' }

export const getFamousAyah = (key: string): FamousAyah | null => famous[key] ?? null

/** Curated list pre-rendered at build time; every other ayah renders on demand (ISR). */
export const curatedAyahKeys = [
  '1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7',
  '2:152', '2:153', '2:156', '2:186', '2:201', '2:255', '2:256', '2:285', '2:286',
  '3:8', '3:139', '3:173', '3:185', '7:23', '9:129', '13:28', '14:7', '17:24',
  '20:25', '20:114', '21:87', '24:35', '25:74', '28:24', '33:56', '39:53', '40:60', '49:13',
  '59:22', '59:23', '59:24', '65:2', '65:3', '94:5', '94:6', '112:1', '112:2', '112:3', '112:4',
]
