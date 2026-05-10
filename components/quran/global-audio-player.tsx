'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, ChevronDown, Repeat, Repeat1, ListMusic, Loader2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/lib/store'

const RECITERS = [
  { id: 7, name: 'Mishary Alafasy', avatar: 'MA' },
  { id: 4, name: 'Abu Bakr Al-Shatri', avatar: 'AB' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary', avatar: 'MH' },
  { id: 9, name: 'Minshawi (Murattal)', avatar: 'MM' },
  { id: 1, name: 'Abdul Basit (Mujawwad)', avatar: 'AB' },
  { id: 3, name: 'Abdur-Rahman as-Sudais', avatar: 'AS' },
  { id: 5, name: 'Hani ar-Rifai', avatar: 'HR' },
]

const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

const URL_CACHE = new Map<string, any[]>()

async function fetchAudioUrls(reciterId: number, surahNumber: number): Promise<any[]> {
  const cacheKey = `${reciterId}-${surahNumber}`
  if (URL_CACHE.has(cacheKey)) return URL_CACHE.get(cacheKey)!

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const files = data.audio_files.map((f: any) => ({
      verseKey: f.verse_key,
      url: `https://verses.quran.com/${f.url}`,
    }))
    URL_CACHE.set(cacheKey, files)
    return files
  } catch (err) {
    console.error('Error fetching audio URLs:', err)
    return []
  }
}

function getFallbackUrl(surah: number, ayah: number): string {
  const surahStr = String(surah).padStart(3, '0')
  const ayahStr = String(ayah).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`
}

export default function GlobalAudioPlayer() {
  const { 
    audioState, 
    setAudioPlaying, 
    setAudioReciter, 
    setAudioVolume, 
    setAudioAutoplay,
    playAyah,
    stopAudio 
  } = useAppStore()
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioUrlsRef = useRef<any[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  const currentSurahAyahs = useMemo(() => {
    return SURAH_AYAH_COUNTS[audioState.surahNumber - 1] || 0
  }, [audioState.surahNumber])

  const getAudioUrl = useCallback((ayah: number): string | null => {
    const key = `${audioState.surahNumber}:${ayah}`
    const file = audioUrlsRef.current.find((f) => f.verseKey === key)
    return file?.url || getFallbackUrl(audioState.surahNumber, ayah)
  }, [audioState.surahNumber])

  useEffect(() => {
    let cancelled = false
    fetchAudioUrls(audioState.reciterId, audioState.surahNumber).then(urls => {
      if (!cancelled) audioUrlsRef.current = urls
    })
    return () => { cancelled = true }
  }, [audioState.reciterId, audioState.surahNumber])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }
    const onEnded = () => {
      setAudioPlaying(false)
      setCurrentTime(0)
      if (audioState.autoplay && currentSurahAyahs && audioState.ayahNumber < currentSurahAyahs) {
        playAyah(audioState.surahNumber, audioState.ayahNumber + 1)
      }
    }
    const onError = () => {
      setError('Audio unavailable')
      setAudioPlaying(false)
      setLoading(false)
      setIsBuffering(false)
    }
    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => {
      setIsBuffering(false)
      setLoading(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [audioState.surahNumber, audioState.ayahNumber, currentSurahAyahs, audioState.autoplay, setAudioPlaying, playAyah])

  useEffect(() => {
    if (audioState.isPlaying && audioRef.current) {
      const url = getAudioUrl(audioState.ayahNumber)
      if (url && audioRef.current.src !== url) {
        audioRef.current.src = url
        audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume
        audioRef.current.play().catch(() => {})
      } else if (!audioRef.current.paused) {
        // Already playing
      } else {
        audioRef.current.play().catch(() => {})
      }
    } else {
      audioRef.current?.pause()
    }
  }, [audioState.isPlaying, audioState.ayahNumber, audioState.surahNumber, getAudioUrl, audioState.isMuted, audioState.volume])

  const loadAndPlay = useCallback(async (ayah: number) => {
    if (!audioRef.current) return

    setLoading(true)
    setError(null)

    if (audioRef.current.src && audioRef.current.src !== window.location.href) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const url = getAudioUrl(ayah)
    if (!url) {
      setLoading(false)
      return
    }

    audioRef.current.src = url
    audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume
    
    try {
      await audioRef.current.play()
      setAudioPlaying(true)
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return
      }
      console.error('Play error:', err)
      setError('Failed to play audio')
      setLoading(false)
    }
  }, [getAudioUrl, audioState.isMuted, audioState.volume, setAudioPlaying])

  const togglePlay = () => {
    if (audioState.isPlaying) {
      setAudioPlaying(false)
    } else {
      loadAndPlay(audioState.ayahNumber)
    }
  }

  const skipBackward = () => {
    if (audioState.ayahNumber > 1) {
      playAyah(audioState.surahNumber, audioState.ayahNumber - 1)
      loadAndPlay(audioState.ayahNumber - 1)
    }
  }

  const skipForward = () => {
    if (currentSurahAyahs && audioState.ayahNumber < currentSurahAyahs) {
      playAyah(audioState.surahNumber, audioState.ayahNumber + 1)
      loadAndPlay(audioState.ayahNumber + 1)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const v = value[0]
    setAudioVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const toggleMute = () => {
    useAppStore.setState(state => ({
      audioState: { ...state.audioState, isMuted: !state.audioState.isMuted }
    }))
  }

  const formatTime = (t: number) => {
    if (!isFinite(t) || t < 0) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const reciter = RECITERS.find(r => r.id === audioState.reciterId) || RECITERS[0]

  if (!audioState.isPlaying && audioState.ayahNumber === 1 && audioState.surahNumber === 1) {
    return null
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <AnimatePresence>
        {showFullPlayer ? (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <button
                  onClick={() => setShowFullPlayer(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold">Now Playing</h2>
                <div className="w-10" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8">
                  <span className="text-6xl font-bold text-primary">{audioState.surahNumber}</span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">Surah {audioState.surahNumber}</h3>
                <p className="text-muted-foreground mb-1">{reciter.name}</p>
                <p className="text-sm text-muted-foreground">Ayah {audioState.ayahNumber} / {currentSurahAyahs}</p>

                <div className="w-full max-w-md mt-8">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-8">
                  <button
                    onClick={() => setAudioAutoplay(!audioState.autoplay)}
                    className={`p-2 rounded-full ${audioState.autoplay ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                    title={audioState.autoplay ? 'Autoplay On' : 'Autoplay Off'}
                  >
                    {audioState.autoplay ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={skipBackward}
                    disabled={audioState.ayahNumber <= 1}
                    className="p-3 rounded-full hover:bg-muted disabled:opacity-30"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-lg"
                  >
                    {loading || isBuffering ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : audioState.isPlaying ? (
                      <Pause className="w-7 h-7" />
                    ) : (
                      <Play className="w-7 h-7 ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={skipForward}
                    disabled={currentSurahAyahs ? audioState.ayahNumber >= currentSurahAyahs : false}
                    className="p-3 rounded-full hover:bg-muted disabled:opacity-30"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>

                  <button className="p-2 rounded-full text-muted-foreground">
                    <ListMusic className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-8 w-full max-w-sm">
                  <button onClick={toggleMute} className="p-2 rounded-full hover:bg-muted">
                    {audioState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <Slider
                    value={[audioState.isMuted ? 0 : audioState.volume]}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl"
          >
            <div className="h-20 px-4 flex items-center justify-between max-w-screen-2xl mx-auto">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => setShowFullPlayer(true)}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0"
                >
                  <span className="text-xl font-bold text-primary">{audioState.surahNumber}</span>
                </button>
                
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Surah {audioState.surahNumber} • Ayah {audioState.ayahNumber}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{reciter.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={skipBackward}
                  disabled={audioState.ayahNumber <= 1}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  {loading || isBuffering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : audioState.isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={skipForward}
                  disabled={currentSurahAyahs ? audioState.ayahNumber >= currentSurahAyahs : false}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 w-48">
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2 w-32">
                <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  {audioState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <Slider
                  value={[audioState.isMuted ? 0 : audioState.volume]}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>

              <button
                onClick={stopAudio}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg shadow-lg">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}