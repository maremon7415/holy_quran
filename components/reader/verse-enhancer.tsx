'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayer, type PlayerState } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'
import { useAppStore } from '@/lib/store'
import { useReaderUi } from '@/lib/reader/ui-store'
import { useLang, tx, type Lang } from '@/lib/lang'
import { ayahSlot } from '@/lib/reader/dom'
import { copyAyah, shareAyahLink, toggleBookmark } from '@/lib/reader/actions'
import { fetchChapterTranslation, fetchTranslationCatalogue, type TranslationMeta } from '@/lib/reader/quran-api'

const ayahEls = () => Array.from(document.querySelectorAll<HTMLElement>('[data-ayah]'))

// ------------------------------------------------------------------ per-ayah toolbar

const ACTIONS = [
  { a: 'play', icon: 'play', cls: 'ab', label: { en: 'Play from this ayah', bn: 'এখান থেকে শুনুন' } },
  { a: 'save', icon: 'bookmark', cls: 'ab ab-save', label: { en: 'Bookmark', bn: 'বুকমার্ক' } },
  { a: 'tafsir', icon: 'tafsir', cls: 'ab', label: { en: 'Tafsir', bn: 'তাফসীর' } },
  { a: 'copy', icon: 'copy', cls: 'ab ab-wide', label: { en: 'Copy', bn: 'কপি' } },
  { a: 'share', icon: 'share', cls: 'ab ab-wide', label: { en: 'Share link', bn: 'লিংক শেয়ার' } },
  { a: 'img', icon: 'image', cls: 'ab', label: { en: 'Share as image', bn: 'ছবি হিসেবে শেয়ার' } },
  { a: 'wbw', icon: 'wbw', cls: 'ab ab-wide', label: { en: 'Word by word', bn: 'শব্দে শব্দে' } },
  { a: 'more', icon: 'more', cls: 'ab ab-narrow', label: { en: 'More actions', bn: 'আরও' } },
] as const

function toolbarTemplate(lang: Lang) {
  const t = document.createElement('template')
  t.innerHTML = `<div class="ayah-actions" data-gen="1">${ACTIONS.map(
    (x) => `<button type="button" class="${x.cls}" data-a="${x.a}" aria-label="${tx(lang, x.label)}"${x.a === 'save' || x.a === 'wbw' ? ' aria-pressed="false"' : ''}><svg class="ai" aria-hidden="true"><use href="#ri-${x.icon}"></use></svg></button>`
  ).join('')}</div>`
  return t.content.firstElementChild as HTMLElement
}

const btn = (key: string, a: string) => document.querySelector<HTMLElement>(`[data-ayah="${key}"] .ayah-actions[data-gen] [data-a="${a}"]`)
function setOn(el: HTMLElement | null, on: boolean, pressed = true) {
  if (!el) return
  if (on) el.setAttribute('data-on', '')
  else el.removeAttribute('data-on')
  if (pressed) el.setAttribute('aria-pressed', String(on))
}

/**
 * Adds the toolbar to every server-rendered ayah (the server HTML carries none — ~1 KB × 286 ayahs saved)
 * and handles all toolbar clicks with one delegated listener. Button state (playing / saved / word-by-word)
 * is mirrored from the stores straight onto the DOM, so the verse list never re-renders.
 */
function useAyahToolbar(lang: Lang) {
  const router = useRouter()

  useEffect(() => {
    const tpl = toolbarTemplate(lang)
    document.querySelectorAll('.ayah-actions[data-gen]').forEach((n) => n.remove())
    for (const el of ayahEls()) {
      const head = el.querySelector(':scope > .ayah-head')
      if (!head || head.querySelector('.ayah-actions')) continue
      head.append(tpl.cloneNode(true))
    }

    // --- state mirrors ---
    let playKey: string | null = null
    const applyPlayer = (s: PlayerState) => {
      const k = s.status === 'playing' || s.status === 'loading' ? s.currentKey : null
      if (k === playKey) return
      for (const key of [playKey, k]) {
        if (!key) continue
        const b = btn(key, 'play')
        const on = key === k
        if (!b) continue
        setOn(b, on, false)
        b.setAttribute('aria-label', on ? tx(lang, { en: 'Pause', bn: 'বিরতি' }) : tx(lang, ACTIONS[0].label))
        b.querySelector('use')?.setAttribute('href', on ? '#ri-pause' : '#ri-play')
      }
      playKey = k
    }
    let saved = new Set<string>()
    const applySaved = () => {
      const next = new Set(useAppStore.getState().importantAyahs.map((a) => `${a.surahNumber}:${a.ayahNumber}`))
      for (const k of saved) if (!next.has(k)) setOn(btn(k, 'save'), false)
      for (const k of next) setOn(btn(k, 'save'), true)
      saved = next
    }
    let wbw: Record<string, true> = {}
    const applyWbw = () => {
      const next = useReaderUi.getState().wbwKeys
      if (next === wbw) return
      for (const k in wbw) if (!next[k]) setOn(btn(k, 'wbw'), false)
      for (const k in next) setOn(btn(k, 'wbw'), true)
      wbw = next
    }
    playKey = null
    applyPlayer(usePlayer.getState())
    applySaved()
    applyWbw()
    const u1 = usePlayer.subscribe(applyPlayer)
    const u2 = useAppStore.subscribe((s, p) => s.importantAyahs !== p.importantAyahs && applySaved())
    const u3 = useReaderUi.subscribe(applyWbw)

    // --- one delegated click handler ---
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const num = target.closest<HTMLAnchorElement>('a.ayah-num')
      if (num) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        router.push(num.getAttribute('href')!)
        return
      }
      const b = target.closest<HTMLElement>('.ayah-actions[data-gen] [data-a]')
      if (!b) return
      const k = b.closest<HTMLElement>('[data-ayah]')?.dataset.ayah
      if (!k) return
      const [surah, ayah] = k.split(':').map(Number)
      const ui = useReaderUi.getState()
      switch (b.dataset.a) {
        case 'play': {
          const p = usePlayer.getState()
          if (p.currentKey === k && p.status !== 'idle') p.toggle()
          else p.playSurah(surah, ayah)
          break
        }
        case 'save': toggleBookmark(k); break
        case 'tafsir': ui.openTafsir(k); break
        case 'copy': void copyAyah(k); break
        case 'share': void shareAyahLink(k); break
        case 'img': ui.openShare(k); break
        case 'wbw': ui.toggleWbw(k); break
        case 'more': ui.openMenu(k); break
      }
    }
    document.addEventListener('click', onClick)
    return () => {
      u1(); u2(); u3()
      document.removeEventListener('click', onClick)
    }
  }, [lang, router])
}

// ------------------------------------------------------------------ on-demand texts (Abdel Haleem, transliteration)

const extrasMemo = new Map<number, Promise<{ enH: string[]; tl: string[] }>>()
const fetchExtras = (n: number) => {
  let p = extrasMemo.get(n)
  if (!p) {
    p = fetch(`/quran/data/${n}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    p.catch(() => extrasMemo.delete(n))
    extrasMemo.set(n, p)
  }
  return p
}

function para(attrs: Record<string, string>, cls: string, text: string) {
  const p = document.createElement('p')
  for (const k in attrs) p.setAttribute(k, attrs[k])
  p.className = cls
  p.textContent = text
  return p
}

/** Surah / juz pages don't server-render Abdel Haleem + Latin transliteration; add them when the reader turns them on. */
function useOnDemandTexts(chapters: number[]) {
  const need = useReader((s) => s.showTl || (s.showEn && s.enEdition === 'haleem'))
  const chKey = chapters.join(',')
  useEffect(() => {
    if (!need) return
    const els = ayahEls().filter((el) => el.querySelector(':scope > .ayah-tr') && !el.querySelector('[data-ed="haleem"]'))
    if (!els.length) return
    let off = false
    const bySurah = new Map<number, HTMLElement[]>()
    for (const el of els) {
      const s = +el.dataset.ayah!.split(':')[0]
      bySurah.set(s, [...(bySurah.get(s) ?? []), el])
    }
    for (const [s, list] of bySurah) {
      fetchExtras(s)
        .then((d) => {
          if (off) return
          for (const el of list) {
            if (el.querySelector('[data-ed="haleem"]')) continue
            const n = +el.dataset.ayah!.split(':')[1]
            const tr = el.querySelector<HTMLElement>(':scope > .ayah-tr')!
            const sahih = tr.querySelector('[data-ed="sahih"]')
            if (d.tl[n - 1]) (sahih ?? tr.firstChild)?.before?.(para({ 'data-tr': 'tl' }, 'tr-tl', d.tl[n - 1]))
            if (d.enH[n - 1]) sahih?.after(para({ 'data-tr': 'en', 'data-ed': 'haleem' }, 'tr-en', d.enH[n - 1]))
          }
        })
        .catch(() => {})
    }
    return () => { off = true }
  }, [need, chKey])
}

// ------------------------------------------------------------------ extra translations (Quran.com catalogue)

/** Container for the extra translations of one ayah: an explicit `[data-xt="2:255"]` box or the ayah's `.xt-slot`. */
function xtTarget(el: HTMLElement) {
  const key = el.dataset.ayah!
  return document.querySelector<HTMLElement>(`[data-xt="${key}"]`) ?? ayahSlot(el, 'xt-slot')
}

function xtBlock(meta: TranslationMeta | undefined, id: number, text: string, card: boolean) {
  const d = document.createElement(card ? 'figure' : 'div')
  d.className = card ? 'xt xt-card card-soft' : 'xt'
  d.dataset.xtId = String(id)
  const label = document.createElement(card ? 'figcaption' : 'span')
  label.className = 'xt-name'
  label.textContent = meta ? `${meta.langName.replace(/^\w/, (c) => c.toUpperCase())} · ${meta.name}` : `#${id}`
  const p = document.createElement(card ? 'blockquote' : 'p')
  p.className = 'xt-text'
  if (meta && meta.lang !== 'und') p.lang = meta.lang
  p.dir = meta?.rtl ? 'rtl' : 'auto'
  p.textContent = text
  d.append(label, p)
  return d
}

/** Inject the user's extra translations under every ayah (fetched per chapter + edition, cached in memory). */
function useExtraTranslations(chapters: number[]) {
  const ids = useReader((s) => s.extraTr)
  const idKey = ids.join(',')
  const chKey = chapters.join(',')
  useEffect(() => {
    const els = ayahEls()
    // clear previous blocks
    document.querySelectorAll('.xt[data-xt-id]').forEach((n) => n.remove())
    if (!ids.length || !els.length) return
    let off = false
    const surahs = [...new Set(els.map((el) => +el.dataset.ayah!.split(':')[0]))]
    Promise.all([
      fetchTranslationCatalogue().catch(() => [] as TranslationMeta[]),
      Promise.all(ids.map((id) => Promise.all(surahs.map((s) => fetchChapterTranslation(s, id).catch(() => ({} as Record<string, string>)))).then((maps) => Object.assign({}, ...maps) as Record<string, string>))),
    ]).then(([cat, perId]) => {
      if (off) return
      const metaById = new Map(cat.map((m) => [m.id, m]))
      for (const el of els) {
        const box = xtTarget(el)
        if (!box) continue
        const card = box.hasAttribute('data-xt')
        box.querySelectorAll('.xt[data-xt-id]').forEach((n) => n.remove())
        ids.forEach((id, i) => {
          const text = perId[i][el.dataset.ayah!]
          if (text) box.append(xtBlock(metaById.get(id), id, text, card))
        })
      }
    })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey, chKey])
}

/** Page-level client enhancer for server-rendered verses (toolbar, on-demand texts, extra translations). */
export function VerseEnhancer({ chapters }: { chapters: number[] }) {
  const lang = useLang()
  useAyahToolbar(lang)
  useOnDemandTexts(chapters)
  useExtraTranslations(chapters)
  return null
}
