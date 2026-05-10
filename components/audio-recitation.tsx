'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, AlertCircle, Image as ImageIcon, RefreshCw, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface AudioRecitationProps {
  surahNumber: number
  ayahNumber?: number
  onAyahChange?: (ayahNumber: number) => void
  totalAyahs?: number
  showImage?: boolean
}

interface AudioFile {
  verseKey: string
  url: string
}

const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

const calculateGlobalAyahNumber = (surah: number, ayah: number): number => {
  let globalAyah = 0
  for (let i = 0; i < surah - 1; i++) {
    globalAyah += SURAH_AYAH_COUNTS[i]
  }
  globalAyah += ayah
  return globalAyah
}

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', quranComId: 7 },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', quranComId: 6 },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', quranComId: 9 },
  { id: 'ar.abdulbasit', name: 'Abdul Basit Abdul Samad', quranComId: 1 },
  { id: 'ar.shatri', name: 'Abu Bakr Al-Shatri', quranComId: 4 },
  { id: 'ar.sudais', name: 'Abdur-Rahman as-Sudais', quranComId: 3 },
]

const BITRATES = [128, 64]

const URL_CACHE = new Map<string, AudioFile[]>()

async function fetchQuranComUrls(reciterId: number, surahNumber: number): Promise<AudioFile[]> {
  const cacheKey = `qc-${reciterId}-${surahNumber}`
  if (URL_CACHE.has(cacheKey)) return URL_CACHE.get(cacheKey)!

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const files: AudioFile[] = data.audio_files.map((f: any) => ({
      verseKey: f.verse_key,
      url: `https://verses.quran.com/${f.url}`,
    }))
    URL_CACHE.set(cacheKey, files)
    return files
  } catch (err) {
    console.error('Quran.com audio fetch error:', err)
    return []
  }
}

function getEveryAyahUrl(surah: number, ayah: number): string {
  const surahStr = String(surah).padStart(3, '0')
  const ayahStr = String(ayah).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`
}

function getIslamicNetworkUrl(surah: number, ayah: number, reciter: string, bitrate: number): string {
  const globalAyah = calculateGlobalAyahNumber(surah, ayah)
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter}/${globalAyah}.mp3`
}

export default function AudioRecitation({
  surahNumber,
  ayahNumber,
  onAyahChange,
  totalAyahs = 0,
  showImage = true,
}: AudioRecitationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0])
  const [selectedBitrate, setSelectedBitrate] = useState(BITRATES[0])
  const [currentAyah, setCurrentAyah] = useState(ayahNumber || 1)
  const [error, setError] = useState<string | null>(null)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [showAyahImage, setShowAyahImage] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  const [audioUrls, setAudioUrls] = useState<AudioFile[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchQuranComUrls(selectedReciter.quranComId, surahNumber).then(setAudioUrls)
  }, [selectedReciter.quranComId, surahNumber])

  const getAudioUrl = useCallback(
    (ayah: number): string | null => {
      const key = `${surahNumber}:${ayah}`
      const file = audioUrls.find((f) => f.verseKey === key)
      return file?.url || null
    },
    [audioUrls, surahNumber]
  )

  const buildUrl = useCallback(
    (surah: number, ayah: number): string => {
      return getAudioUrl(ayah) || getEveryAyahUrl(surah, ayah)
    },
    [getAudioUrl]
  )

  useEffect(() => {
    if (ayahNumber && ayahNumber !== currentAyah) {
      setCurrentAyah(ayahNumber)
      setAudioLoaded(false)
      setCurrentTime(0)
      setDuration(0)
      setError(null)
      setImageLoaded(false)
      setImageError(false)
    }
  }, [ayahNumber, currentAyah])

  const loadAndPlay = useCallback(
    async (surah: number, ayah: number) => {
      const audio = audioRef.current
      if (!audio) return

      setLoading(true)
      setError(null)

      const url1 = buildUrl(surah, ayah)

      try {
        audio.src = url1
        audio.volume = isMuted ? 0 : volume
        await audio.play()
        setIsPlaying(true)
        return
      } catch {}

      const url2 = getIslamicNetworkUrl(surah, ayah, selectedReciter.id, selectedBitrate)
      try {
        audio.src = url2
        audio.volume = isMuted ? 0 : volume
        await audio.play()
        setIsPlaying(true)
        return
      } catch {}

      const url3 = getEveryAyahUrl(surah, ayah)
      if (url3 !== url1) {
        try {
          audio.src = url3
          audio.volume = isMuted ? 0 : volume
          await audio.play()
          setIsPlaying(true)
          return
        } catch {}
      }

      setError('Failed to play audio. Try another reciter.')
      setLoading(false)
      setIsPlaying(false)
    },
    [buildUrl, isMuted, volume, selectedReciter.id, selectedBitrate]
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      setDuration(audio.duration)
      setAudioLoaded(true)
      setLoading(false)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (autoplay && totalAyahs && currentAyah < totalAyahs) {
        const next = currentAyah + 1
        setCurrentAyah(next)
        onAyahChange?.(next)
        setTimeout(() => loadAndPlay(surahNumber, next), 300)
      }
    }
    const onError = () => {
      const fallback = getEveryAyahUrl(surahNumber, currentAyah)
      if (audio.src !== fallback && !audio.src.includes('everyayah')) {
        audio.src = fallback
        audio.load()
        return
      }
      setError('Failed to load audio. Try another reciter.')
      setLoading(false)
      setIsPlaying(false)
      setAudioLoaded(false)
    }
    const onCanPlay = () => {
      setAudioLoaded(true)
      setLoading(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [surahNumber, currentAyah, totalAyahs, onAyahChange, loadAndPlay, autoplay])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (!audioLoaded || !audio.src || audio.src === window.location.href) {
        await loadAndPlay(surahNumber, currentAyah)
      } else {
        try {
          await audio.play()
          setIsPlaying(true)
        } catch {
          await loadAndPlay(surahNumber, currentAyah)
        }
      }
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio && audioLoaded) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const v = value[0]
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
    if (v > 0) setIsMuted(false)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      const next = !isMuted
      audio.muted = next
      setIsMuted(next)
    }
  }

  const skipBackward = () => {
    if (currentAyah > 1) {
      const prev = currentAyah - 1
      setCurrentAyah(prev)
      onAyahChange?.(prev)
      if (isPlaying) loadAndPlay(surahNumber, prev)
    }
  }

  const skipForward = () => {
    if (totalAyahs && currentAyah < totalAyahs) {
      const next = currentAyah + 1
      setCurrentAyah(next)
      onAyahChange?.(next)
      if (isPlaying) loadAndPlay(surahNumber, next)
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return '0:00'
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleReciterChange = (newId: string) => {
    const reciter = RECITERS.find((r) => r.id === newId)
    if (reciter) {
      setSelectedReciter(reciter)
      setError(null)
      setAudioLoaded(false)
      setAudioUrls([])
      fetchQuranComUrls(reciter.quranComId, surahNumber).then(setAudioUrls)
      if (isPlaying) loadAndPlay(surahNumber, currentAyah)
    }
  }

  const retryLoad = () => {
    setError(null)
    loadAndPlay(surahNumber, currentAyah)
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <audio ref={audioRef} preload="metadata" />

      <AnimatePresence>
        {showImage && showAyahImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="relative bg-muted rounded-xl overflow-hidden min-h-[100px]">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              {imageError ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Image not available
                </div>
              ) : (
                <img
                  src={`https://cdn.islamic.network/quran/images/${surahNumber}_${currentAyah}.png`}
                  alt={`Surah ${surahNumber} Ayah ${currentAyah}`}
                  className="w-full h-auto"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageLoaded(true)
                    setImageError(true)
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Select Reciter
        </label>
        <select
          value={selectedReciter.id}
          onChange={(e) => handleReciterChange(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          {RECITERS.map((reciter) => (
            <option key={reciter.id} value={reciter.id}>
              {reciter.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-2">
          {BITRATES.map((bitrate) => (
            <button
              key={bitrate}
              onClick={() => setSelectedBitrate(bitrate)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                selectedBitrate === bitrate
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {bitrate}kbps
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-muted-foreground">Autoplay</span>
          <button
            onClick={() => setAutoplay(!autoplay)}
            className={`w-8 h-4.5 rounded-full transition-colors relative ${autoplay ? 'bg-primary' : 'bg-muted'}`}
          >
            <div
              className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${autoplay ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <Button variant="ghost" size="sm" onClick={retryLoad} className="h-8 px-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          disabled={!audioLoaded || loading}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={skipBackward} disabled={currentAyah <= 1}>
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="default"
          size="icon-lg"
          onClick={togglePlay}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skipForward}
          disabled={totalAyahs ? currentAyah >= totalAyahs : false}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <Button variant="ghost" size="icon" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Ayah {currentAyah} / {totalAyahs}
        </span>
        {showImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAyahImage(!showAyahImage)}
            className={`gap-2 ${showAyahImage ? 'text-primary bg-primary/10' : ''}`}
          >
            <ImageIcon className="w-4 h-4" />
            {showAyahImage ? 'Hide Image' : 'Show Image'}
          </Button>
        )}
      </div>
    </div>
  )
}
