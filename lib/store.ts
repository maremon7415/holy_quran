import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReadingStats {
  totalVersesRead: number
  totalSurahsRead: number
  currentStreak: number
  longestStreak: number
  lastReadDate: string | null
  readingHistory: { date: string; versesRead: number }[]
}

export interface SurahProgress {
  lastAyahRead: number
  versesRead: number
  totalAyahs: number | null
  completed: boolean
  completedAt: string | null
  updatedAt: string
}

interface UIState {
  isSidebarOpen: boolean
  isSearchOpen: boolean
  showHeroAnimations: boolean
  carouselIndex: number
}

interface ImportantAyah {
  surahNumber: number
  ayahNumber: number
  tags: string[]
  note?: string
  createdAt: Date | string
}

interface RecentSurah {
  surahNumber: number
  surahName: string
  lastAyahRead: number
  timestamp: Date | string
}

interface ReadVerse {
  surahNumber: number
  ayahNumber: number
  timestamp: Date | string
}

interface MarkAyahOptions {
  surahName?: string
  totalAyahs?: number
}

interface AppStore {
  language: 'en' | 'ar' | 'bn'
  fontSize: number
  theme: 'light' | 'dark' | 'system'
  surahFontSize: number
  ayahFontSize: number
  arabicFont: string
  englishFont: string
  banglaFont: string

  readingStats: ReadingStats
  ui: UIState

  favoriteSurahs: number[]
  importantAyahs: ImportantAyah[]
  recentlyViewed: RecentSurah[]
  readVerses: ReadVerse[]
  readingProgress: Record<number, SurahProgress>

  quickAccessSurahs: number[]

  setLanguage: (lang: 'en' | 'ar' | 'bn') => void
  setFontSize: (size: number) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSurahFontSize: (size: number) => void
  setAyahFontSize: (size: number) => void
  setArabicFont: (font: string) => void
  setEnglishFont: (font: string) => void
  setBanglaFont: (font: string) => void

  incrementVersesRead: (count: number) => void
  markAyahAsRead: (surahNumber: number, ayahNumber: number, options?: MarkAyahOptions) => void
  markSurahAsCompleted: (surahNumber: number, totalAyahs: number) => void
  updateStreak: () => void
  toggleFavoriteSurah: (surahNumber: number) => void
  addImportantAyah: (ayah: Omit<ImportantAyah, 'createdAt'>) => void
  removeImportantAyah: (surahNumber: number, ayahNumber: number) => void
  updateImportantAyah: (
    surahNumber: number,
    ayahNumber: number,
    updates: Partial<ImportantAyah>
  ) => void
  addToRecentlyViewed: (surah: Omit<RecentSurah, 'timestamp'>) => void
  updateLastAyahRead: (surahNumber: number, ayahNumber: number) => void
  setReadingProgress: (surahNumber: number, ayahNumber: number, totalAyahs?: number) => void
  setQuickAccessSurahs: (surahs: number[]) => void
  toggleQuickAccessSurah: (surahNumber: number) => void
  setUIState: (updates: Partial<UIState>) => void
}

const initialReadingStats: ReadingStats = {
  totalVersesRead: 0,
  totalSurahsRead: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  readingHistory: [],
}

const initialUIState: UIState = {
  isSidebarOpen: false,
  isSearchOpen: false,
  showHeroAnimations: true,
  carouselIndex: 0,
}

function getLocalDateString(date = new Date()): string {
  return date.toLocaleDateString('en-CA')
}

function getYesterday(date = new Date()): string {
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  return getLocalDateString(yesterday)
}

function updateHistory(
  history: ReadingStats['readingHistory'],
  date: string,
  count: number
): ReadingStats['readingHistory'] {
  const existing = history.find((entry) => entry.date === date)
  if (existing) {
    return history.map((entry) =>
      entry.date === date ? { ...entry, versesRead: entry.versesRead + count } : entry
    )
  }
  return [...history, { date, versesRead: count }]
}

function updateStreakFields(readingStats: ReadingStats, today: string): ReadingStats {
  if (readingStats.lastReadDate === today) {
    return readingStats
  }

  const yesterday = getYesterday()
  const nextStreak = readingStats.lastReadDate === yesterday ? readingStats.currentStreak + 1 : 1

  return {
    ...readingStats,
    currentStreak: nextStreak,
    longestStreak: Math.max(readingStats.longestStreak, nextStreak),
    lastReadDate: today,
  }
}

function toProgressEntry(
  input: unknown,
  fallbackAyah = 0,
  totalAyahs: number | null = null
): SurahProgress {
  const now = new Date().toISOString()

  if (typeof input === 'number') {
    return {
      lastAyahRead: input,
      versesRead: input,
      totalAyahs,
      completed: typeof totalAyahs === 'number' ? input >= totalAyahs : false,
      completedAt: null,
      updatedAt: now,
    }
  }

  if (!input || typeof input !== 'object') {
    return {
      lastAyahRead: fallbackAyah,
      versesRead: fallbackAyah > 0 ? 1 : 0,
      totalAyahs,
      completed: false,
      completedAt: null,
      updatedAt: now,
    }
  }

  const entry = input as Partial<SurahProgress> & { totalAyahsRead?: number }
  const versesRead =
    typeof entry.versesRead === 'number'
      ? entry.versesRead
      : typeof entry.totalAyahsRead === 'number'
        ? entry.totalAyahsRead
        : typeof entry.lastAyahRead === 'number'
          ? entry.lastAyahRead
          : 0

  return {
    lastAyahRead: typeof entry.lastAyahRead === 'number' ? entry.lastAyahRead : fallbackAyah,
    versesRead,
    totalAyahs: typeof entry.totalAyahs === 'number' ? entry.totalAyahs : totalAyahs,
    completed: Boolean(entry.completed),
    completedAt: typeof entry.completedAt === 'string' ? entry.completedAt : null,
    updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : now,
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      language: 'en',
      fontSize: 16,
      theme: 'system',
      surahFontSize: 18,
      ayahFontSize: 24,
      arabicFont: 'font-amiri',
      englishFont: 'font-outfit',
      banglaFont: 'font-hind-siliguri',

      readingStats: initialReadingStats,
      ui: initialUIState,
      favoriteSurahs: [],
      importantAyahs: [],
      recentlyViewed: [],
      readVerses: [],
      readingProgress: {},
      quickAccessSurahs: [1, 36, 55, 67, 112, 113, 114],

      setLanguage: (lang) => set({ language: lang }),
      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme }),
      setSurahFontSize: (size) => set({ surahFontSize: size }),
      setAyahFontSize: (size) => set({ ayahFontSize: size }),
      setArabicFont: (font) => set({ arabicFont: font }),
      setEnglishFont: (font) => set({ englishFont: font }),
      setBanglaFont: (font) => set({ banglaFont: font }),

      incrementVersesRead: (count) => {
        const { readingStats } = get()
        const today = getLocalDateString()
        const updatedStats = updateStreakFields(
          {
            ...readingStats,
            totalVersesRead: readingStats.totalVersesRead + count,
            readingHistory: updateHistory(readingStats.readingHistory, today, count),
          },
          today
        )

        set({ readingStats: updatedStats })
      },

      markAyahAsRead: (surahNumber, ayahNumber, options) => {
        set((state) => {
          const alreadyRead = state.readVerses.some(
            (verse) => verse.surahNumber === surahNumber && verse.ayahNumber === ayahNumber
          )

          if (alreadyRead) {
            return state
          }

          const nowIso = new Date().toISOString()
          const today = getLocalDateString()
          const nextReadVerses = [
            ...state.readVerses,
            { surahNumber, ayahNumber, timestamp: nowIso },
          ]

          const uniqueAyahs = new Set(
            nextReadVerses
              .filter((verse) => verse.surahNumber === surahNumber)
              .map((verse) => verse.ayahNumber)
          )

          const current = toProgressEntry(
            state.readingProgress[surahNumber],
            0,
            options?.totalAyahs ?? null
          )
          const nextLastAyahRead = Math.max(current.lastAyahRead, ayahNumber)
          const totalAyahs = options?.totalAyahs ?? current.totalAyahs
          const versesRead = uniqueAyahs.size
          const completed = typeof totalAyahs === 'number' ? versesRead >= totalAyahs : current.completed
          const justCompleted = completed && !current.completed

          const updatedProgress: SurahProgress = {
            ...current,
            lastAyahRead: nextLastAyahRead,
            versesRead,
            totalAyahs: totalAyahs ?? null,
            completed,
            completedAt: justCompleted ? nowIso : current.completedAt,
            updatedAt: nowIso,
          }

          const existingHistory = updateHistory(state.readingStats.readingHistory, today, 1)
          const streakUpdated = updateStreakFields(
            {
              ...state.readingStats,
              totalVersesRead: state.readingStats.totalVersesRead + 1,
              totalSurahsRead: justCompleted
                ? state.readingStats.totalSurahsRead + 1
                : state.readingStats.totalSurahsRead,
              readingHistory: existingHistory,
            },
            today
          )

          const surahName = options?.surahName || getSurahName(surahNumber)
          const filteredRecent = state.recentlyViewed.filter((item) => item.surahNumber !== surahNumber)
          const nextRecent: RecentSurah[] = [
            {
              surahNumber,
              surahName,
              lastAyahRead: nextLastAyahRead,
              timestamp: nowIso,
            },
            ...filteredRecent,
          ].slice(0, 10)

          return {
            readVerses: nextReadVerses,
            readingProgress: {
              ...state.readingProgress,
              [surahNumber]: updatedProgress,
            },
            readingStats: streakUpdated,
            recentlyViewed: nextRecent,
          }
        })
      },

      markSurahAsCompleted: (surahNumber, totalAyahs) => {
        set((state) => {
          const current = toProgressEntry(state.readingProgress[surahNumber], 0, totalAyahs)
          if (current.completed) {
            return state
          }

          const readInSurah = new Set(
            state.readVerses
              .filter((verse) => verse.surahNumber === surahNumber)
              .map((verse) => verse.ayahNumber)
          ).size

          if (readInSurah < totalAyahs) {
            return state
          }

          return {
            readingStats: {
              ...state.readingStats,
              totalSurahsRead: state.readingStats.totalSurahsRead + 1,
            },
            readingProgress: {
              ...state.readingProgress,
              [surahNumber]: {
                ...current,
                totalAyahs,
                versesRead: readInSurah,
                completed: true,
                completedAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      updateStreak: () => {
        const { readingStats } = get()
        const today = getLocalDateString()
        set({ readingStats: updateStreakFields(readingStats, today) })
      },

      toggleFavoriteSurah: (surahNumber) => {
        const { favoriteSurahs } = get()
        if (favoriteSurahs.includes(surahNumber)) {
          set({ favoriteSurahs: favoriteSurahs.filter((n) => n !== surahNumber) })
        } else {
          set({ favoriteSurahs: [...favoriteSurahs, surahNumber] })
        }
      },

      addImportantAyah: (ayah) => {
        const { importantAyahs } = get()
        const exists = importantAyahs.find(
          (a) => a.surahNumber === ayah.surahNumber && a.ayahNumber === ayah.ayahNumber
        )
        if (!exists) {
          set({
            importantAyahs: [...importantAyahs, { ...ayah, createdAt: new Date().toISOString() }],
          })
        }
      },

      removeImportantAyah: (surahNumber, ayahNumber) => {
        const { importantAyahs } = get()
        set({
          importantAyahs: importantAyahs.filter(
            (ayah) => !(ayah.surahNumber === surahNumber && ayah.ayahNumber === ayahNumber)
          ),
        })
      },

      updateImportantAyah: (surahNumber, ayahNumber, updates) => {
        const { importantAyahs } = get()
        set({
          importantAyahs: importantAyahs.map((ayah) =>
            ayah.surahNumber === surahNumber && ayah.ayahNumber === ayahNumber
              ? { ...ayah, ...updates }
              : ayah
          ),
        })
      },

      addToRecentlyViewed: (surah) => {
        const { recentlyViewed } = get()
        const filtered = recentlyViewed.filter((entry) => entry.surahNumber !== surah.surahNumber)
        set({
          recentlyViewed: [{ ...surah, timestamp: new Date().toISOString() }, ...filtered].slice(0, 10),
        })
      },

      updateLastAyahRead: (surahNumber, ayahNumber) => {
        const { recentlyViewed } = get()
        const existing = recentlyViewed.find((entry) => entry.surahNumber === surahNumber)

        if (!existing) {
          get().addToRecentlyViewed({
            surahNumber,
            surahName: getSurahName(surahNumber),
            lastAyahRead: ayahNumber,
          })
          return
        }

        set({
          recentlyViewed: recentlyViewed
            .map((entry) =>
              entry.surahNumber === surahNumber
                ? { ...entry, lastAyahRead: ayahNumber, timestamp: new Date().toISOString() }
                : entry
            )
            .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
            .slice(0, 10),
        })
      },

      setReadingProgress: (surahNumber, ayahNumber, totalAyahs) => {
        set((state) => {
          const current = toProgressEntry(state.readingProgress[surahNumber], ayahNumber, totalAyahs ?? null)
          const nextLastAyahRead = Math.max(current.lastAyahRead, ayahNumber)
          const nextTotalAyahs = totalAyahs ?? current.totalAyahs
          const completed =
            typeof nextTotalAyahs === 'number' ? current.versesRead >= nextTotalAyahs : current.completed

          return {
            readingProgress: {
              ...state.readingProgress,
              [surahNumber]: {
                ...current,
                lastAyahRead: nextLastAyahRead,
                totalAyahs: nextTotalAyahs,
                completed,
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      setQuickAccessSurahs: (surahs) => {
        set({ quickAccessSurahs: surahs })
      },

      toggleQuickAccessSurah: (surahNumber) => {
        const { quickAccessSurahs } = get()
        if (quickAccessSurahs.includes(surahNumber)) {
          set({ quickAccessSurahs: quickAccessSurahs.filter((n) => n !== surahNumber) })
        } else {
          set({ quickAccessSurahs: [...quickAccessSurahs, surahNumber] })
        }
      },

      setUIState: (updates) => {
        const { ui } = get()
        set({ ui: { ...ui, ...updates } })
      },
    }),
    {
      name: 'quran-store',
    }
  )
)

function getSurahName(num: number): string {
  const names: Record<number, string> = {
    1: 'Al-Fatiha',
    2: 'Al-Baqarah',
    3: 'Aal-E-Imran',
    4: 'An-Nisa',
    5: "Al-Ma'idah",
    6: "Al-An'am",
    7: "Al-A'raf",
    8: 'Al-Anfal',
    9: 'At-Tawbah',
    10: 'Yunus',
    36: 'Ya-Sin',
    55: 'Ar-Rahman',
    67: 'Al-Mulk',
    112: 'Al-Ikhlas',
    113: 'Al-Falaq',
    114: 'An-Nas',
  }
  return names[num] || `Surah ${num}`
}
