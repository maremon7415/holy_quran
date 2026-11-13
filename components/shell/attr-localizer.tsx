'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/lang'

/**
 * Hundreds of server-rendered elements (every ayah number, marker, …) carry accessible names/tooltips that cannot become client
 * components without a hydration cost. They ship their Arabic text in `data-ar-title` / `data-ar-aria`; while the UI language is
 * Arabic this swaps them into `title` / `aria-label` (and restores the originals when the language changes back).
 */
export function AttrLocalizer() {
  const lang = useLang()
  const pathname = usePathname()
  useEffect(() => {
    const apply = (root: ParentNode) => {
      const swap = (sel: string, data: string, attr: string, orig: string) => {
        root.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (lang === 'ar') {
            if (el.dataset[orig] === undefined) el.dataset[orig] = el.getAttribute(attr) ?? ''
            el.setAttribute(attr, el.getAttribute(data)!)
          } else if (el.dataset[orig] !== undefined) {
            if (el.dataset[orig]) el.setAttribute(attr, el.dataset[orig]!)
            else el.removeAttribute(attr)
            delete el.dataset[orig]
          }
        })
      }
      swap('[data-ar-title]', 'data-ar-title', 'title', 'origTitle')
      swap('[data-ar-aria]', 'data-ar-aria', 'aria-label', 'origAria')
    }
    apply(document)
    if (lang !== 'ar') return
    let raf = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => apply(document))
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { mo.disconnect(); cancelAnimationFrame(raf) }
  }, [lang, pathname])
  return null
}
