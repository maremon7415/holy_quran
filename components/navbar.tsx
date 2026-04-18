'use client'

import { useAppStore } from '@/lib/store'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Moon,
  Sun,
  Search,
  Book,
  UserCircle,
  LogOut,
  Clock3,
  User,
  Menu,
  Home,
  Settings,
} from 'lucide-react'
import { SearchModal } from './search-modal'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useI18n } from '@/lib/i18n'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

const languages = ['en', 'bn', 'ar'] as const
export default function Navbar() {
  const { setLanguage, language } = useAppStore()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { t } = useI18n()

  useEffect(() => {
    setMounted(true)
    
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleOpenSettings = () => {
    window.dispatchEvent(new CustomEvent('open-settings-drawer'))
    setMobileMenuOpen(false)
  }

  const themeLabel =
    theme === 'light' ? t('light') : theme === 'dark' ? t('dark') : t('system')

  return (
    <>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 md:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-primary hover:opacity-80 transition-opacity whitespace-nowrap min-w-0">
              <Book className="w-6 h-6" />
              <span className="hidden sm:inline truncate">{t('app_name')}</span>
            </Link>

            {/* Center - Search Trigger */}
            <div className="hidden md:flex flex-1 max-w-xl mx-auto">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-sm text-muted-foreground group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{t('search_surahs')}</span>
                </div>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Right - Controls */}
            <div className="hidden md:flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Language Selector */}
              <div className="flex bg-muted/50 p-1 rounded-lg">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                      language === lang
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-9 h-9"
                suppressHydrationWarning
              >
                {mounted ? (
                  theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </button>

              <div className="w-px h-6 bg-border mx-2" />

              <Link
                href="/recent"
                className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Clock3 className="w-4 h-4" />
                {t('recent')}
              </Link>
              <Link
                href="/profile"
                className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                {t('profile')}
              </Link>

              {/* User Authentication */}
              {session ? (
                <div className="flex items-center gap-3">
                  <Link href="/saved" className="hidden sm:inline text-sm font-medium hover:text-primary transition-colors">
                    {t('saved')}
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    title="Log out"
                    className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => signIn()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('sign_in')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-10 h-10"
                aria-label={t('open_search')}
              >
                <Search className="w-4 h-4" />
              </button>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-all duration-300 ease-out flex items-center justify-center w-10 h-10 ${
                      mobileMenuOpen ? 'bg-primary/10 text-primary rotate-90 scale-105' : ''
                    }`}
                    aria-label={t('menu')}
                  >
                    <Menu className="w-5 h-5 transition-transform duration-300 ease-out" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
                  <SheetHeader className="border-b border-border px-5 py-5 text-left">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                      <Book className="w-5 h-5 text-primary" />
                      {t('app_name')}
                    </SheetTitle>
                    <SheetDescription>{t('navigation')}</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 px-5 py-5">
                    <section className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t('quick_actions')}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setSearchOpen(true)
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 ease-out"
                        >
                          <Search className="w-4 h-4" />
                          {t('open_search')}
                        </button>
                        <button
                          onClick={handleOpenSettings}
                          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 ease-out"
                        >
                          <Settings className="w-4 h-4" />
                          {t('open_settings')}
                        </button>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t('navigation')}
                      </p>
                      <div className="space-y-2">
                        <Link
                          href="/"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 ease-out"
                        >
                          <Home className="w-4 h-4" />
                          {t('home')}
                        </Link>
                        <Link
                          href="/recent"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 ease-out"
                        >
                          <Clock3 className="w-4 h-4" />
                          {t('recent')}
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 ease-out"
                        >
                          <User className="w-4 h-4" />
                          {t('profile')}
                        </Link>
                        <Link
                          href="/saved"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 ease-out"
                        >
                          <Book className="w-4 h-4" />
                          {t('saved')}
                        </Link>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t('language')}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {languages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out ${
                              language === lang
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t('appearance')}
                      </p>
                      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{t('theme')}</p>
                          <p className="text-xs text-muted-foreground">{themeLabel}</p>
                        </div>
                        <button
                          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                          className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-all duration-300 ease-out hover:scale-105 flex items-center justify-center w-10 h-10"
                          suppressHydrationWarning
                        >
                          {mounted ? (
                            theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </section>

                    <section className="pt-2">
                      {session ? (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            signOut()
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-300 ease-out hover:-translate-y-0.5"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('log_out')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            signIn()
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all duration-300 ease-out hover:-translate-y-0.5"
                        >
                          <UserCircle className="w-4 h-4" />
                          {t('sign_in')}
                        </button>
                      )}
                    </section>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
