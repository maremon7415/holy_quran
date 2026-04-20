'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import ShortcutPanel from '@/components/shortcut-panel'
import BackButton from '@/components/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Bookmark,
  Star,
  Tag,
  Trash2,
  ChevronRight,
  Target
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getAllSurahs, Surah } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export default function SavedPage() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const { favoriteSurahs, importantAyahs, readingProgress, toggleFavoriteSurah, removeImportantAyah } = useAppStore()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [surahs, setSurahs] = useState<Record<number, Surah>>({})

  useEffect(() => {
    const loadSurahs = async () => {
      const data = await getAllSurahs()
      const map: Record<number, Surah> = {}
      data.forEach(s => { map[s.number] = s })
      setSurahs(map)
    }
    loadSurahs()
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/bookmarks')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBookmarks(data)
        })
    }
  }, [session])

  if (status === 'loading') return null

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">{t('login_required_saved')}</p>
        </div>
      </div>
    )
  }

  const getSurah = (num: number) => surahs[num]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <ShortcutPanel />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BackButton className="mb-4" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('your_library')}</h1>
          <p className="text-muted-foreground">{t('your_library_description')}</p>
        </motion.div>

        <Tabs defaultValue="bookmarks" className="space-y-8">
          <TabsList className="bg-muted p-1 rounded-xl w-full max-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap">
            <TabsTrigger value="bookmarks" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Bookmark className="w-4 h-4" />
              <span>{t('bookmarks')}</span>
              {bookmarks.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-2 py-0 text-[10px]">
                  {bookmarks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="important" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Tag className="w-4 h-4" />
              <span>{t('important')}</span>
              {importantAyahs.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-2 py-0 text-[10px]">
                  {importantAyahs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Star className="w-4 h-4" />
              <span>{t('favorites')}</span>
              {favoriteSurahs.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-2 py-0 text-[10px]">
                  {favoriteSurahs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Target className="w-4 h-4" />
              <span>{t('progress')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="mt-6">
            {bookmarks.length === 0 ? (
              <EmptyState icon={Bookmark} title={t('no_bookmarks')} description={t('no_bookmarks_description')} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {bookmarks.map((bm, idx) => (
                    <motion.div
                      key={bm._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group hover:border-primary/50 transition-all cursor-pointer">
                        <Link href={`/surah/${bm.surahNumber}${bm.ayahNumber ? `#ayah-${bm.ayahNumber}` : ''}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex justify-between items-center">
                              <span className="truncate">{bm.title}</span>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {bm.type === 'surah' ? t('all_surahs') : `${t('verse')} ${bm.ayahNumber}`}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {getSurah(bm.surahNumber)?.englishName || `${t('all_surahs')} ${bm.surahNumber}`}
                              </span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Important Ayahs Tab */}
          <TabsContent value="important" className="mt-6">
            {importantAyahs.length === 0 ? (
              <EmptyState icon={Tag} title={t('no_important_verses')} description={t('no_important_verses_description')} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {importantAyahs.map((ayah, idx) => {
                    const surah = getSurah(ayah.surahNumber)
                    return (
                      <motion.div
                        key={`${ayah.surahNumber}-${ayah.ayahNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="overflow-hidden border-l-4 border-l-yellow-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">
                                <Link href={`/surah/${ayah.surahNumber}`} className="hover:text-primary transition-colors">
                                  {surah?.englishName || `Surah ${ayah.surahNumber}`}
                                </Link>
                                <span className="text-muted-foreground font-normal ml-2">
                                  : {t('verse')} {ayah.ayahNumber}
                                </span>
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImportantAyah(ayah.surahNumber, ayah.ayahNumber)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {ayah.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {ayah.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {ayah.note && (
                              <p className="text-sm text-muted-foreground italic">{ayah.note}</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6">
            {favoriteSurahs.length === 0 ? (
              <EmptyState icon={Star} title={t('no_favorite_surahs')} description={t('no_favorite_surahs_description')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {favoriteSurahs.map((num, idx) => {
                    const surah = surahs[num]
                    if (!surah) return null
                    return (
                      <motion.div
                        key={num}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="group overflow-hidden border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                          <Link href={`/surah/${num}`}>
                            <CardHeader className="pb-3 relative">
                              <div className="absolute top-4 right-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.preventDefault(); toggleFavoriteSurah(num) }}
                                  className="text-yellow-500 hover:text-yellow-600"
                                >
                                  <Star className="w-5 h-5 fill-current" />
                                </Button>
                              </div>
                              <CardTitle className="text-2xl font-bold pr-16">
                                {surah.englishName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {surah.englishNameTranslation} • {surah.numberOfAyahs} {t('verses')}
                              </p>
                              <p className="text-lg font-arabic text-foreground/80 mt-2 text-right">
                                {surah.name}
                              </p>
                            </CardHeader>
                          </Link>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Reading Progress Tab */}
          <TabsContent value="progress" className="mt-6">
            <div className="grid gap-4">
              {Object.keys(readingProgress).length === 0 ? (
                <EmptyState icon={Target} title={t('no_progress_yet')} description={t('no_progress_yet_description')} />
              ) : (
                Object.entries(readingProgress)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([numStr, progress], idx) => {
                    const num = Number(numStr)
                    const surah = surahs[num]
                    if (!surah) return null
                    const normalized =
                      typeof progress === 'number'
                        ? { versesRead: progress, totalAyahs: surah.numberOfAyahs }
                        : progress
                    const totalAyahs = normalized.totalAyahs ?? surah.numberOfAyahs
                    const percent = totalAyahs > 0
                      ? Math.min(100, Math.round((normalized.versesRead / totalAyahs) * 100))
                      : 0
                    return (
                      <motion.div
                        key={num}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Link href={`/surah/${num}`} className="font-semibold hover:text-primary transition-colors">
                              {surah.englishName}
                            </Link>
                            <span className="text-sm text-muted-foreground">{percent}%</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </Card>
                      </motion.div>
                    )
                  })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
      <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
