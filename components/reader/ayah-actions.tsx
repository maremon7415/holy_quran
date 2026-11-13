'use client'
import { memo } from 'react'
import { usePlayer } from '@/lib/stores/player'
import { useAppStore } from '@/lib/store'
import { useReaderUi } from '@/lib/reader/ui-store'
import { useMounted, useTx } from '@/lib/lang'
import { copyAyah, shareAyahLink, toggleBookmark } from '@/lib/reader/actions'

/** Inline icon from the shared sprite (components/reader/icon-sprite.tsx). */
const I = ({ id }: { id: string }) => <svg className="ai"><use href={`#ri-${id}`} /></svg>

/** Per-ayah toolbar. Rendered up to 286× per page, so markup is kept tiny: sprite icons + short CSS classes (app/reader.css). */
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
    <div className="ayah-actions">
      <button type="button" onClick={play} className="ab" data-on={playing || undefined} aria-label={playing ? t({ en: 'Pause', bn: 'বিরতি' }) : t({ en: 'Play from this ayah', bn: 'এখান থেকে শুনুন' })}>
        <I id={playing ? 'pause' : 'play'} />
      </button>
      <button type="button" onClick={() => toggleBookmark(k)} className="ab ab-save" data-on={isSaved || undefined} aria-pressed={isSaved} aria-label={t({ en: 'Bookmark', bn: 'বুকমার্ক' })}><I id="bookmark" /></button>
      <button type="button" onClick={() => useReaderUi.getState().openTafsir(k)} className="ab" aria-label={t({ en: 'Tafsir', bn: 'তাফসীর' })}><I id="tafsir" /></button>
      <button type="button" onClick={() => copyAyah(k)} className="ab ab-wide" aria-label={t({ en: 'Copy', bn: 'কপি' })}><I id="copy" /></button>
      <button type="button" onClick={() => shareAyahLink(k)} className="ab ab-wide" aria-label={t({ en: 'Share link', bn: 'লিংক শেয়ার' })}><I id="share" /></button>
      <button type="button" onClick={() => useReaderUi.getState().openShare(k)} className="ab" aria-label={t({ en: 'Share as image', bn: 'ছবি হিসেবে শেয়ার' })}><I id="image" /></button>
      <button type="button" onClick={() => useReaderUi.getState().toggleWbw(k)} className="ab ab-wide" data-on={wbwOn || undefined} aria-pressed={wbwOn} aria-label={t({ en: 'Word by word', bn: 'শব্দে শব্দে' })}><I id="wbw" /></button>
      <button type="button" onClick={() => useReaderUi.getState().openMenu(k)} className="ab ab-narrow" aria-label={t({ en: 'More actions', bn: 'আরও' })}><I id="more" /></button>
    </div>
  )
})
