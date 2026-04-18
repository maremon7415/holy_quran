'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { Search, Loader2, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAllSurahs, searchTranslations, Surah, SearchResult } from '@/lib/api'
import { useI18n } from '@/lib/i18n'

type SearchMode = 'surah' | 'ayah'
type Language = 'en' | 'bn'

export function SearchModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [surahs, setSurahs] = React.useState<Surah[]>([])
  const [mode, setMode] = React.useState<SearchMode>('surah')
  const [language, setLanguage] = React.useState<Language>('en')
  const [query, setQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searching, setSearching] = React.useState(false)
  const router = useRouter()
  const { t } = useI18n()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open && surahs.length === 0) {
      setLoading(true)
      getAllSurahs().then(data => {
        setSurahs(data || [])
        setLoading(false)
      })
    }
  }, [open, surahs.length])

  React.useEffect(() => {
    if (mode === 'ayah' && query.trim().length > 2) {
      const timer = setTimeout(async () => {
        setSearching(true)
        const results = await searchTranslations(query, language)
        setSearchResults(results)
        setSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [query, language, mode])

  const handleSelect = (value: string) => {
    onOpenChange(false)
    router.push(value)
  }

  const groupedResults = React.useMemo(() => {
    const groups = new Map<string, SearchResult[]>()
    searchResults.forEach(result => {
      const key = `${result.surahNumber}-${result.surahEnglishName}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(result)
    })
    return groups
  }, [searchResults])

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-lg duration-200 ${open ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'} sm:rounded-lg`}>
        <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <Command className="flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground">
            <div className="flex items-center border-b border-border px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input 
                ref={inputRef}
                autoFocus
                placeholder={mode === 'surah' ? t('search_surahs_name_or_number') : t('search_ayah_translation')}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                value={query}
                onValueChange={setQuery}
              />
            </div>

            <div className="flex items-center justify-between border-b border-border px-2 py-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => { setMode('surah'); setQuery(''); setSearchResults([]) }}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === 'surah' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  {t('surahs')}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('ayah'); setQuery(''); setSearchResults([]) }}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${mode === 'ayah' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {t('ayahs')}
                </button>
              </div>
              
              {mode === 'ayah' && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${language === 'bn' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    BN
                  </button>
                </div>
              )}
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
              {mode === 'surah' ? (
                <>
                  <Command.Empty className="py-6 text-center text-sm">{t('no_surah_found')}</Command.Empty>
                  {loading && <div className="py-6 flex justify-center"><Loader2 className="animate-spin w-5 h-5 text-primary" /></div>}
                  {!loading && surahs.map((surah) => (
                    <Command.Item
                      key={surah.number}
                      value={`${surah.englishName} ${surah.name} ${surah.number} ${surah.englishNameTranslation}`}
                      onSelect={() => handleSelect(`/surah/${surah.number}`)}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-4 py-3 text-sm outline-none hover:bg-primary/10 hover:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold font-mono">
                            {surah.number}
                          </span>
                          <div>
                            <p className="font-semibold">{surah.englishName}</p>
                            <p className="text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-arabic text-lg">{surah.name}</p>
                          <p className="text-xs text-muted-foreground">{surah.numberOfAyahs} {t('verses')}</p>
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </>
              ) : (
                <>
                  {query.trim().length < 3 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {t('type_at_least_3_characters')}
                    </div>
                  )}
                  {query.trim().length >= 3 && searching && (
                    <div className="py-6 flex justify-center"><Loader2 className="animate-spin w-5 h-5 text-primary" /></div>
                  )}
                  {query.trim().length >= 3 && !searching && searchResults.length === 0 && (
                    <div className="py-6 text-center text-sm">{t('no_ayah_found')}</div>
                  )}
                  {!searching && Array.from(groupedResults.entries()).map(([key, results]) => {
                    const [surahNumber, surahName] = key.split('-')
                    return (
                      <div key={key} className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 rounded-md mb-1">
                          {surahName} ({t('surah')} {surahNumber})
                        </div>
                        {results.map((result, idx) => (
                          <Command.Item
                            key={`${result.surahNumber}-${result.ayahNumber}-${idx}`}
                            value={`${result.surahNumber} ${result.ayahNumber}`}
                            onSelect={() => handleSelect(`/surah/${result.surahNumber}#ayah-${result.ayahNumber}`)}
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-4 py-3 text-sm outline-none hover:bg-primary/10 hover:text-primary"
                          >
                            <div className="w-full">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium text-primary">
                                  {result.ayahNumber}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {t('ayah')} {result.ayahNumber}
                                </span>
                              </div>
                              <p className="text-sm line-clamp-2 text-muted-foreground">
                                {result.text}
                              </p>
                            </div>
                          </Command.Item>
                        ))}
                      </div>
                    )
                  })}
                </>
              )}
            </Command.List>
          </Command>
        </div>
      </div>
    </>
  )
}