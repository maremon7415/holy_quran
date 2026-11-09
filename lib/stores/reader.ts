'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ArabicFont = 'amiri-quran' | 'scheherazade' | 'noto-naskh' | 'indopak'
export type ReadingMode = 'translation' | 'reading'

export interface ReaderPrefs {
  showEn: boolean
  showBn: boolean
  showTl: boolean
  /** which English translation: Saheeh International or Abdel Haleem */
  enEdition: 'sahih' | 'haleem'
  arabicFont: ArabicFont
  arabicSize: number // px
  transSize: number // px
  tajweed: boolean
  wordByWord: boolean
  wbwLang: 'en' | 'bn'
  mode: ReadingMode
  reciterId: number // quran.com recitation id
  autoScroll: boolean
  repeatAyah: number // times each ayah repeats (1 = no repeat)
  playbackRate: number
}

interface ReaderStore extends ReaderPrefs {
  set: (p: Partial<ReaderPrefs>) => void
  reset: () => void
}

export const defaultReaderPrefs: ReaderPrefs = {
  showEn: true,
  showBn: true,
  showTl: false,
  enEdition: 'sahih',
  arabicFont: 'amiri-quran',
  arabicSize: 34,
  transSize: 17,
  tajweed: false,
  wordByWord: false,
  wbwLang: 'en',
  mode: 'translation',
  reciterId: 7,
  autoScroll: true,
  repeatAyah: 1,
  playbackRate: 1,
}

export const READER_STORAGE_KEY = 'noor-reader'

export const useReader = create<ReaderStore>()(
  persist(
    (set) => ({
      ...defaultReaderPrefs,
      set: (p) => set(p),
      reset: () => set(defaultReaderPrefs),
    }),
    { name: READER_STORAGE_KEY, version: 1 }
  )
)

export const arabicFontVar: Record<ArabicFont, string> = {
  'amiri-quran': 'var(--font-amiri-quran)',
  scheherazade: 'var(--font-scheherazade)',
  'noto-naskh': 'var(--font-noto-naskh)',
  indopak: 'var(--font-lateef)',
}

/** Mirror prefs to <html> so CSS (and the pre-paint script) can drive visibility. */
export function applyReaderPrefsToDocument(p: Pick<ReaderPrefs, 'showEn' | 'showBn' | 'showTl' | 'arabicFont' | 'arabicSize' | 'transSize' | 'tajweed'>) {
  const el = document.documentElement
  el.dataset.showEn = p.showEn ? '1' : '0'
  el.dataset.showBn = p.showBn ? '1' : '0'
  el.dataset.showTl = p.showTl ? '1' : '0'
  el.style.setProperty('--font-quran', arabicFontVar[p.arabicFont])
  el.style.setProperty('--quran-size', `${p.arabicSize}px`)
  el.style.setProperty('--trans-size', `${p.transSize}px`)
  el.classList.toggle('tajweed-on', p.tajweed)
}

/** Inline script (runs before paint) – keeps SSR HTML complete but hides unwanted translations without flashing. */
export const readerPrefsScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${READER_STORAGE_KEY}')||'{}').state||{};var d=document.documentElement;var f={'amiri-quran':'var(--font-amiri-quran)',scheherazade:'var(--font-scheherazade)','noto-naskh':'var(--font-noto-naskh)',indopak:'var(--font-lateef)'};d.dataset.showEn=s.showEn===false?'0':'1';d.dataset.showBn=s.showBn===false?'0':'1';d.dataset.showTl=s.showTl?'1':'0';if(s.arabicFont)d.style.setProperty('--font-quran',f[s.arabicFont]||'');if(s.arabicSize)d.style.setProperty('--quran-size',s.arabicSize+'px');if(s.transSize)d.style.setProperty('--trans-size',s.transSize+'px');if(s.tajweed)d.classList.add('tajweed-on');var a=JSON.parse(localStorage.getItem('quran-store')||'{}').state||{};if(a.language){d.lang=a.language;d.dataset.lang=a.language}}catch(e){}})();`
