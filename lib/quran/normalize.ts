/** Arabic/Bangla/Latin normalisation used for search (client + server safe). */
export function normalizeArabic(s: string) {
  return s
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '') // harakat, tatweel, quranic marks
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}
export const normalizeLatin = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
export const isArabic = (s: string) => /[؀-ۿ]/.test(s)
export const isBangla = (s: string) => /[ঀ-৿]/.test(s)
