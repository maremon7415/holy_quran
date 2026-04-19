'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import DuaCard from '@/components/dua-card'
import { Dua, getAllDuas } from '@/lib/dua-data'
import { useI18n } from '@/lib/i18n'

export default function DuaLibraryPage() {
  const [duas, setDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    const fetchDuas = async () => {
      try {
        const data = await getAllDuas()
        setDuas(data)
      } catch (error) {
        console.error('Failed to fetch duas', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDuas()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(duas.map(d => d.category))
    return ['All', ...Array.from(cats)]
  }, [duas])

  const filteredDuas = useMemo(() => {
    return duas.filter(dua => {
      const matchesSearch = 
        dua.translation.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
        dua.translation.bn.includes(searchQuery) ||
        dua.arabic.includes(searchQuery) ||
        dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = activeCategory === 'All' || dua.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [duas, searchQuery, activeCategory])

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <Sidebar />

      <div className="max-w-5xl mx-auto px-4 py-8 mt-16 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <BookOpen className="w-4 h-4 rotate-180" /> {t('back', { defaultValue: 'Back' })}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('dua_library', { defaultValue: "Du'a Library" })}
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search', { defaultValue: 'Search supplications...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {!loading && categories.length > 1 && (
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredDuas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDuas.map((dua) => (
              <motion.div
                key={dua.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <DuaCard dua={dua} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {t('no_dua_found', { defaultValue: 'No supplications found.' })}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
