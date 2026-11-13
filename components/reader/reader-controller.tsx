'use client'
import { useEffect } from 'react'
import { usePlayer, type PlayerState } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'
import { useUi } from '@/lib/stores/ui'
import { useAppStore } from '@/lib/store'
import { chapters } from '@/lib/quran/chapters'
import { useReaderUi } from '@/lib/reader/ui-store'
import { ayahEl, scrollToAyah, wrapWords } from '@/lib/reader/dom'
import { toggleBookmark } from '@/lib/reader/actions'

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null
  return !!el && (/^(input|textarea|select)$/i.test(el.tagName) || el.isContentEditable)
}

/** Focus is on something Space/Enter would activate (button, link, summary, any tabindex'd widget) → leave the key alone. */
const isInteractive = (t: EventTarget | null) =>
  t instanceof Element &&
  !!t.closest('button, a[href], [role="button"], [role="link"], [role="tab"], [role="switch"], [role="checkbox"], [role="menuitem"], [role="option"], [role="slider"], summary, select, input, textarea, [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])')

/**
 * One controller per reader page. Everything that reacts to audio ticks, scrolling or
 * the keyboard lives here and touches the DOM directly through data attributes, so
 * the (possibly 286-verse) server-rendered list never re-renders.
 */
export function ReaderController({ surah }: { /** set on surah pages (null on juz pages) */ surah?: number }) {
  // ---- reader prefs that CSS reads from <html> ----
  useEffect(() => {
    const apply = (s: { enEdition: string; mode: string }) => {
      const d = document.documentElement.dataset
      d.enEd = s.enEdition
      d.readerMode = s.mode
    }
    apply(useReader.getState())
    const unsub = useReader.subscribe(apply)
    return () => {
      unsub()
      useUi.getState().setImmersive(false)
    }
  }, [])

  // ---- audio sync: current ayah + recited word ----
  useEffect(() => {
    let curEl: HTMLElement | null = null
    let lastKey: string | null = null
    let lastWord: number | null = null
    let activeWords: Element[] = []
    let userScrollAt = 0
    const onUser = () => (userScrollAt = Date.now())
    window.addEventListener('wheel', onUser, { passive: true })
    window.addEventListener('touchmove', onUser, { passive: true })

    const apply = (s: PlayerState) => {
      const key = s.status === 'idle' ? null : s.currentKey
      if (key !== lastKey) {
        curEl?.removeAttribute('data-current')
        curEl = key ? ayahEl(key) : null
        curEl?.setAttribute('data-current', '1')
        wrapWords(curEl) // word spans are created lazily, only for the recited ayah
        lastKey = key
        lastWord = null
        if (curEl && key && useReader.getState().autoScroll && (s.status === 'playing' || s.status === 'loading') && Date.now() - userScrollAt > 2500) {
          const r = curEl.getBoundingClientRect()
          if (r.top < 80 || r.top > window.innerHeight * 0.55) scrollToAyah(key, { glow: false })
        }
      }
      const word = curEl ? s.currentWord : null
      if (word !== lastWord) {
        for (const w of activeWords) w.removeAttribute('data-active')
        activeWords = curEl && word ? Array.from(curEl.querySelectorAll(`[data-w="${word}"]`)) : []
        for (const w of activeWords) w.setAttribute('data-active', '')
        lastWord = word
      }
    }
    apply(usePlayer.getState())
    const unsub = usePlayer.subscribe(apply)
    return () => {
      unsub()
      window.removeEventListener('wheel', onUser)
      window.removeEventListener('touchmove', onUser)
      curEl?.removeAttribute('data-current')
      for (const w of activeWords) w.removeAttribute('data-active')
    }
  }, [])

  // ---- reading progress: in-view ayah + dwell-based "read" marking (batched) ----
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-ayah]'))
    if (!els.length) return
    const visible = new Map<HTMLElement, number>() // element → time it entered the reading band
    const marked = new Set<string>()
    const queue: string[] = []
    let raf = 0

    const pickInView = () => {
      raf = 0
      let best: HTMLElement | null = null
      let bestTop = Infinity
      const minBottom = window.innerHeight * 0.3 // ignore an ayah whose tail is just peeking under the bar
      for (const el of visible.keys()) {
        const r = el.getBoundingClientRect()
        if (r.bottom < minBottom) continue
        if (r.top < bestTop) { bestTop = r.top; best = el }
      }
      if (!best) return
      const key = best.dataset.ayah!
      const cur = useReaderUi.getState().inView
      if (cur?.key !== key) useReaderUi.getState().setInView({ key, juz: +best.dataset.j!, page: +best.dataset.p! })
    }

    const io = new IntersectionObserver(
      (entries) => {
        const now = Date.now()
        for (const e of entries) {
          const el = e.target as HTMLElement
          if (e.isIntersecting) visible.set(el, now)
          else visible.delete(el)
        }
        if (!raf) raf = requestAnimationFrame(pickInView)
      },
      { rootMargin: '-90px 0px -40% 0px', threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pickInView) }
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = window.setInterval(() => {
      const now = Date.now()
      for (const [el, since] of visible) {
        const k = el.dataset.ayah!
        if (!marked.has(k) && now - since > 1400) { marked.add(k); queue.push(k) }
      }
    }, 700)

    const flush = () => {
      if (!queue.length) return
      const st = useAppStore.getState()
      const batch = queue.splice(0)
      let lastS = 0, lastA = 0
      for (const k of batch) {
        const [s, a] = k.split(':').map(Number)
        const c = chapters[s - 1]
        st.markAyahAsRead(s, a, { surahName: c?.nameSimple, totalAyahs: c?.versesCount })
        lastS = s; lastA = a
      }
      const iv = useReaderUi.getState().inView
      if (iv) {
        const [s, a] = iv.key.split(':').map(Number)
        st.setReadingProgress(s, a, chapters[s - 1]?.versesCount)
        st.updateLastAyahRead(s, a)
      } else if (lastS) st.setReadingProgress(lastS, lastA, chapters[lastS - 1]?.versesCount)
    }
    const flushTimer = window.setInterval(flush, 3000)
    const onHide = () => document.visibilityState === 'hidden' && flush()
    document.addEventListener('visibilitychange', onHide)

    // register the visit
    if (surah) {
      const st = useAppStore.getState()
      const prog = st.readingProgress[surah]
      st.addToRecentlyViewed({ surahNumber: surah, surahName: chapters[surah - 1].nameSimple, lastAyahRead: prog?.lastAyahRead || 1 })
    }

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.clearInterval(tick)
      window.clearInterval(flushTimer)
      document.removeEventListener('visibilitychange', onHide)
      if (raf) cancelAnimationFrame(raf)
      flush()
      useReaderUi.getState().setInView(null)
    }
  }, [surah])

  // ---- deep links (#ayah-N / #ayah-S-N) ----
  useEffect(() => {
    const go = (behavior: ScrollBehavior) => {
      const m = location.hash.match(/^#ayah-(\d+)(?:-(\d+))?$/)
      if (!m) return
      const key = m[2] ? `${m[1]}:${m[2]}` : surah ? `${surah}:${m[1]}` : null
      if (key) scrollToAyah(key, { behavior })
    }
    // native fragment scroll already happened; re-align once fonts have settled, then glow
    const t = window.setTimeout(() => {
      if (document.fonts?.ready) document.fonts.ready.then(() => go('instant' as ScrollBehavior))
      else go('auto')
    }, 60)
    const onHash = () => go('smooth')
    window.addEventListener('hashchange', onHash)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('hashchange', onHash)
    }
  }, [surah])

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (document.querySelector('[role="dialog"]')) return
      const keys = Array.from(document.querySelectorAll<HTMLElement>('[data-ayah]')).map((el) => el.dataset.ayah!)
      if (!keys.length) return
      const cur = useReaderUi.getState().inView?.key ?? keys[0]
      const i = Math.max(0, keys.indexOf(cur))
      switch (e.key) {
        case 'j':
        case 'J':
          e.preventDefault()
          scrollToAyah(keys[Math.min(keys.length - 1, i + 1)], { glow: false })
          break
        case 'k':
        case 'K':
          e.preventDefault()
          scrollToAyah(keys[Math.max(0, i - 1)], { glow: false })
          break
        case ' ': {
          if (isInteractive(e.target)) return
          e.preventDefault()
          const p = usePlayer.getState()
          if (p.status !== 'idle' && p.queue) p.toggle()
          else {
            const [s, a] = cur.split(':').map(Number)
            p.playSurah(s, a)
          }
          break
        }
        case 'b':
        case 'B':
          e.preventDefault()
          toggleBookmark(cur)
          break
        case 't':
        case 'T':
          e.preventDefault()
          useReaderUi.getState().openTafsir(cur)
          break
        case 'f':
        case 'F': {
          e.preventDefault()
          const ui = useUi.getState()
          ui.setImmersive(!ui.immersive)
          break
        }
        case 'Escape':
          if (useUi.getState().immersive) useUi.getState().setImmersive(false)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}
