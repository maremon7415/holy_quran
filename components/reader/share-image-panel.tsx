'use client'
import { useEffect, useRef, useState } from 'react'
import { Download, Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useReaderUi } from '@/lib/reader/ui-store'
import { readAyahText } from '@/lib/reader/dom'
import { CARD_THEMES, canvasToBlob, renderAyahCard, type CardTheme } from '@/lib/reader/share-image'
import { chapters } from '@/lib/quran/chapters'
import { useReader } from '@/lib/stores/reader'
import { useLang, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { Panel } from './panel'
import { Segmented } from './controls'

export function ShareImagePanel() {
  const t = useTx()
  const uiLang = useLang()
  const key = useReaderUi((s) => s.shareKey)
  const close = () => useReaderUi.getState().openShare(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [theme, setTheme] = useState<CardTheme>('emerald')
  const [lang, setLang] = useState<'en' | 'bn' | 'ar'>('en')
  const [busy, setBusy] = useState(true)

  useEffect(() => setLang(uiLang === 'bn' ? 'bn' : 'en'), [uiLang])

  useEffect(() => {
    if (!key) return
    let off = false
    setBusy(true)
    // wait one frame so the canvas is mounted inside the animated panel
    const id = requestAnimationFrame(async () => {
      const c = canvasRef.current
      if (!c || off) return
      const x = readAyahText(key)
      const s = +key.split(':')[0]
      const ch = chapters[s - 1]
      const en = useReader.getState().enEdition === 'haleem' && x.enH ? x.enH : x.en
      await renderAyahCard(c, { ar: x.ar, translation: lang === 'bn' ? x.bn : lang === 'en' ? en : '', lang, key, surahName: ch.nameSimple, surahArabic: ch.nameArabic, theme })
      if (!off) setBusy(false)
    })
    return () => { off = true; cancelAnimationFrame(id) }
  }, [key, theme, lang])

  const fileName = `noor-quran-${key?.replace(':', '-')}.png`
  const download = async () => {
    const c = canvasRef.current
    if (!c) return
    const blob = await canvasToBlob(c)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  const share = async () => {
    const c = canvasRef.current
    if (!c) return
    const blob = await canvasToBlob(c)
    if (!blob) return
    const file = new File([blob], fileName, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: `Quran ${key}` }) } catch {}
    } else {
      await download()
      toast(t({ en: 'Image downloaded — sharing files is not supported on this browser', bn: 'ছবি ডাউনলোড হয়েছে', ar: 'تم تنزيل الصورة — مشاركة الملفات غير مدعومة في هذا المتصفح' }))
    }
  }

  return (
    <Panel
      open={!!key}
      onOpenChange={(o) => !o && close()}
      title={t({ en: 'Share as image', bn: 'ছবি হিসেবে শেয়ার', ar: 'مشاركة كصورة' })}
      description={key ? `${chapters[+key.split(':')[0] - 1].nameSimple} ${key}` : undefined}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={download} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-full border bg-card px-4 py-3 text-sm font-semibold transition active:scale-95 disabled:opacity-50">
            <Download className="size-4" /> {t({ en: 'Download PNG', bn: 'ডাউনলোড', ar: 'تنزيل PNG' })}
          </button>
          <button type="button" onClick={share} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition active:scale-95 disabled:opacity-50">
            <Share2 className="size-4" /> {t({ en: 'Share', bn: 'শেয়ার', ar: 'مشاركة' })}
          </button>
        </div>
      }
    >
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-3xl border bg-muted shadow-[0_20px_50px_-24px_rgb(var(--shadow-color)/0.5)]">
        <canvas ref={canvasRef} width={1080} height={1350} className={cn('size-full transition-opacity duration-500', busy ? 'opacity-40' : 'opacity-100')} />
        {busy && <Loader2 className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      <p className="mb-2 mt-5 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t({ en: 'Card style', bn: 'কার্ডের ধরন', ar: 'نمط البطاقة' })}</p>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(CARD_THEMES) as CardTheme[]).map((id) => {
          const th = CARD_THEMES[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              className={cn('flex flex-col items-center gap-1.5 rounded-2xl border p-2 text-xs font-semibold transition active:scale-95', theme === id ? 'border-primary bg-accent shadow-[0_0_0_3px_var(--glow)]' : 'bg-card')}
            >
              <span className="grid h-10 w-full place-items-center rounded-xl font-arabic text-lg" style={{ background: `linear-gradient(135deg, ${th.bg[0]}, ${th.bg[1]})`, color: th.accent }}>ﷲ</span>
              {t(th.name)}
            </button>
          )
        })}
      </div>
      <p className="mb-2 mt-5 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t({ en: 'Translation', bn: 'অনুবাদ', ar: 'الترجمة' })}</p>
      <Segmented value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'bn', label: 'বাংলা' }, { value: 'ar', label: t({ en: 'Arabic only', bn: 'শুধু আরবি', ar: 'العربية فقط' }) }]} />
    </Panel>
  )
}
