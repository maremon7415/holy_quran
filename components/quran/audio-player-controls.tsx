'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, Headphones } from 'lucide-react'
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

export default function AudioPlayerControls({ totalAyahs }: { totalAyahs: number }) {
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

  const getAudioUrl = useCallback((ayah: number): string | null => {
    const key = `${audioState.surahNumber}:${ayah}`
    const file = audioUrlsRef.current.find((f) => f.verseKey === key)
    return file?.url || `https://everyayah.com/data/Alafasy_128kbps/${String(audioState.surahNumber).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`
  }, [audioState.surahNumber])

  const loadAndPlay = useCallback(async (ayah: number) => {
    if (!audioRef.current) return

    setLoading(true)
    setError(null)

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
    } catch (err) {
      console.error('Play error:', err)
      setError('Failed to play audio')
      setLoading(false)
    }
  }, [getAudioUrl, audioState.isMuted, audioState.volume, setAudioPlaying])

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.quran.com/api/v4/recitations/${audioState.reciterId}/by_chapter/${audioState.surahNumber}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      if (!cancelled) {
        audioUrlsRef.current = data.audio_files.map((f: any) => ({
          verseKey: f.verse_key,
          url: `https://verses.quran.com/${f.url}`,
        }))
      }
    })
    .catch(err => console.error('Error fetching audio URLs:', err))
    
    return () => { cancelled = true }
  }, [audioState.reciterId, audioState.surahNumber])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setAudioPlaying(false)
      setCurrentTime(0)
      if (audioState.autoplay && totalAyahs && audioState.ayahNumber < totalAyahs) {
        playAyah(audioState.surahNumber, audioState.ayahNumber + 1)
      }
    }
    const onError = () => {
      setError('Audio unavailable')
      setAudioPlaying(false)
      setLoading(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [audioState.surahNumber, audioState.ayahNumber, totalAyahs, audioState.autoplay, setAudioPlaying, playAyah])

  useEffect(() => {
    if (audioState.isPlaying) {
      loadAndPlay(audioState.ayahNumber)
    } else {
      audioRef.current?.pause()
    }
  }, [audioState.isPlaying, audioState.ayahNumber, loadAndPlay])

  const togglePlay = () => {
    setAudioPlaying(!audioState.isPlaying)
  }

  const skipBackward = () => {
    if (audioState.ayahNumber > 1) {
      playAyah(audioState.surahNumber, audioState.ayahNumber - 1)
    }
  }

  const skipForward = () => {
    if (totalAyahs && audioState.ayahNumber < totalAyahs) {
      playAyah(audioState.surahNumber, audioState.ayahNumber + 1)
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
    if (audioRef.current) {
      audioRef.current.muted = !audioState.isMuted
    }
  }

  const formatTime = (t: number) => {
    if (!isFinite(t) || t < 0) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const reciter = RECITERS.find(r => r.id === audioState.reciterId) || RECITERS[0]

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
            value={audioState.reciterId}
            onChange={(e) => {
              const r = RECITERS.find(r => r.id === Number(e.target.value))
              if (r) setAudioReciter(r.id)
            }}
            className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Autoplay</label>
          <button
            onClick={() => setAudioAutoplay(!audioState.autoplay)}
            className={`w-9 h-5 rounded-full transition-colors relative ${audioState.autoplay ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${audioState.autoplay ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => loadAndPlay(audioState.ayahNumber)} className="text-xs underline">Retry</button>
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
            disabled={audioState.ayahNumber <= 1}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : audioState.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            disabled={totalAyahs ? audioState.ayahNumber >= totalAyahs : false}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
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

        <div className="text-center text-xs text-muted-foreground">
          Ayah {audioState.ayahNumber} / {totalAyahs}
        </div>
      </div>
    </>
  )
}