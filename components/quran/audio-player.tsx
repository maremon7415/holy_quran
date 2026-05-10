'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, RefreshCw, Headphones } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface AudioFile {
  verseKey: string
  url: string
}

interface QuranAudioPlayerProps {
  surahNumber: number
  ayahNumber: number
  onAyahChange?: (ayahNumber: number) => void
  totalAyahs: number
  compact?: boolean
  isFloating?: boolean
}

const RECITERS = [
  { id: 7, name: 'Mishary Alafasy' },
  { id: 4, name: 'Abu Bakr Al-Shatri' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary' },
  { id: 9, name: 'Minshawi (Murattal)' },
  { id: 1, name: 'Abdul Basit (Mujawwad)' },
  { id: 3, name: 'Abdur-Rahman as-Sudais' },
  { id: 5, name: 'Hani ar-Rifai' },
]

const URL_CACHE = new Map<string, AudioFile[]>()

async function fetchAudioUrls(reciterId: number, surahNumber: number): Promise<AudioFile[]> {
  const cacheKey = `${reciterId}-${surahNumber}`
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
    console.error('Error fetching audio URLs:', err)
    return []
  }
}

const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

function getFallbackUrl(surah: number, ayah: number): string {
  const surahStr = String(surah).padStart(3, '0')
  const ayahStr = String(ayah).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`
}

export default function QuranAudioPlayer({
  surahNumber,
  ayahNumber,
  onAyahChange,
  totalAyahs,
  compact = false,
  isFloating = false,
}: QuranAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0])
  const [currentAyah, setCurrentAyah] = useState(ayahNumber)
  const [error, setError] = useState<string | null>(null)
  const [audioUrls, setAudioUrls] = useState<AudioFile[]>([])
  const [autoplay, setAutoplay] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getAudioUrl = useCallback(
    (ayah: number): string | null => {
      const key = `${surahNumber}:${ayah}`
      const file = audioUrls.find((f) => f.verseKey === key)
      return file?.url || null
    },
    [audioUrls, surahNumber]
  )

  useEffect(() => {
    let cancelled = false
    fetchAudioUrls(selectedReciter.id, surahNumber).then((urls) => {
      if (!cancelled) setAudioUrls(urls)
    })
    return () => {
      cancelled = true
    }
  }, [selectedReciter.id, surahNumber])

  useEffect(() => {
    if (ayahNumber !== currentAyah) {
      setCurrentAyah(ayahNumber)
      setError(null)
      setCurrentTime(0)
      setDuration(0)
    }
  }, [ayahNumber, currentAyah])

  const loadAndPlay = useCallback(
    async (ayah: number) => {
      const audio = audioRef.current
      if (!audio) return

      setLoading(true)
      setError(null)

      if (audio.src && audio.src !== window.location.href) {
        audio.pause()
        audio.currentTime = 0
      }

      let url = getAudioUrl(ayah)

      if (!url) {
        url = getFallbackUrl(surahNumber, ayah)
      }

      try {
        audio.src = url
        audio.volume = isMuted ? 0 : volume
        await audio.play()
        setIsPlaying(true)
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return
        }
        if (url !== getFallbackUrl(surahNumber, ayah)) {
          try {
            audio.src = getFallbackUrl(surahNumber, ayah)
            audio.volume = isMuted ? 0 : volume
            await audio.play()
            setIsPlaying(true)
            return
          } catch {}
        }
        console.error('Play error:', err)
        setError('Failed to play audio. Try another reciter.')
        setLoading(false)
        setIsPlaying(false)
      }
    },
    [getAudioUrl, surahNumber, isMuted, volume]
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (autoplay && totalAyahs && currentAyah < totalAyahs) {
        const next = currentAyah + 1
        setCurrentAyah(next)
        onAyahChange?.(next)
        setTimeout(() => loadAndPlay(next), 200)
      }
    }
    const onError = () => {
      const fallback = getFallbackUrl(surahNumber, currentAyah)
      if (audio.src !== fallback) {
        audio.src = fallback
        audio.load()
        return
      }
      setError('Audio unavailable for this reciter.')
      setLoading(false)
      setIsPlaying(false)
    }
    const onCanPlay = () => setLoading(false)

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
      if (!audio.src || audio.src === window.location.href) {
        await loadAndPlay(currentAyah)
      } else {
        try {
          await audio.play()
          setIsPlaying(true)
        } catch {
          await loadAndPlay(currentAyah)
        }
      }
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio && duration) {
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
      if (isPlaying) loadAndPlay(prev)
    }
  }

  const skipForward = () => {
    if (totalAyahs && currentAyah < totalAyahs) {
      const next = currentAyah + 1
      setCurrentAyah(next)
      onAyahChange?.(next)
      if (isPlaying) loadAndPlay(next)
    }
  }

  const formatTime = (t: number) => {
    if (!isFinite(t) || t < 0) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (compact) {
    return (
      <>
        <audio ref={audioRef} preload="metadata" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAndPlay(currentAyah)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
            title="Play ayah"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          {isPlaying && (
            <button
              onClick={() => {
                audioRef.current?.pause()
                setIsPlaying(false)
              }}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {error && (
            <button
              onClick={() => loadAndPlay(currentAyah)}
              className="p-1 rounded-lg hover:bg-destructive/10 text-destructive"
              title={error}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Audio Player</span>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Reciter
          </label>
          <select
            value={selectedReciter.id}
            onChange={(e) => {
              const r = RECITERS.find((r) => r.id === Number(e.target.value))
              if (r) {
                setSelectedReciter(r)
                setError(null)
                if (isPlaying) loadAndPlay(currentAyah)
              }
            }}
            className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Autoplay</label>
          <button
            onClick={() => setAutoplay(!autoplay)}
            className={`w-9 h-5 rounded-full transition-colors relative ${autoplay ? 'bg-primary' : 'bg-muted'}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoplay ? 'translate-x-4.5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl flex items-center gap-2">
            <span className="flex-1">{error}</span>
            <button onClick={() => loadAndPlay(currentAyah)} className="p-1 hover:bg-destructive/20 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            disabled={!duration}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={skipBackward}
            disabled={currentAyah <= 1}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            disabled={totalAyahs ? currentAyah >= totalAyahs : false}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.05}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Ayah {currentAyah} / {totalAyahs}
        </div>
      </div>
    </>
  )
}
