/** Pure string picker shared by server and client code. */
export type Lang = 'en' | 'bn' | 'ar'
export type Tr<T = string> = { en: T; bn?: T; ar?: T }

/** pick('bn', { en: 'Read', bn: 'পড়ুন' }) — falls back to English. */
export function pick<T>(lang: Lang | string, v: Tr<T>): T {
  return ((v as Record<string, T | undefined>)[lang] ?? v.en) as T
}

/** Bangla digits for server-rendered numbers on /bn pages. */
export const bnNum = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])
/** Localised digits: Bangla on bn, Western elsewhere (Arabic UI keeps Western digits for numbers in chrome). */
export const num = (lang: Lang | string, n: number | string) => (lang === 'bn' ? bnNum(n) : String(n))
