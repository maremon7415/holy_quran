'use client'
import { memo, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReader } from '@/lib/stores/reader'
import { useReaderUi } from '@/lib/reader/ui-store'
import { fetchTajweed, fetchWbw, playWordAudio, type WbwMap, type WbwWord } from '@/lib/reader/quran-api'
import { tokenizeTajweedHtml } from '@/lib/reader/words'
import { toArabicDigits } from '@/lib/quran/chapters'
import { useMounted } from '@/lib/lang'

/** Collect the empty layer slots rendered by <VerseBlock>. */
function useSlots(attr: 'data-slot-tj' | 'data-slot-wbw', enabled: boolean) {
  const [slots, setSlots] = useState<Map<string, HTMLElement>>(new Map())
  useEffect(() => {
    if (!enabled) return
    const m = new Map<string, HTMLElement>()
    document.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => m.set(el.getAttribute(attr)!, el))
    setSlots(m)
  }, [attr, enabled])
  return slots
}

function tajweedToHtml(html: string, n: number) {
  const tokens = tokenizeTajweedHtml(html)
  const body = tokens
    ? tokens.map((t) => (t.pos ? `<span class="w" data-w="${t.pos}">${t.text}${t.waqf ? `&nbsp;<span class="waqf">${t.waqf}</span>` : ''}</span>` : `<span class="waqf">${t.text}</span>`)).join(' ')
    : html.replace(/<span class=end>[^<]*<\/span>/g, '')
  return `${body}&nbsp;<span class="ayah-marker${n >= 100 ? ' ayah-marker-3' : ''}">${toArabicDigits(n)}</span>`
}

const TajweedLine = memo(function TajweedLine({ html, n }: { html: string; n: number }) {
  const out = useMemo(() => tajweedToHtml(html, n), [html, n])
  return <p className="quran-text text-right text-[length:var(--quran-size,34px)]" lang="ar" dir="rtl" dangerouslySetInnerHTML={{ __html: out }} />
})

const WbwTiles = memo(function WbwTiles({ words, n }: { words: WbwWord[]; n: number }) {
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-2.5 py-1" dir="rtl" lang="ar">
      {words.map((w) => (
        <button
          key={w.position}
          type="button"
          data-w={w.position}
          onClick={() => w.audio && playWordAudio(w.audio)}
          className="wbw-tile group/w flex min-w-[3.5rem] flex-col items-center rounded-2xl border border-transparent px-2 py-1.5 text-center transition-[background-color,border-color,transform] duration-200 hover:border-border hover:bg-surface-2 active:scale-95"
          title={w.tr ?? undefined}
        >
          <span className="wbw-ar font-arabic text-[length:calc(var(--quran-size,34px)*0.82)] leading-[1.7] text-arabic transition-colors">{w.ar}</span>
          {w.tl && <span dir="ltr" className="mt-0.5 text-[11px] italic leading-tight text-muted-foreground">{w.tl}</span>}
          {w.tr && <span dir="auto" className="mt-0.5 max-w-[8rem] text-[12px] font-medium leading-snug text-foreground/85">{w.tr}</span>}
        </button>
      ))}
      <span className={`ayah-marker self-center text-[length:calc(var(--quran-size,34px)*0.9)]${n >= 100 ? ' ayah-marker-3' : ''}`}>{toArabicDigits(n)}</span>
    </div>
  )
})

/**
 * Tajweed + word-by-word layers for every verse on the page, rendered through portals
 * into the empty slots of the server-rendered verses. Data is fetched once per chapter.
 */
export function ArabicLayers({ chapters }: { chapters: number[] }) {
  const mounted = useMounted()
  const tajweed = useReader((s) => s.tajweed)
  const wbwAll = useReader((s) => s.wordByWord)
  const wbwLang = useReader((s) => s.wbwLang)
  const wbwKeys = useReaderUi((s) => s.wbwKeys)
  const wbwAny = wbwAll || Object.keys(wbwKeys).length > 0
  const chKey = chapters.join(',')

  const tjSlots = useSlots('data-slot-tj', mounted && tajweed)
  const wbwSlots = useSlots('data-slot-wbw', mounted && wbwAny)

  const [tj, setTj] = useState<Record<string, string>>({})
  const [wbw, setWbw] = useState<{ lang: string; map: WbwMap }>({ lang: '', map: {} })

  useEffect(() => {
    if (!mounted || !tajweed) return
    let off = false
    Promise.all(chKey.split(',').map((c) => fetchTajweed(+c)))
      .then((maps) => !off && setTj(Object.assign({}, ...maps)))
      .catch(() => {})
    return () => { off = true }
  }, [mounted, tajweed, chKey])

  useEffect(() => {
    if (!mounted || !wbwAny) return
    let off = false
    Promise.all(chKey.split(',').map((c) => fetchWbw(+c, wbwLang)))
      .then((maps) => !off && setWbw({ lang: wbwLang, map: Object.assign({}, ...maps) }))
      .catch(() => {})
    return () => { off = true }
  }, [mounted, wbwAny, wbwLang, chKey])

  if (!mounted) return null
  return (
    <>
      {tajweed &&
        Array.from(tjSlots).map(([key, el]) => (tj[key] ? createPortal(<TajweedLine html={tj[key]} n={+key.split(':')[1]} />, el, `tj-${key}`) : null))}
      {wbwAny &&
        Array.from(wbwSlots).map(([key, el]) =>
          (wbwAll || wbwKeys[key]) && wbw.map[key] ? createPortal(<WbwTiles words={wbw.map[key]} n={+key.split(':')[1]} />, el, `wbw-${key}`) : null
        )}
    </>
  )
}
