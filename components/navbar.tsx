'use client'

import { useAppStore } from '@/lib/store'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { X, Moon, Sun, Search, Book, UserCircle, LogOut, Clock3, User, Menu, Home, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchModal } from './search-modal'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useI18n } from '@/lib/i18n'

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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-all duration-300 ease-out flex items-center justify-center w-10 h-10 ${
                  mobileMenuOpen ? 'bg-primary/10 text-primary rotate-90 scale-105' : ''
                }`}
                aria-label={t('menu')}
              >
                <Menu className="w-5 h-5 transition-transform duration-300 ease-out" />
              </button>

            </div>
          </div>
        </div>
      </nav>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[4px]"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 z-[110] h-full w-[85vw] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col"
            >
              {/* Header - Fixed Height */}
              <div className="h-[72px] flex items-center justify-between border-b border-border px-6 shrink-0 bg-background/95 backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-foreground">
                    {t('app_name', { defaultValue: 'Quran App' })}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-black">
                    {t('navigation', { defaultValue: 'Navigation' })}
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6 pb-24">
                <div className="space-y-8">
                  {/* Quick Access Bar - COMPACT */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }} 
                      className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all active:scale-95"
                    >
                      <Search className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">{t('open_search')}</span>
                    </button>
                    <button 
                      onClick={handleOpenSettings} 
                      className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-border/50 transition-all active:scale-95"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('display_settings')}</span>
                    </button>
                  </div>

                  {/* Comprehensive Navigation Grid */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 px-1 flex items-center justify-between">
                      {t('navigation')}
                      <div className="h-px flex-1 bg-border/40 ml-4" />
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { href: '/', icon: '🏠', label: t('home') },
                        { href: '/prayer-times', icon: '🕌', label: t('prayer_times') },
                        { href: '/dua', icon: '🤲', label: t('dua_library') },
                        { href: '/dhikr', icon: '📿', label: t('dhikr_counter') },
                        { href: '/qibla', icon: '🕋', label: t('qibla_finder') },
                        { href: '/masayel', icon: '📖', label: t('masayel') },
                        { href: '/calendar', icon: '📅', label: t('islamic_calendar') },
                        { href: '/saved', icon: '🔖', label: t('saved') },
                        { href: '/recent', icon: '🕒', label: t('recent') },
                      ].map((item) => (
                        <Link 
                          key={item.href}
                          href={item.href} 
                          onClick={() => setMobileMenuOpen(false)} 
                          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                          <span className="text-[9px] font-bold uppercase tracking-tight text-center text-foreground/70 truncate w-full">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Personalization Section */}
                  <div className="space-y-4 p-4 rounded-3xl bg-muted/20 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('appearance', { defaultValue: 'Appearance' })}</span>
                      <div className="flex bg-background/50 rounded-lg p-1 border border-border/30">
                        {['light', 'dark', 'system'].map((m) => (
                          <button
                            key={m}
                            onClick={() => setTheme(m)}
                            className={`p-1.5 rounded-md transition-all ${theme === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
                          >
                            {m === 'light' ? <Sun className="w-3.5 h-3.5" /> : m === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <div className="text-[8px] font-black px-1">SYS</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                            language === lang 
                              ? 'bg-primary/10 border-primary/30 text-primary' 
                              : 'border-border/40 text-muted-foreground bg-background/50'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer - SIDE BY SIDE SIDE LAYOUT */}
              <div className="mt-auto p-4 border-t border-border bg-background/95 backdrop-blur-md">
                {session ? (
                  <div className="flex items-center justify-between gap-3 bg-muted/20 border border-border/30 p-2 rounded-2xl">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                        {session.user?.name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate text-foreground leading-tight">{session.user?.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate leading-tight">{session.user?.email}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); signOut(); }} 
                      className="w-10 h-9 shrink-0 flex items-center justify-center rounded-xl bg-destructive/5 text-destructive border border-destructive/20 hover:bg-destructive/10 transition-all active:scale-90"
                      title={t('log_out', { defaultValue: 'Log Out' })}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setMobileMenuOpen(false); signIn(); }} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    {t('sign_in', { defaultValue: 'Sign In' })}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
