'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Book,
  Search,
  Moon,
  Sun,
  Home,
  LayoutGrid,
  Compass,
  Bookmark,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Calendar,
  Hand,
  CircleDot,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { getAllSurahs, getSurahDetails, getSurahTranslation, Surah, Ayah } from '@/lib/api'
import SurahListPanel from '@/components/quran/surah-list-panel'
import ReaderPanel from '@/components/quran/reader-panel'
import SettingsPanel from '@/components/quran/settings-panel'
import AyahSearchModal from '@/components/ayah-search-modal'

interface TranslationData {
  ayahs: Array<{ number: number; text: string }>
}

function QuranPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language, addToRecentlyViewed } = useAppStore()
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const initialSurah = searchParams.get('surah') ? parseInt(searchParams.get('surah')!, 10) : 1

  const [surahs, setSurahs] = useState<Surah[]>([])
  const [selectedSurah, setSelectedSurah] = useState(initialSurah)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [surahName, setSurahName] = useState('')
  const [surahArabicName, setSurahArabicName] = useState('')
  const [englishTranslation, setEnglishTranslation] = useState<TranslationData | null>(null)
  const [bengaliTranslation, setBengaliTranslation] = useState<TranslationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [surahLoading, setSurahLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeNav, setActiveNav] = useState('read')
  const [mobilePanel, setMobilePanel] = useState<'none' | 'left' | 'right'>('none')
  const [searchOpen, setSearchOpen] = useState(false)
  const [surahDetails, setSurahDetails] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await getAllSurahs()
        setSurahs(data)
      } catch (error) {
        console.error('Failed to fetch surahs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSurahs()
  }, [])

  const loadSurah = useCallback(
    async (surahNumber: number) => {
      setSurahLoading(true)
      setSelectedSurah(surahNumber)
      try {
        const details = await getSurahDetails(surahNumber)
        if (details) {
          setAyahs(details.ayahs)
          setSurahName(details.englishName)
          setSurahArabicName(details.name)
          setSurahDetails(details)
          addToRecentlyViewed({
            surahNumber,
            surahName: details.englishName,
            lastAyahRead: 1,
          })
        }

        const [enTrans, bnTrans] = await Promise.all([
          getSurahTranslation(surahNumber, 'en'),
          getSurahTranslation(surahNumber, 'bn'),
        ])
        if (enTrans) setEnglishTranslation(enTrans)
        if (bnTrans) setBengaliTranslation(bnTrans)
      } catch (error) {
        console.error('Failed to fetch surah:', error)
      } finally {
        setSurahLoading(false)
      }
    },
    [addToRecentlyViewed]
  )

  useEffect(() => {
    if (initialSurah >= 1 && initialSurah <= 114) {
      loadSurah(initialSurah)
    }
  }, [initialSurah, loadSurah])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelectSurah = useCallback(
    (surahNumber: number) => {
      loadSurah(surahNumber)
      router.replace(`/quran?surah=${surahNumber}`, { scroll: false })
      setMobilePanel('none')
    },
    [loadSurah, router]
  )

  const currentAyahForSettings = 1

  const navItems = [
    { id: 'home', icon: Home, label: t('home'), href: '/', alwaysActive: false },
    { id: 'read', icon: Book, label: 'Quran', href: '/quran', alwaysActive: true },
    { id: 'prayer', icon: Clock, label: 'Prayer', href: '/prayer-times', alwaysActive: false },
    { id: 'dua', icon: Hand, label: "Du'a", href: '/dua', alwaysActive: false },
    { id: 'dhikr', icon: CircleDot, label: 'Dhikr', href: '/dhikr', alwaysActive: false },
    { id: 'calendar', icon: Calendar, label: 'Calendar', href: '/calendar', alwaysActive: false },
    { id: 'qibla', icon: Compass, label: 'Qibla', href: '/qibla', alwaysActive: false },
    { id: 'saved', icon: Bookmark, label: t('saved'), href: '/saved', alwaysActive: false },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.href && item.href !== '/quran') {
      router.push(item.href)
    } else if (item.id === 'grid') {
      setMobilePanel('left')
    }
    setActiveNav(item.id)
  }

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.alwaysActive) return true
    return activeNav === item.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-16 shrink-0 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">Quran Reader</h1>
              <p className="text-[10px] text-muted-foreground font-medium">Read, Listen & Reflect</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('search_surahs')}</span>
            <span className="text-[10px] text-muted-foreground/50">⌘K</span>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex md:hidden p-2 rounded-lg bg-muted/50 text-muted-foreground"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            suppressHydrationWarning
          >
            {mounted ? (
              theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => handleSelectSurah(selectedSurah < 114 ? selectedSurah + 1 : 1)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Next Surah
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 lg:hidden">
<button
            onClick={() => setMobilePanel(mobilePanel === 'left' ? 'none' : 'left')}
            className={`p-2 rounded-xl transition-colors ${mobilePanel === 'left' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {mobilePanel === 'left' ? <PanelLeftClose className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobilePanel(mobilePanel === 'right' ? 'none' : 'right')}
            className={`p-2 rounded-xl transition-colors ${mobilePanel === 'right' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {mobilePanel === 'right' ? <PanelRightClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <nav className="hidden lg:flex flex-col w-16 shrink-0 border-r border-border/40 bg-card/50 py-4 items-center gap-1">
          {navItems.map(({ id, icon: Icon, label, href }) => {
            const isActive = isNavActive({ id, icon: Icon, label, href, alwaysActive: false })
            return (
              <button
                key={id}
                onClick={() => handleNavClick({ id, icon: Icon, label, href, alwaysActive: false })}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={label}
              >
                <Icon className={`w-5 h-5 ${isActive ? '[stroke-width:2.5]' : ''}`} />
              </button>
            )
          })}
        </nav>

        {/* Mobile Left Edge Slider - Shows when left panel is closed (only on small mobile) */}
        {!mobilePanel && (
          <button
            onClick={() => setMobilePanel('left')}
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-14 bg-primary/90 text-primary-foreground rounded-r-md shadow-md hover:bg-primary transition-all hover:translate-x-1"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mobile Right Edge Slider - Shows when right panel is closed (only on small mobile) */}
        {!mobilePanel && (
          <button
            onClick={() => setMobilePanel('right')}
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-14 bg-primary/90 text-primary-foreground rounded-l-md shadow-md hover:bg-primary transition-all hover:-translate-x-1"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        )}

        <AnimatePresence>
          {mobilePanel === 'left' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobilePanel('none')}
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[360px] bg-background border-r border-border shadow-2xl md:hidden"
                style={{ top: '64px' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <span className="text-sm font-bold text-foreground">Surahs</span>
                  <button
                    onClick={() => setMobilePanel('none')}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <SurahListPanel
                  surahs={surahs}
                  selectedSurah={selectedSurah}
                  onSelectSurah={handleSelectSurah}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="hidden md:flex lg:hidden w-[280px] shrink-0 border-r border-border/40 bg-card/30">
          <SurahListPanel
            surahs={surahs}
            selectedSurah={selectedSurah}
            onSelectSurah={handleSelectSurah}
          />
        </div>

        <div className="hidden lg:flex w-[340px] xl:w-[380px] shrink-0 border-r border-border/40 bg-card/30">
          <SurahListPanel
            surahs={surahs}
            selectedSurah={selectedSurah}
            onSelectSurah={handleSelectSurah}
          />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          {surahLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReaderPanel
              surahNumber={selectedSurah}
              surahName={surahName}
              surahArabicName={surahArabicName}
              ayahs={ayahs}
              englishTranslation={englishTranslation}
              bengaliTranslation={bengaliTranslation}
              totalAyahs={ayahs.length}
              revelationType={surahDetails?.revelationType}
            />
          )}
        </div>

        <AyahSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <AnimatePresence>
          {mobilePanel === 'right' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobilePanel('none')}
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 right-0 z-40 w-[85vw] max-w-[320px] bg-background border-l border-border shadow-2xl md:hidden"
                style={{ top: '64px' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <span className="text-sm font-bold text-foreground">Settings</span>
                  <button
                    onClick={() => setMobilePanel('none')}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <SettingsPanel
                  surahNumber={selectedSurah}
                  currentAyah={currentAyahForSettings}
                  totalAyahs={ayahs.length}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="hidden md:flex lg:hidden w-[260px] shrink-0 border-l border-border/40 bg-card/30">
          <SettingsPanel
            surahNumber={selectedSurah}
            currentAyah={currentAyahForSettings}
            totalAyahs={ayahs.length}
          />
        </div>

        <div className="hidden lg:flex w-[300px] xl:w-[320px] shrink-0 border-l border-border/40 bg-card/30">
          <SettingsPanel
            surahNumber={selectedSurah}
            currentAyah={currentAyahForSettings}
            totalAyahs={ayahs.length}
          />
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Quran...</p>
      </div>
    </div>
  )
}

export default function QuranPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuranPageContent />
    </Suspense>
  )
}