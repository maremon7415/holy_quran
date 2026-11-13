import type { L } from './types'

/** The 28 letters of the Arabic alphabet. Forms are produced by the font with zero-width joiners (see letterForms). */
export interface ArabicLetter {
  id: string
  ar: string
  name: { en: string; bn: string; ar: string }
  /** letters that do not connect to the next letter (so initial = isolated, medial = final) */
  rightJoinOnly?: boolean
  /** Bangla approximation of the sound */
  sound: L
  /** articulation point (makhraj) */
  makhraj: L
  group: 'jawf' | 'halq' | 'lisan' | 'shafatan'
  /** a plain (undiacritised) Quran word that starts with this letter; the displayed word comes from the corpus (data/learn/alphabet-words.json) */
  seed: string
}

export const makhrajGroups: Record<ArabicLetter['group'], L> = {
  jawf: { en: 'Al-jawf (empty space of mouth & throat)', bn: 'আল-জাওফ (মুখ ও গলার ফাঁকা স্থান)', ar: 'الجوف' },
  halq: { en: 'Al-halq (throat)', bn: 'আল-হালক (কণ্ঠনালি)', ar: 'الحلق' },
  lisan: { en: 'Al-lisan (tongue)', bn: 'আল-লিসান (জিহ্বা)', ar: 'اللسان' },
  shafatan: { en: 'Ash-shafatan (lips)', bn: 'আশ-শাফাতান (ঠোঁট)', ar: 'الشفتان' },
}

export const arabicLetters: ArabicLetter[] = [
  { id: 'alif', ar: 'ا', name: { en: 'Alif', bn: 'আলিফ', ar: 'ألف' }, rightJoinOnly: true, group: 'jawf', seed: 'احد', sound: { en: 'a (long vowel)', bn: 'আ (দীর্ঘ স্বর)' }, makhraj: { en: 'A long vowel carried on the breath from the empty space of the mouth and throat. (The hamza ء, a different letter, is made in the deepest part of the throat.)', bn: 'মুখ ও গলার ফাঁকা স্থান থেকে শ্বাসের সঙ্গে উচ্চারিত দীর্ঘ স্বর। (হামযা ء আলাদা হরফ, যা গলার একদম গভীর থেকে উচ্চারিত।)' } },
  { id: 'ba', ar: 'ب', name: { en: 'Ba', bn: 'বা', ar: 'باء' }, group: 'shafatan', seed: 'بيت', sound: { en: 'b', bn: 'ব' }, makhraj: { en: 'Both lips meet (the moist inner part).', bn: 'দুই ঠোঁটের ভেজা ভেতরের অংশ মিলে।' } },
  { id: 'ta', ar: 'ت', name: { en: 'Ta', bn: 'তা', ar: 'تاء' }, group: 'lisan', seed: 'تاب', sound: { en: 't', bn: 'ত' }, makhraj: { en: 'The tip of the tongue touches the base of the upper front teeth.', bn: 'জিহ্বার অগ্রভাগ ওপরের সামনের দাঁতের গোড়া স্পর্শ করে।' } },
  { id: 'tha', ar: 'ث', name: { en: 'Tha', bn: 'ছা', ar: 'ثاء' }, group: 'lisan', seed: 'ثواب', sound: { en: 'th (as in “think”)', bn: 'ছ (ইংরেজি think-এর th-এর মতো)' }, makhraj: { en: 'The tip of the tongue meets the edges of the upper front teeth; air flows out softly.', bn: 'জিহ্বার অগ্রভাগ ওপরের সামনের দাঁতের কিনারায় লাগে; বাতাস নরমভাবে বের হয়।' } },
  { id: 'jim', ar: 'ج', name: { en: 'Jim', bn: 'জীম', ar: 'جيم' }, group: 'lisan', seed: 'جنه', sound: { en: 'j', bn: 'জ' }, makhraj: { en: 'The middle of the tongue meets the palate above it.', bn: 'জিহ্বার মাঝখান তার ওপরের তালুর সঙ্গে লাগে।' } },
  { id: 'ha-heavy', ar: 'ح', name: { en: 'Ha (breathy)', bn: 'হা (হোট)', ar: 'حاء' }, group: 'halq', seed: 'حق', sound: { en: 'ħ (a breathy, throaty h)', bn: 'হ (গলার ভেতর থেকে শ্বাসের মতো)' }, makhraj: { en: 'The middle of the throat; a clear breathy sound without vibration.', bn: 'গলার মাঝখান থেকে; কম্পনহীন পরিষ্কার শ্বাসময় আওয়াজ।' } },
  { id: 'kha', ar: 'خ', name: { en: 'Kha', bn: 'খা', ar: 'خاء' }, group: 'halq', seed: 'خير', sound: { en: 'kh (as in “Bach”)', bn: 'খ (গলার ওপরের অংশ থেকে ঘষা আওয়াজ)' }, makhraj: { en: 'The upper part of the throat (nearest the mouth); a scraping sound.', bn: 'গলার ওপরের অংশ (মুখের কাছাকাছি) থেকে; ঘষা আওয়াজ।' } },
  { id: 'dal', ar: 'د', name: { en: 'Dal', bn: 'দাল', ar: 'دال' }, rightJoinOnly: true, group: 'lisan', seed: 'دين', sound: { en: 'd', bn: 'দ' }, makhraj: { en: 'The tip of the tongue at the base of the upper front teeth, like ta but voiced.', bn: 'জিহ্বার অগ্রভাগ ওপরের সামনের দাঁতের গোড়ায়, ت-এর মতো কিন্তু স্বরযুক্ত।' } },
  { id: 'dhal', ar: 'ذ', name: { en: 'Dhal', bn: 'যাল', ar: 'ذال' }, rightJoinOnly: true, group: 'lisan', seed: 'ذكر', sound: { en: 'dh (as in “this”)', bn: 'য (ইংরেজি this-এর th-এর মতো)' }, makhraj: { en: 'The tip of the tongue meets the edges of the upper front teeth, voiced.', bn: 'জিহ্বার অগ্রভাগ ওপরের সামনের দাঁতের কিনারায় লাগে, স্বরযুক্ত।' } },
  { id: 'ra', ar: 'ر', name: { en: 'Ra', bn: 'রা', ar: 'راء' }, rightJoinOnly: true, group: 'lisan', seed: 'رب', sound: { en: 'r (slightly rolled)', bn: 'র (সামান্য কম্পিত)' }, makhraj: { en: 'The tip of the tongue, slightly back from the lam, with a light tap.', bn: 'জিহ্বার অগ্রভাগ, ل-এর চেয়ে সামান্য পেছনে, হালকা টোকা দিয়ে।' } },
  { id: 'zay', ar: 'ز', name: { en: 'Zay', bn: 'যা', ar: 'زاي' }, rightJoinOnly: true, group: 'lisan', seed: 'زوج', sound: { en: 'z', bn: 'জ/য (গুনগুন আওয়াজ)' }, makhraj: { en: 'The tip of the tongue near the lower front teeth; a buzzing sound.', bn: 'জিহ্বার অগ্রভাগ নিচের সামনের দাঁতের কাছে; গুনগুন আওয়াজ।' } },
  { id: 'sin', ar: 'س', name: { en: 'Sin', bn: 'সীন', ar: 'سين' }, group: 'lisan', seed: 'سلام', sound: { en: 's', bn: 'স' }, makhraj: { en: 'The same place as zay, with a hissing sound and no vibration.', bn: 'ز-এর একই স্থান, কিন্তু হিসহিস আওয়াজ এবং কম্পন ছাড়া।' } },
  { id: 'shin', ar: 'ش', name: { en: 'Shin', bn: 'শীন', ar: 'شين' }, group: 'lisan', seed: 'شجره', sound: { en: 'sh', bn: 'শ' }, makhraj: { en: 'The middle of the tongue against the palate; the sound spreads in the mouth.', bn: 'জিহ্বার মাঝখান তালুর সঙ্গে; আওয়াজ মুখের ভেতরে ছড়িয়ে পড়ে।' } },
  { id: 'sad', ar: 'ص', name: { en: 'Sad', bn: 'ছোয়াদ', ar: 'صاد' }, group: 'lisan', seed: 'صراط', sound: { en: 's (heavy)', bn: 'ছ/স (মোটা সুরে)' }, makhraj: { en: 'The heavy form of sin: tip of the tongue near the lower front teeth with the back of the tongue raised.', bn: 'সীনের মোটা রূপ: জিহ্বার অগ্রভাগ নিচের সামনের দাঁতের কাছে, জিহ্বার পেছনের অংশ ওপরে তোলা।' } },
  { id: 'dad', ar: 'ض', name: { en: 'Dad', bn: 'দোয়াদ', ar: 'ضاد' }, group: 'lisan', seed: 'ضحى', sound: { en: 'd (heavy)', bn: 'দ (মোটা সুরে)' }, makhraj: { en: 'The side edge of the tongue against the upper molars (left or right); a heavy sound.', bn: 'জিহ্বার পাশের কিনারা ওপরের মাড়ির দাঁতে (বাম বা ডান) লাগে; মোটা আওয়াজ।' } },
  { id: 'ta-heavy', ar: 'ط', name: { en: 'Ta (heavy)', bn: 'তোয়া', ar: 'طاء' }, group: 'lisan', seed: 'طعام', sound: { en: 't (heavy)', bn: 'ত (মোটা সুরে)' }, makhraj: { en: 'The heavy form of ta: tip of the tongue at the base of the upper front teeth with the tongue raised.', bn: 'তা-এর মোটা রূপ: জিহ্বার অগ্রভাগ ওপরের দাঁতের গোড়ায়, জিহ্বা ওপরে তোলা।' } },
  { id: 'za', ar: 'ظ', name: { en: 'Za (heavy)', bn: 'যোয়া', ar: 'ظاء' }, group: 'lisan', seed: 'ظلم', sound: { en: 'dh (heavy)', bn: 'য (মোটা সুরে)' }, makhraj: { en: 'The heavy form of dhal: tongue tip at the edges of the upper teeth with the tongue raised.', bn: 'যালের মোটা রূপ: জিহ্বার অগ্রভাগ ওপরের দাঁতের কিনারায়, জিহ্বা ওপরে তোলা।' } },
  { id: 'ayn', ar: 'ع', name: { en: 'Ayn', bn: 'আইন', ar: 'عين' }, group: 'halq', seed: 'علم', sound: { en: '‘ (a deep, voiced throat sound)', bn: 'আ (গলার মাঝখান থেকে চাপা স্বরযুক্ত আওয়াজ)' }, makhraj: { en: 'The middle of the throat, with the throat gently narrowed and voiced.', bn: 'গলার মাঝখান, গলা হালকা সংকুচিত করে স্বরযুক্ত আওয়াজ।' } },
  { id: 'ghayn', ar: 'غ', name: { en: 'Ghayn', bn: 'গাইন', ar: 'غين' }, group: 'halq', seed: 'غفور', sound: { en: 'gh (a gargling sound)', bn: 'গ (গড়গড়া আওয়াজ)' }, makhraj: { en: 'The upper part of the throat; a gargling sound.', bn: 'গলার ওপরের অংশ; গড়গড়া আওয়াজ।' } },
  { id: 'fa', ar: 'ف', name: { en: 'Fa', bn: 'ফা', ar: 'فاء' }, group: 'shafatan', seed: 'فضل', sound: { en: 'f', bn: 'ফ' }, makhraj: { en: 'The tips of the upper front teeth touch the inner edge of the lower lip.', bn: 'ওপরের সামনের দাঁতের অগ্রভাগ নিচের ঠোঁটের ভেতরের কিনারা স্পর্শ করে।' } },
  { id: 'qaf', ar: 'ق', name: { en: 'Qaf', bn: 'ক্বাফ', ar: 'قاف' }, group: 'lisan', seed: 'قران', sound: { en: 'q (a deep k)', bn: 'ক্ব (গভীর ক)' }, makhraj: { en: 'The back of the tongue meets the soft palate behind it; a deep, heavy sound.', bn: 'জিহ্বার পেছনের অংশ তার ওপরের নরম তালুর সঙ্গে লাগে; গভীর ও মোটা আওয়াজ।' } },
  { id: 'kaf', ar: 'ك', name: { en: 'Kaf', bn: 'কাফ', ar: 'كاف' }, group: 'lisan', seed: 'كتاب', sound: { en: 'k', bn: 'ক' }, makhraj: { en: 'The back of the tongue, a little forward of qaf, meets the palate; a lighter sound.', bn: 'জিহ্বার পেছনের অংশ, ق-এর চেয়ে সামান্য সামনে, তালুর সঙ্গে লাগে; হালকা আওয়াজ।' } },
  { id: 'lam', ar: 'ل', name: { en: 'Lam', bn: 'লাম', ar: 'لام' }, group: 'lisan', seed: 'لسان', sound: { en: 'l', bn: 'ল' }, makhraj: { en: 'The sides of the front of the tongue touch the gum above the front teeth.', bn: 'জিহ্বার সামনের পাশ ওপরের সামনের দাঁতের মাড়ির সঙ্গে লাগে।' } },
  { id: 'mim', ar: 'م', name: { en: 'Mim', bn: 'মীম', ar: 'ميم' }, group: 'shafatan', seed: 'ملك', sound: { en: 'm', bn: 'ম' }, makhraj: { en: 'Both lips close; the sound also resonates in the nose.', bn: 'দুই ঠোঁট বন্ধ হয়; আওয়াজ নাকেও অনুরণিত হয়।' } },
  { id: 'nun', ar: 'ن', name: { en: 'Nun', bn: 'নূন', ar: 'نون' }, group: 'lisan', seed: 'نور', sound: { en: 'n', bn: 'ন' }, makhraj: { en: 'The tip of the tongue touches the gum just above the front teeth; nasal.', bn: 'জিহ্বার অগ্রভাগ সামনের দাঁতের ঠিক ওপরের মাড়ি স্পর্শ করে; নাকের সুরসহ।' } },
  { id: 'ha', ar: 'ه', name: { en: 'Ha (light)', bn: 'হা (হালকা)', ar: 'هاء' }, group: 'halq', seed: 'هدى', sound: { en: 'h', bn: 'হ' }, makhraj: { en: 'The deepest part of the throat; a light breath.', bn: 'গলার একদম গভীর থেকে; হালকা শ্বাসের আওয়াজ।' } },
  { id: 'waw', ar: 'و', name: { en: 'Waw', bn: 'ওয়াও', ar: 'واو' }, rightJoinOnly: true, group: 'shafatan', seed: 'وجه', sound: { en: 'w (or the long vowel “oo”)', bn: 'ও/ওয়া (বা দীর্ঘ “উ” স্বর)' }, makhraj: { en: 'The lips are rounded and the sound is released. As a madd letter it is a long “oo” from the empty space of the mouth.', bn: 'ঠোঁট গোল করে আওয়াজ ছাড়া হয়। মাদ্দের হরফ হিসেবে এটি মুখের ফাঁকা স্থান থেকে দীর্ঘ “উ”।' } },
  { id: 'ya', ar: 'ي', name: { en: 'Ya', bn: 'ইয়া', ar: 'ياء' }, group: 'lisan', seed: 'يوم', sound: { en: 'y (or the long vowel “ee”)', bn: 'ই/ইয়া (বা দীর্ঘ “ঈ” স্বর)' }, makhraj: { en: 'The middle of the tongue meets the palate. As a madd letter it is a long “ee” from the empty space of the mouth.', bn: 'জিহ্বার মাঝখান তালুর সঙ্গে লাগে। মাদ্দের হরফ হিসেবে এটি মুখের ফাঁকা স্থান থেকে দীর্ঘ “ঈ”।' } },
]

const ZWJ = '‍'
/** Isolated, initial, medial and final forms (the font joins them because of the zero-width joiners). */
export function letterForms(l: ArabicLetter) {
  return {
    isolated: l.ar,
    initial: l.rightJoinOnly ? l.ar : l.ar + ZWJ,
    medial: l.rightJoinOnly ? ZWJ + l.ar : ZWJ + l.ar + ZWJ,
    final: ZWJ + l.ar,
  }
}
