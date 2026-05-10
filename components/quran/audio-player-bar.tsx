'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/lib/store'

const RECITERS = [
  { id: 7, name: 'Mishary Alafasy' },
  { id: 4, name: 'Abu Bakr Al-Shatri' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary' },
  { id: 9, name: 'Minshawi (Murattal)' },
  { id: 1, name: 'Abdul Basit (Mujawwad)' },
  { id: 3, name: 'Abdur-Rahman as-Sudais' },
  { id: 5, name: 'Hani ar-Rifai' },
]

const SURAH_AYAH_COUNTS = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6]

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

export default function AudioPlayerBar() {
  const { 
    audioState, 
    setAudioPlaying, 
    setAudioReciter, 
    setAudioVolume, 
    setAudioAutoplay,
    stopAudio 
  } = useAppStore()
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioUrlsRef = useRef<any[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

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
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setAudioPlaying(false)
      if (audioState.autoplay) {
        const totalAyahs = SURAH_AYAH_COUNTS[audioState.surahNumber - 1]
        if (totalAyahs && audioState.ayahNumber < totalAyahs) {
          useAppStore.getState().playAyah(audioState.surahNumber, audioState.ayahNumber + 1)
        }
      }
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [audioState.autoplay, audioState.ayahNumber, audioState.surahNumber, setAudioPlaying])

  const getAudioUrl = useCallback((ayah: number): string | null => {
    const key = `${audioState.surahNumber}:${ayah}`
    const file = audioUrlsRef.current.find((f) => f.verseKey === key)
    return file?.url || getFallbackUrl(audioState.surahNumber, ayah)
  }, [audioState.surahNumber])

  const loadAndPlay = useCallback(async (ayah: number) => {
    if (!audioRef.current) return

    if (audioRef.current.src && audioRef.current.src !== window.location.href) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const url = getAudioUrl(ayah)
    if (!url) return

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
    }
  }, [getAudioUrl, audioState.isMuted, audioState.volume, setAudioPlaying])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (audioState.isPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
    } else {
      try {
        if (!audioRef.current.src || audioRef.current.src === window.location.href) {
          await loadAndPlay(audioState.ayahNumber)
        } else {
          await audioRef.current.play()
          setAudioPlaying(true)
        }
      } catch {
        await loadAndPlay(audioState.ayahNumber)
      }
    }
  }

  const skipBackward = () => {
    if (audioState.ayahNumber > 1) {
      const prev = audioState.ayahNumber - 1
      loadAndPlay(prev)
    }
  }

  const skipForward = () => {
    const totalAyahs = SURAH_AYAH_COUNTS[audioState.surahNumber - 1]
    if (totalAyahs && audioState.ayahNumber < totalAyahs) {
      const next = audioState.ayahNumber + 1
      loadAndPlay(next)
    }
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
      <div className="fixed bottom-0 left-0 right-0 h-[100px] bg-card border-t border-border z-50">
        <div className="h-full px-4 py-3 flex items-center justify-between max-w-screen-lg mx-auto">
          {/* Left: Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={skipBackward}
              disabled={audioState.ayahNumber <= 1}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
            >
              {audioState.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            
            <button
              onClick={skipForward}
              disabled={audioState.ayahNumber >= SURAH_AYAH_COUNTS[audioState.surahNumber - 1]}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Progress bar */}
          <div className="flex-1 mx-8 max-w-md">
            <div className="text-center mb-1">
              <span className="text-sm font-medium text-foreground">
                Surah {audioState.surahNumber} - Ayah {audioState.ayahNumber}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                • {reciter.name}
              </span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={([val]) => {
                if (audioRef.current && duration) {
                  audioRef.current.currentTime = val
                  setCurrentTime(val)
                }
              }}
              className="w-full"
            />
          </div>

          {/* Right: Volume & Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                useAppStore.setState(state => ({
                  audioState: { ...state.audioState, isMuted: !state.audioState.isMuted }
                }))
              }}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
            >
              {audioState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            <Slider
              value={[audioState.volume]}
              max={1}
              step={0.05}
              onValueChange={([vol]) => setAudioVolume(vol)}
              className="w-20"
            />
            
            <button
              onClick={stopAudio}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}