'use client'
import Link from 'next/link'
import { BookOpenText, Bookmark, Copy, ImageIcon, Languages, Link2, ListMusic, Play, Repeat, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useReaderUi } from '@/lib/reader/ui-store'
import { usePlayer } from '@/lib/stores/player'
import { useAppStore } from '@/lib/store'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { copyAyah, copyText, shareAyahLink, toggleBookmark } from '@/lib/reader/actions'
import { ayahRef } from '@/lib/reader/dom'
import { useTx } from '@/lib/lang'
import { Panel } from './panel'

function Item({ icon, label, onClick, href }: { icon: ReactNode; label: string; onClick?: () => void; href?: string }) {
  const cls = 'flex flex-col items-center gap-2 rounded-2xl bg-surface-2 px-2 py-3.5 text-center text-xs font-semibold transition active:scale-95'
  const inner = (
    <>
      <span className="grid size-10 place-items-center rounded-full bg-card text-primary shadow-sm">{icon}</span>
      {label}
    </>
  )
  return href ? <Link href={href} className={cls} onClick={onClick}>{inner}</Link> : <button type="button" className={cls} onClick={onClick}>{inner}</button>
}

/** "More" sheet for an ayah (mainly phones, where the inline toolbar is compact). */
export function AyahMenu() {
  const t = useTx()
  const key = useReaderUi((s) => s.menuKey)
  const close = () => useReaderUi.getState().openMenu(null)
  const [s, a] = (key ?? '1:1').split(':').map(Number)
  const saved = useAppStore((st) => st.importantAyahs.some((x) => x.surahNumber === s && x.ayahNumber === a))
  const wbw = useReaderUi((st) => (key ? !!st.wbwKeys[key] : false))
  const run = (fn: () => void) => () => { close(); fn() }

  return (
    <Panel open={!!key} onOpenChange={(o) => !o && close()} title={`${chapters[s - 1]?.nameSimple ?? ''} ${key ?? ''}`}>
      <div className="grid grid-cols-3 gap-2 pt-1">
        <Item icon={<Play className="size-5" />} label={t({ en: 'Play from here', bn: 'এখান থেকে শুনুন' })} onClick={run(() => usePlayer.getState().playSurah(s, a))} />
        <Item icon={<Repeat className="size-5" />} label={t({ en: 'Play this ayah', bn: 'শুধু এই আয়াত' })} onClick={run(() => usePlayer.getState().playRange(s, a))} />
        <Item icon={<Bookmark className="size-5" fill={saved ? 'currentColor' : 'none'} />} label={saved ? t({ en: 'Saved', bn: 'সংরক্ষিত' }) : t({ en: 'Bookmark', bn: 'বুকমার্ক' })} onClick={run(() => key && toggleBookmark(key))} />
        <Item icon={<BookOpenText className="size-5" />} label={t({ en: 'Tafsir', bn: 'তাফসীর' })} onClick={run(() => useReaderUi.getState().openTafsir(key))} />
        <Item icon={<Languages className="size-5" />} label={wbw ? t({ en: 'Hide words', bn: 'শব্দার্থ বন্ধ' }) : t({ en: 'Word by word', bn: 'শব্দে শব্দে' })} onClick={run(() => key && useReaderUi.getState().toggleWbw(key))} />
        <Item icon={<ImageIcon className="size-5" />} label={t({ en: 'Share image', bn: 'ছবি শেয়ার' })} onClick={run(() => useReaderUi.getState().openShare(key))} />
        <Item icon={<Copy className="size-5" />} label={t({ en: 'Copy text', bn: 'টেক্সট কপি' })} onClick={run(() => key && copyAyah(key))} />
        <Item icon={<Link2 className="size-5" />} label={t({ en: 'Copy link', bn: 'লিংক কপি' })} onClick={run(() => key && copyText(ayahRef(key).url))} />
        <Item icon={<Share2 className="size-5" />} label={t({ en: 'Share', bn: 'শেয়ার' })} onClick={run(() => key && shareAyahLink(key))} />
      </div>
      {key && (
        <Link href={surahHref(s, a)} onClick={close} className="mt-3 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-primary transition active:scale-[0.98]">
          <ListMusic className="size-4" /> {t({ en: 'Open ayah page — tafsir & word by word', bn: 'আয়াত পেজ খুলুন — তাফসীর ও শব্দার্থ' })}
        </Link>
      )}
    </Panel>
  )
}
