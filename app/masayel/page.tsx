'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Search, FileQuestion } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import MasayelCard from '@/components/masayel-card'
import { Masayel, getAllMasayel } from '@/lib/masayel-data'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'

export default function MasayelLibraryPage() {
  const [masayelList, setMasayelList] = useState<Masayel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    const fetchMasayel = async () => {
      try {
        const data = await getAllMasayel()
        setMasayelList(data)
      } catch (error) {
        console.error('Failed to fetch masayel', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMasayel()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(masayelList.map(m => m.category))
    return ['All', ...Array.from(cats)]
  }, [masayelList])

  const filteredMasayel = useMemo(() => {
    return masayelList.filter(m => {
      const qEn = m.question.en.toLowerCase()
      const aEn = m.answer.en.toLowerCase()
      const qBn = m.question.bn
      const aBn = m.answer.bn
      const sq = searchQuery.toLowerCase()
      
      const matchesSearch = qEn.includes(sq) || aEn.includes(sq) || qBn.includes(searchQuery) || aBn.includes(searchQuery)
      const matchesCategory = activeCategory === 'All' || m.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [masayelList, searchQuery, activeCategory])

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <Sidebar />

      <div className="max-w-4xl mx-auto px-4 py-8 mt-16 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <HelpCircle className="w-4 h-4 rotate-180" /> {t('back', { defaultValue: 'Back' })}
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                {t('masayel', { defaultValue: "Islamic Rulings" })}
              </h1>
            </div>
            
            {/* Future "Ask Question" feature */}
            {/*
            <button className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors font-medium text-sm">
              <FileQuestion className="w-4 h-4" />
              Ask a Question
            </button>
            */}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search', { defaultValue: 'Search cases and rulings...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {!loading && categories.length > 1 && (
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredMasayel.length > 0 ? (
          <div className="space-y-4">
            {filteredMasayel.map((masayel) => (
              <motion.div
                key={masayel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MasayelCard masayel={masayel} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
            <BookOpenCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No rulings found
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              We couldn't find any Islamic rulings matching "{searchQuery}". Try different keywords.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
