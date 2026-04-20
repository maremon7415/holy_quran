'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface AudioRecitationProps {
  surahNumber: number
  ayahNumber?: number
  onAyahChange?: (ayahNumber: number) => void
  totalAyahs?: number
  showImage?: boolean
}

// Ayah counts for each surah (1-114)
const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
]

// Calculate global ayah number (1-6236) from surah and ayah
const calculateGlobalAyahNumber = (surah: number, ayah: number): number => {
  let globalAyah = 0
  // Sum up all ayahs in previous surahs
  for (let i = 0; i < surah - 1; i++) {
    globalAyah += SURAH_AYAH_COUNTS[i]
  }
  // Add current ayah
  globalAyah += ayah
  return globalAyah
}

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi' },
  { id: 'ar.abdulbasit', name: 'Abdul Basit Abdul Samad' },
  { id: 'ar.ghamadi', name: 'Saad Al-Ghamdi' },
  { id: 'ar.shatri', name: 'Abu Bakr Al-Shatri' },
  { id: 'ar.ayman_swaaid', name: 'Ayman Sweaid' },
]

const BITRATES = [128, 64, 48, 32] // Available bitrates

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
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id)
  const [selectedBitrate, setSelectedBitrate] = useState(BITRATES[0])
  const [currentAyah, setCurrentAyah] = useState(ayahNumber || 1)
  const [error, setError] = useState<string | null>(null)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [showAyahImage, setShowAyahImage] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Build audio URL using Islamic Network CDN (correct format)
  const getAudioUrl = useCallback((surah: number, ayah: number) => {
    const globalAyahNumber = calculateGlobalAyahNumber(surah, ayah)
    return `https://cdn.islamic.network/quran/audio/${selectedBitrate}/${selectedReciter}/${globalAyahNumber}.mp3`
  }, [selectedReciter, selectedBitrate])

  // Get ayah image URL
  const getAyahImageUrl = useCallback(() => {
    return `https://cdn.islamic.network/quran/images/${surahNumber}_${currentAyah}.png`
  }, [surahNumber, currentAyah])

  // Load audio (without playing)
  const loadAudio = useCallback((surah: number, ayah: number) => {
    const audio = audioRef.current
    if (!audio) return
    
    setLoading(true)
    setError(null)
    
    const url = getAudioUrl(surah, ayah)
    console.log('Loading audio:', url)
    
    audio.src = url
    audio.volume = isMuted ? 0 : volume
    audio.load()
  }, [getAudioUrl, isMuted, volume])

  // Load and play audio
  const loadAndPlayAudio = useCallback(async (surah: number, ayah: number) => {
    const audio = audioRef.current
    if (!audio) return
    
    setLoading(true)
    setError(null)
    
    try {
      const url = getAudioUrl(surah, ayah)
      console.log('Playing audio:', url)
      
      audio.src = url
      audio.volume = isMuted ? 0 : volume
      
      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Play error:', err)
      setError('Failed to play audio. Try another reciter or bitrate.')
      setLoading(false)
      setIsPlaying(false)
    }
  }, [getAudioUrl, isMuted, volume])

  // Initialize audio when component mounts or ayah changes
  useEffect(() => {
    if (ayahNumber && ayahNumber !== currentAyah) {
      setCurrentAyah(ayahNumber)
      setAudioLoaded(false)
      setCurrentTime(0)
      setDuration(0)
      setError(null)
      setImageLoaded(false)
      setImageError(false)
      
      // Load audio for new ayah
      loadAudio(surahNumber, ayahNumber)
    }
  }, [ayahNumber, surahNumber, currentAyah, loadAudio])

  // Initial load on mount
  useEffect(() => {
    if (!audioLoaded && !loading && surahNumber && currentAyah) {
      loadAudio(surahNumber, currentAyah)
    }
  }, [audioLoaded, loading, surahNumber, currentAyah, loadAudio])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setAudioLoaded(true)
      setLoading(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      // Auto-advance if not last ayah
      if (totalAyahs && currentAyah < totalAyahs) {
        const nextAyah = currentAyah + 1
        setCurrentAyah(nextAyah)
        onAyahChange?.(nextAyah)
        setTimeout(() => {
          loadAndPlayAudio(surahNumber, nextAyah)
        }, 300)
      }
    }
    const handleError = () => {
      console.error('Audio error for:', audio.src)
      setError('Failed to load audio. Try another reciter or bitrate.')
      setLoading(false)
      setIsPlaying(false)
      setAudioLoaded(false)
    }
    const handleCanPlay = () => {
      setAudioLoaded(true)
      setLoading(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [surahNumber, currentAyah, totalAyahs, onAyahChange, loadAndPlayAudio])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (!audioLoaded) {
        await loadAndPlayAudio(surahNumber, currentAyah)
      } else {
        try {
          await audio.play()
          setIsPlaying(true)
        } catch (err) {
          console.error('Resume error:', err)
          await loadAndPlayAudio(surahNumber, currentAyah)
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
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0) setIsMuted(false)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      const newMuted = !isMuted
      audio.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  const skipBackward = () => {
    if (currentAyah > 1) {
      const prevAyah = currentAyah - 1
      setCurrentAyah(prevAyah)
      onAyahChange?.(prevAyah)
      loadAudio(surahNumber, prevAyah)
    }
  }

  const skipForward = () => {
    if (totalAyahs && currentAyah < totalAyahs) {
      const nextAyah = currentAyah + 1
      setCurrentAyah(nextAyah)
      onAyahChange?.(nextAyah)
      loadAudio(surahNumber, nextAyah)
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleReciterChange = (newReciter: string) => {
    setSelectedReciter(newReciter)
    setError(null)
    setAudioLoaded(false)
    loadAudio(surahNumber, currentAyah)
  }

  const handleBitrateChange = (newBitrate: number) => {
    setSelectedBitrate(newBitrate)
    setError(null)
    setAudioLoaded(false)
    loadAudio(surahNumber, currentAyah)
  }

  const retryLoad = () => {
    setError(null)
    loadAudio(surahNumber, currentAyah)
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Ayah Image */}
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
                  Image not available for this ayah
                </div>
              ) : (
                <img
                  src={getAyahImageUrl()}
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

      {/* Reciter Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Select Reciter
        </label>
        <select
          value={selectedReciter}
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

      {/* Bitrate Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Audio Quality
        </label>
        <div className="flex gap-2">
          {BITRATES.map((bitrate) => (
            <button
              key={bitrate}
              onClick={() => handleBitrateChange(bitrate)}
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
      </div>

      {/* Error Message */}
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

      {/* Progress Bar */}
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

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={skipBackward}
          disabled={currentAyah <= 1}
        >
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

      {/* Volume Control */}
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

      {/* Footer: Ayah indicator + Image toggle */}
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
