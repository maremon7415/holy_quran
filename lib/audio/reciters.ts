/**
 * Curated reciter catalogue.
 * - `id` ≤ 200 matches the quran.com recitation id (chapter files + word timings available).
 * - `id` ≥ 1000 are everyayah.com-only reciters (per-ayah files, no word-level sync).
 * `folder` is the everyayah.com directory used for per-ayah audio / error fallback.
 */
export type ReciterStyle = 'Murattal' | 'Mujawwad' | 'Muallim'

export interface Reciter {
  id: number
  name: string
  ar: string
  style: ReciterStyle
  /** everyayah.com folder (per-ayah fallback) */
  folder: string | null
  /** true → chapter file + word timings from quran.com CDN */
  chapter: boolean
  /** short bio-ish tagline shown on cards */
  note?: string
}

export const reciters: Reciter[] = [
  { id: 7, name: 'Mishary Rashid Alafasy', ar: 'مشاري راشد العفاسي', style: 'Murattal', folder: 'Alafasy_128kbps', chapter: true, note: 'Kuwait' },
  { id: 3, name: 'Abdur-Rahman As-Sudais', ar: 'عبد الرحمن السديس', style: 'Murattal', folder: 'Abdurrahmaan_As-Sudais_192kbps', chapter: true, note: 'Imam of Masjid al-Haram' },
  { id: 10, name: "Sa'ud Ash-Shuraim", ar: 'سعود الشريم', style: 'Murattal', folder: 'Saood_ash-Shuraym_128kbps', chapter: true, note: 'Imam of Masjid al-Haram' },
  { id: 2, name: 'Abdul Basit Abdus-Samad', ar: 'عبد الباسط عبد الصمد', style: 'Murattal', folder: 'Abdul_Basit_Murattal_192kbps', chapter: true, note: 'Egypt' },
  { id: 1, name: 'Abdul Basit Abdus-Samad', ar: 'عبد الباسط عبد الصمد', style: 'Mujawwad', folder: 'Abdul_Basit_Mujawwad_128kbps', chapter: true, note: 'Melodic, slow' },
  { id: 9, name: 'Mohamed Siddiq Al-Minshawi', ar: 'محمد صديق المنشاوي', style: 'Murattal', folder: 'Minshawy_Murattal_128kbps', chapter: true, note: 'Egypt' },
  { id: 1001, name: 'Mohamed Siddiq Al-Minshawi', ar: 'محمد صديق المنشاوي', style: 'Mujawwad', folder: 'Minshawy_Mujawwad_192kbps', chapter: false, note: 'Melodic, slow' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary', ar: 'محمود خليل الحصري', style: 'Murattal', folder: 'Husary_128kbps', chapter: true, note: 'Egypt' },
  { id: 12, name: 'Mahmoud Khalil Al-Husary', ar: 'محمود خليل الحصري', style: 'Muallim', folder: 'Husary_Muallim_128kbps', chapter: true, note: 'Teaching — repeat after me' },
  { id: 5, name: 'Hani Ar-Rifai', ar: 'هاني الرفاعي', style: 'Murattal', folder: 'Hani_Rifai_192kbps', chapter: true, note: 'Saudi Arabia' },
  { id: 4, name: 'Abu Bakr Al-Shatri', ar: 'أبو بكر الشاطري', style: 'Murattal', folder: 'Abu_Bakr_Ash-Shaatree_128kbps', chapter: true, note: 'Saudi Arabia' },
  { id: 97, name: 'Yasser Ad-Dussary', ar: 'ياسر الدوسري', style: 'Murattal', folder: 'Yasser_Ad-Dussary_128kbps', chapter: true, note: 'Saudi Arabia' },
  { id: 161, name: 'Khalifah Al-Tunaiji', ar: 'خليفة الطنيجي', style: 'Murattal', folder: null, chapter: true, note: 'UAE' },
  { id: 1002, name: 'Maher Al-Muaiqly', ar: 'ماهر المعيقلي', style: 'Murattal', folder: 'MaherAlMuaiqly128kbps', chapter: false, note: 'Imam of Masjid al-Haram' },
  { id: 1003, name: 'Saad Al-Ghamdi', ar: 'سعد الغامدي', style: 'Murattal', folder: 'Ghamadi_40kbps', chapter: false, note: 'Saudi Arabia' },
  { id: 1004, name: 'Ali Al-Hudhaify', ar: 'علي الحذيفي', style: 'Murattal', folder: 'Hudhaify_128kbps', chapter: false, note: 'Imam of Masjid an-Nabawi' },
  { id: 1005, name: 'Abdullah Basfar', ar: 'عبد الله بصفر', style: 'Murattal', folder: 'Abdullah_Basfar_192kbps', chapter: false, note: 'Saudi Arabia' },
  { id: 1006, name: 'Ahmad Al-Ajmi', ar: 'أحمد بن علي العجمي', style: 'Murattal', folder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net', chapter: false, note: 'Kuwait' },
  { id: 1007, name: 'Muhammad Ayyoub', ar: 'محمد أيوب', style: 'Murattal', folder: 'Muhammad_Ayyoub_128kbps', chapter: false, note: 'Imam of Masjid an-Nabawi' },
  { id: 1008, name: 'Muhammad Jibreel', ar: 'محمد جبريل', style: 'Murattal', folder: 'Muhammad_Jibreel_128kbps', chapter: false, note: 'Egypt' },
  { id: 1009, name: 'Ali Jaber', ar: 'علي جابر', style: 'Murattal', folder: 'Ali_Jaber_64kbps', chapter: false, note: 'Imam of Masjid Quba' },
  { id: 1010, name: 'Nasser Al-Qatami', ar: 'ناصر القطامي', style: 'Murattal', folder: 'Nasser_Alqatami_128kbps', chapter: false, note: 'Kuwait' },
  { id: 1011, name: 'Salah Bukhatir', ar: 'صلاح بو خاطر', style: 'Murattal', folder: 'Salaah_AbdulRahman_Bukhatir_128kbps', chapter: false, note: 'UAE' },
  { id: 1012, name: 'Abdullah Matroud', ar: 'عبد الله المطرود', style: 'Murattal', folder: 'Abdullah_Matroud_128kbps', chapter: false, note: 'Saudi Arabia' },
  { id: 1013, name: 'Khalid Al-Qahtani', ar: 'خالد القحطاني', style: 'Murattal', folder: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', chapter: false, note: 'Saudi Arabia' },
  { id: 1014, name: 'Salah Al-Budair', ar: 'صلاح البدير', style: 'Murattal', folder: 'Salah_Al_Budair_128kbps', chapter: false, note: 'Imam of Masjid an-Nabawi' },
  { id: 1015, name: 'Fares Abbad', ar: 'فارس عباد', style: 'Murattal', folder: 'Fares_Abbad_64kbps', chapter: false, note: 'Yemen' },
  { id: 1016, name: 'Muhsin Al-Qasim', ar: 'محسن القاسم', style: 'Murattal', folder: 'Muhsin_Al_Qasim_192kbps', chapter: false, note: 'Imam of Masjid an-Nabawi' },
]

export const DEFAULT_RECITER = 7
export const getReciter = (id: number): Reciter => reciters.find((r) => r.id === id) ?? reciters[0]

const pad = (n: number, l = 3) => String(n).padStart(l, '0')

/** Per-ayah mp3 on everyayah.com (falls back to Alafasy when the reciter has no folder). */
export function everyAyahUrl(reciter: Reciter, surah: number, ayah: number) {
  return `https://everyayah.com/data/${reciter.folder ?? 'Alafasy_128kbps'}/${pad(surah)}${pad(ayah)}.mp3`
}

/** Two-letter monogram from a reciter's English name (skips honorific particles). */
export function monogram(name: string) {
  const parts = name.replace(/[`'’]/g, '').split(/[\s-]+/).filter((p) => !/^(al|as|ash|ad|ar|an|abdur|abdul|bin|ibn)$/i.test(p) || false)
  const src = parts.length >= 2 ? parts : name.split(/\s+/)
  return (src[0]?.[0] ?? '') + (src[src.length - 1]?.[0] ?? '')
}

const NOTE_AR: Record<string, string> = {
  Egypt: 'مصر', Kuwait: 'الكويت', UAE: 'الإمارات', Yemen: 'اليمن', 'Saudi Arabia': 'السعودية',
  'Imam of Masjid al-Haram': 'إمام المسجد الحرام', 'Imam of Masjid an-Nabawi': 'إمام المسجد النبوي', 'Imam of Masjid Quba': 'إمام مسجد قباء',
  'Melodic, slow': 'مجوَّد، بطيء', 'Teaching — repeat after me': 'تعليمي — ردّد خلفي',
}
const NOTE_BN: Record<string, string> = {
  Egypt: 'মিসর', Kuwait: 'কুয়েত', UAE: 'সংযুক্ত আরব আমিরাত', Yemen: 'ইয়েমেন', 'Saudi Arabia': 'সৌদি আরব',
  'Imam of Masjid al-Haram': 'মসজিদুল হারামের ইমাম', 'Imam of Masjid an-Nabawi': 'মসজিদে নববীর ইমাম', 'Imam of Masjid Quba': 'মসজিদে কুবার ইমাম',
  'Melodic, slow': 'সুরেলা, ধীর', 'Teaching — repeat after me': 'শিক্ষামূলক — আমার পরে পড়ুন',
}
const STYLE_AR: Record<ReciterStyle, string> = { Murattal: 'مرتّل', Mujawwad: 'مجوَّد', Muallim: 'معلّم' }
const STYLE_BN: Record<ReciterStyle, string> = { Murattal: 'মুরাত্তাল', Mujawwad: 'মুজাওয়াদ', Muallim: 'মুআল্লিম' }

/** Reciter display helpers for the UI language (Arabic UI shows the Arabic name, notes and style). */
export const reciterName = (lang: string, r: Pick<Reciter, 'name' | 'ar'>) => (lang === 'ar' ? r.ar : r.name)
export const reciterStyle = (lang: string, s: ReciterStyle) => (lang === 'ar' ? STYLE_AR[s] : lang === 'bn' ? STYLE_BN[s] : s)
export const reciterNote = (lang: string, note?: string) => (!note ? '' : lang === 'ar' ? NOTE_AR[note] ?? note : lang === 'bn' ? NOTE_BN[note] ?? note : note)
