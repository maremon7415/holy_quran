'use client'
import { memo } from 'react'
import { Bookmark, BookOpenText, Copy, ImageIcon, MoreHorizontal, Pause, Play, Share2, Languages } from 'lucide-react'
import { usePlayer } from '@/lib/stores/player'
import { useAppStore } from '@/lib/store'
import { useReaderUi } from '@/lib/reader/ui-store'
import { useMounted, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { copyAyah, shareAyahLink, toggleBookmark } from '@/lib/reader/actions'

const btn =
  'grid size-9 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-200 hover:bg-muted hover:text-foreground active:scale-90 focus-visible:bg-muted'

/** Per-ayah toolbar. Tiny on purpose (rendered up to 286×): two boolean store selectors, no local state. */
export const AyahActions = memo(function AyahActions({ k, surah, ayah }: { k: string; surah: number; ayah: number }) {
  const t = useTx()
  const mounted = useMounted()
  const status = usePlayer((s) => (s.currentKey === k ? s.status : null))
  const saved = useAppStore((s) => s.importantAyahs.some((a) => a.surahNumber === surah && a.ayahNumber === ayah))
  const wbwOn = useReaderUi((s) => !!s.wbwKeys[k])
  const playing = status === 'playing' || status === 'loading'
  const isSaved = mounted && saved

  const play = () => {
    const p = usePlayer.getState()
    if (p.currentKey === k && p.status !== 'idle') p.toggle()
    else p.playSurah(surah, ayah)
  }

  return (
    <div className="ayah-actions -mr-1.5 flex items-center gap-0.5 opacity-90 transition-opacity duration-300 lg:opacity-60 lg:group-hover/ayah:opacity-100 lg:focus-within:opacity-100">
      <button type="button" onClick={play} className={cn(btn, playing && 'bg-accent text-primary')} aria-label={playing ? t({ en: 'Pause', bn: 'বিরতি' }) : t({ en: 'Play from this ayah', bn: 'এখান থেকে শুনুন' })} title={playing ? 'Pause (space)' : 'Play from here'}>
        {playing ? <Pause className="size-[18px]" fill="currentColor" /> : <Play className="size-[18px] translate-x-px" />}
      </button>
      <button type="button" onClick={() => toggleBookmark(k)} className={cn(btn, isSaved && 'text-gold')} aria-pressed={isSaved} aria-label={t({ en: 'Bookmark', bn: 'বুকমার্ক' })} title="Bookmark (b)">
        <Bookmark className={cn('size-[18px] transition-transform duration-300', isSaved && 'scale-110')} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
      <button type="button" onClick={() => useReaderUi.getState().openTafsir(k)} className={btn} aria-label={t({ en: 'Tafsir', bn: 'তাফসীর' })} title="Tafsir (t)">
        <BookOpenText className="size-[18px]" />
      </button>
      <button type="button" onClick={() => copyAyah(k)} className={cn(btn, 'hidden sm:grid')} aria-label={t({ en: 'Copy', bn: 'কপি' })} title="Copy">
        <Copy className="size-[17px]" />
      </button>
      <button type="button" onClick={() => shareAyahLink(k)} className={cn(btn, 'hidden sm:grid')} aria-label={t({ en: 'Share link', bn: 'লিংক শেয়ার' })} title="Share link">
        <Share2 className="size-[17px]" />
      </button>
      <button type="button" onClick={() => useReaderUi.getState().openShare(k)} className={btn} aria-label={t({ en: 'Share as image', bn: 'ছবি হিসেবে শেয়ার' })} title="Share as image">
        <ImageIcon className="size-[17px]" />
      </button>
      <button type="button" onClick={() => useReaderUi.getState().toggleWbw(k)} className={cn(btn, 'hidden sm:grid', wbwOn && 'bg-accent text-primary')} aria-pressed={wbwOn} aria-label={t({ en: 'Word by word', bn: 'শব্দে শব্দে' })} title="Word by word">
        <Languages className="size-[17px]" />
      </button>
      <button type="button" onClick={() => useReaderUi.getState().openMenu(k)} className={cn(btn, 'sm:hidden')} aria-label={t({ en: 'More actions', bn: 'আরও' })}>
        <MoreHorizontal className="size-[18px]" />
      </button>
    </div>
  )
})
