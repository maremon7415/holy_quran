'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen, Sparkles, Star } from 'lucide-react'
import { getAllSurahs, Surah } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel'

const SimpleSurahCard = ({
  surah,
  index,
  isFavorite,
  onToggleFavorite,
  arabicFont,
}: {
  surah: Surah
  index: number
  isFavorite: boolean
  onToggleFavorite: (n: number) => void
  arabicFont: string
}) => {
  const router = useRouter()
  const { t } = useI18n()
  const revelationLabel = surah.revelationType === 'Meccan' ? t('meccan') : t('medinan')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <div
        onClick={() => router.push(`/surah/${surah.number}`)}
        className="group relative h-full cursor-pointer overflow-hidden rounded-[26px] border border-primary/12 bg-[linear-gradient(160deg,rgba(36,81,61,0.12),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_-35px_rgba(36,81,61,0.65)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_60px_-30px_rgba(36,81,61,0.45)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,81,61,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(36,81,61,0.12),transparent_25%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(surah.number)
          }}
          className={`absolute top-20 right-5 z-20 rounded-full border border-white/10 p-2 transition-all ${isFavorite
            ? 'bg-yellow-500/12 text-yellow-500'
            : 'bg-background/50 text-muted-foreground hover:text-yellow-500'
            }`}
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-primary/15 bg-background/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                {revelationLabel}
              </div>
              <h3 className="mb-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                {surah.englishName}
              </h3>
              <p className="text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
            </div>
            <span className="rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-xl font-bold text-primary">
              {surah.number}
            </span>
          </div>

          <div className="mb-4 rounded-2xl border border-white/5 bg-background/40 p-4 backdrop-blur-sm">
            <div className={`mb-3 text-right text-xl text-foreground/80 ${arabicFont}`}>{surah.name}</div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {surah.numberOfAyahs} {t('verses')}
              </span>
              <span className="rounded-full bg-primary/7 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary">
                {revelationLabel}
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-primary/10 pt-3 text-sm">
            <span className="font-medium text-muted-foreground transition-colors group-hover:text-primary">
              {t('read_now')}
            </span>
            <ArrowUpRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SurahSlider() {
  const { favoriteSurahs, toggleFavoriteSurah, arabicFont } = useAppStore()
  const { t } = useI18n()
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await getAllSurahs()
      setSurahs(data)
      setLoading(false)
    }
    load()
  }, [])

  const isFavorite = (num: number) => favoriteSurahs.includes(num)
  const featuredSurahs = surahs.slice(0, 7)
  const favoriteSurahList = surahs.filter((s) => favoriteSurahs.includes(s.number)).slice(0, 5)

  useEffect(() => {
    if (!api || isPaused || featuredSurahs.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      const lastIndex = api.scrollSnapList().length - 1
      const currentIndex = api.selectedScrollSnap()

      if (currentIndex >= lastIndex) {
        api.scrollTo(0)
      } else {
        api.scrollNext()
      }
    }, 3200)

    return () => window.clearInterval(interval)
  }, [api, isPaused, featuredSurahs.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{t('featured_surahs')}</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground md:inline">{t('swipe_or_arrows')}</span>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">{t('auto_sliding_featured')}</p>

        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
          }}
          className="w-full"
        >
          <CarouselContent
            className="-ml-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {featuredSurahs.map((surah, index) => (
              <CarouselItem key={surah.number} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <SimpleSurahCard
                  surah={surah}
                  index={index}
                  isFavorite={isFavorite(surah.number)}
                  onToggleFavorite={toggleFavoriteSurah}
                  arabicFont={arabicFont}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden -left-4 bg-background/90 backdrop-blur md:flex" />
          <CarouselNext className="hidden -right-4 bg-background/90 backdrop-blur md:flex" />
        </Carousel>
      </section>

      {favoriteSurahList.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <h2 className="text-2xl font-bold text-foreground">{t('your_favorites')}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriteSurahList.map((surah, idx) => (
              <motion.div
                key={surah.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <SimpleSurahCard
                  surah={surah}
                  index={idx}
                  isFavorite={true}
                  onToggleFavorite={toggleFavoriteSurah}
                  arabicFont={arabicFont}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
