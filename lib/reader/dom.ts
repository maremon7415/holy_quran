'use client'
import { chapters } from '@/lib/quran/chapters'
import { site } from '@/lib/site'

export const ayahEl = (key: string) => document.querySelector<HTMLElement>(`[data-ayah="${key}"]`)

/** Plain Arabic of an ayah block (without the ayah-number marker). */
function arabicOf(el: HTMLElement) {
  const p = el.querySelector<HTMLElement>('.ar-plain')
  if (!p) return ''
  let s = ''
  p.childNodes.forEach((n) => {
    if (n instanceof HTMLElement && n.classList.contains('ayah-marker')) return
    s += n.textContent ?? ''
  })
  return s.replace(/\s+/g, ' ').trim()
}

/** Read an ayah's texts back from the server-rendered DOM (avoids shipping the corpus twice). */
export function readAyahText(key: string) {
  const el = ayahEl(key)
  const q = (sel: string) => el?.querySelector<HTMLElement>(sel)?.innerText.trim() ?? ''
  return {
    ar: el ? arabicOf(el) : '',
    en: q('[data-tr="en"][data-ed="sahih"]'),
    enH: q('[data-tr="en"][data-ed="haleem"]'),
    bn: q('[data-tr="bn"]'),
    tl: q('[data-tr="tl"]'),
    bt: q('[data-tr="bt"]'),
  }
}

/**
 * Wrap the words of a server-rendered ayah (plain text + waqf spans) into `<span class="w" data-w>`
 * so the recited word can be highlighted. Done lazily, only for ayahs that need it. Idempotent.
 */
export function wrapWords(el: HTMLElement | null) {
  const p = el?.querySelector<HTMLElement>('.ar-plain')
  if (!p || p.dataset.wrapped) return
  p.dataset.wrapped = '1'
  let pos = 0
  for (const node of Array.from(p.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const text = node.textContent ?? ''
    const frag = document.createDocumentFragment()
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue
      if (/^\s+$/.test(part)) frag.append(part)
      else {
        const s = document.createElement('span')
        s.className = 'w'
        s.dataset.w = String(++pos)
        s.textContent = part
        frag.append(s)
      }
    }
    node.replaceWith(frag)
  }
}

export function ayahRef(key: string) {
  const [s, a] = key.split(':').map(Number)
  const c = chapters[s - 1]
  return { surah: s, ayah: a, name: c?.nameSimple ?? '', url: `${site.url}/surah/${c?.slug}/${a}` }
}

/** Smooth-scroll an ayah to just below the sticky chrome and give it a brief glow. */
export function scrollToAyah(key: string, opts: { glow?: boolean; behavior?: ScrollBehavior } = {}) {
  const el = ayahEl(key)
  if (!el) return false
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: opts.behavior ?? 'smooth' })
  if (opts.glow !== false) {
    el.removeAttribute('data-glow')
    void el.offsetWidth
    el.setAttribute('data-glow', '1')
    window.setTimeout(() => el.removeAttribute('data-glow'), 2400)
  }
  return true
}

/** Find (or create) a layer slot inside an ayah block: `.tj-slot` / `.wbw-slot` in `.ayah-ar`, `.xt-slot` in `.ayah-tr`. */
export function ayahSlot(el: HTMLElement, cls: 'tj-slot' | 'wbw-slot' | 'xt-slot') {
  const parent = el.querySelector<HTMLElement>(cls === 'xt-slot' ? '.ayah-tr' : '.ayah-ar')
  if (!parent) return null
  let s = parent.querySelector<HTMLElement>(`:scope > .${cls}`)
  if (!s) {
    s = document.createElement('div')
    s.className = cls
    if (cls === 'tj-slot') parent.querySelector('.ar-plain')?.after(s)
    else parent.append(s)
  }
  return s
}
