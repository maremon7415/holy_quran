'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Settings2, Clock, Edit2, Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import { useGeolocation } from '@/hooks/use-geolocation'
import { getPrayerTimes, PrayerTimeConfig } from '@/lib/prayer-api'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import PrayerCountdown from '@/components/prayer-countdown'
import { format } from 'date-fns'

export default function PrayerTimesPage() {
  const { latitude, longitude, city, loading, error, retry } = useGeolocation()
  const { prayerMethod, setLocation } = useAppStore()
  const { t } = useI18n()
  const router = useRouter()
  const [hijriDate, setHijriDate] = useState<string>('')

  // Calculate prayer times
  const prayerTimesObj = latitude && longitude 
    ? getPrayerTimes({ latitude, longitude, method: prayerMethod as PrayerTimeConfig['method'] })
    : null

  // Fetch Hijri date using Aladhan API
  useEffect(() => {
    const fetchHijri = async () => {
      try {
        const todayStr = format(new Date(), 'dd-MM-yyyy')
        const res = await fetch(`https://api.aladhan.com/v1/gToH/${todayStr}`)
        const data = await res.json()
        if (data.code === 200) {
          setHijriDate(`${data.data.hijri.day} ${data.data.hijri.month.en} ${data.data.hijri.year}`)
        }
      } catch (err) {
        console.error('Failed to fetch Hijri date')
      }
    }
    fetchHijri()
  }, [])

  const formatTime = (date: Date) => {
    return format(date, 'hh:mm a')
  }

  const prayers = prayerTimesObj ? [
    { name: 'Fajr', time: prayerTimesObj.fajr },
    { name: 'Sunrise', time: prayerTimesObj.sunrise, isSun: true },
    { name: 'Dhuhr', time: prayerTimesObj.dhuhr },
    { name: 'Asr', time: prayerTimesObj.asr },
    { name: 'Maghrib', time: prayerTimesObj.maghrib },
    { name: 'Isha', time: prayerTimesObj.isha },
  ] : []

  const nextPrayer = prayerTimesObj?.nextPrayer()

  const [showLocationEdit, setShowLocationEdit] = useState(false)
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: any) => {
    setCustomLat(result.lat)
    setCustomLng(result.lon)
    setCustomCity(result.display_name.split(',')[0])
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSaveLocation = () => {
    if (customLat && customLng && !isNaN(Number(customLat)) && !isNaN(Number(customLng))) {
      setLocation({ 
        latitude: Number(customLat), 
        longitude: Number(customLng), 
        city: customCity || 'Custom Location' 
      })
      setShowLocationEdit(false)
    } else {
      alert("Invalid coordinates.")
    }
  }

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
            <Clock className="w-4 h-4 rotate-180" /> {t('back', { defaultValue: 'Back' })}
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('prayer_times', { defaultValue: 'Prayer Times' })}
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-muted-foreground gap-4">
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4 text-primary" />
              {loading ? (
                <span className="animate-pulse w-24 h-4 bg-muted rounded"></span>
              ) : error ? (
                <span className="text-destructive text-sm flex gap-2 items-center">
                  {error} 
                  <button onClick={retry} className="underline">Retry</button>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{city}</span>
                  <button onClick={() => {
                    setCustomLat(latitude?.toString() || '')
                    setCustomLng(longitude?.toString() || '')
                    setCustomCity(city || '')
                    setShowLocationEdit(true)
                  }} className="text-muted-foreground hover:text-primary transition-colors hover:scale-105 active:scale-95" title="Set Custom Location">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-sm font-medium">
              {format(new Date(), 'EEEE, MMMM do, yyyy')} 
              {hijriDate && <span className="mx-2 text-primary">• {hijriDate}</span>}
            </div>
          </div>
        </motion.div>

        {/* Custom Location Edit Dialog */}
        <AnimatePresence>
          {showLocationEdit && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLocationEdit(false)}
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="pointer-events-auto w-full max-w-md bg-background rounded-3xl border border-border p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                    <MapPin className="w-5 h-5 text-primary" />
                    Set Custom Location
                  </h3>

                  <div className="mb-6 relative z-10">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                      Search City
                    </label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                          placeholder="Search city (e.g. Dhaka, London)"
                          className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                        />
                       </div>
                       <button 
                        onClick={handleLocationSearch}
                        disabled={isSearching}
                        className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                       >
                         {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                       </button>
                    </div>

                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto"
                        >
                          {searchResults.map((res: any, i) => (
                            <button
                              key={i}
                              onClick={() => selectSearchResult(res)}
                              className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors border-b border-border/50 last:border-0"
                            >
                              {res.display_name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="space-y-4 mb-6 relative z-10">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                        City Name
                      </label>
                      <input 
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="e.g. London"
                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                          Latitude
                        </label>
                        <input 
                          type="text"
                          value={customLat}
                          onChange={(e) => setCustomLat(e.target.value)}
                          placeholder="51.5074"
                          className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
                          Longitude
                        </label>
                        <input 
                          type="text"
                          value={customLng}
                          onChange={(e) => setCustomLng(e.target.value)}
                          placeholder="-0.1278"
                          className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 relative z-10 mt-auto">
                    <button 
                      onClick={() => setShowLocationEdit(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveLocation}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {prayerTimesObj && !loading ? (
          <div className="space-y-8">
            <PrayerCountdown prayerTimes={prayerTimesObj} />

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                <h3 className="font-semibold">{t('daily_schedule', { defaultValue: 'Daily Schedule' })}</h3>
                <button className="text-muted-foreground hover:text-foreground transition-colors p-2" title="Settings">
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
              <div className="divide-y divide-border/50">
                {prayers.map((prayer) => {
                  const isNext = nextPrayer === prayer.name.toLowerCase()
                  return (
                    <div 
                      key={prayer.name} 
                      className={`flex justify-between items-center p-4 sm:p-6 transition-colors ${
                        isNext ? 'bg-primary/5 relative' : 'hover:bg-muted/10'
                      }`}
                    >
                      {isNext && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-medium ${isNext ? 'text-primary' : prayer.isSun ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {prayer.name}
                        </span>
                      </div>
                      <span className={`text-xl font-bold font-mono tracking-tight ${isNext ? 'text-primary' : prayer.isSun ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {formatTime(prayer.time)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse space-y-8 mt-12">
            <div className="h-64 bg-muted rounded-3xl"></div>
            <div className="h-96 bg-muted rounded-2xl"></div>
          </div>
        )}
      </div>
    </main>
  )
}
