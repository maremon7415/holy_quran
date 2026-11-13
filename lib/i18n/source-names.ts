import { bnNum } from './t'

const NAMES: Record<string, { bn: string; ar: string }> = {
  'Sahih al-Bukhari': { bn: 'সহীহ বুখারী', ar: 'صحيح البخاري' },
  'Sahih Muslim': { bn: 'সহীহ মুসলিম', ar: 'صحيح مسلم' },
  'Jami at-Tirmidhi': { bn: 'জামে আত-তিরমিযী', ar: 'جامع الترمذي' },
  'Sunan Abi Dawud': { bn: 'সুনানে আবী দাউদ', ar: 'سنن أبي داود' },
  'Sunan Ibn Majah': { bn: 'সুনানে ইবনে মাজাহ', ar: 'سنن ابن ماجه' },
  "Sunan an-Nasa'i": { bn: 'সুনানে নাসাঈ', ar: 'سنن النسائي' },
  'Muwatta Malik': { bn: 'মুয়াত্তা ইমাম মালিক', ar: 'موطأ مالك' },
  Quran: { bn: 'কুরআন', ar: 'القرآن' },
}

/** "Sahih al-Bukhari 6306; Quran 2:201" → the same citation in the UI language (digits are Bangla only in bn). */
export function sourceFor(lang: string, s: string) {
  if (lang !== 'bn' && lang !== 'ar') return s
  let out = s
  for (const [en, tr] of Object.entries(NAMES)) out = out.split(en).join(tr[lang])
  return lang === 'bn' ? bnNum(out) : out
}
