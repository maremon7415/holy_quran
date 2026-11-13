'use client'
import { chapters } from '@/lib/quran/chapters'
import { site } from '@/lib/site'

export const ayahEl = (key: string) => document.querySelector<HTMLElement>(`[data-ayah="${key}"]`)

/** Read an ayah's texts back from the server-rendered DOM (avoids shipping the corpus twice). */
export function readAyahText(key: string) {
  const el = ayahEl(key)
  const q = (sel: string) => el?.querySelector<HTMLElement>(sel)?.innerText.trim() ?? ''
  const ar = el ? Array.from(el.querySelectorAll<HTMLElement>('.ar-plain > .w, .ar-plain > .waqf')).map((w) => w.textContent?.trim()).join(' ') : ''
  return { ar, en: q('[data-tr="en"][data-ed="sahih"]'), enH: q('[data-tr="en"][data-ed="haleem"]'), bn: q('[data-tr="bn"]'), tl: q('[data-tr="tl"]') }
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
