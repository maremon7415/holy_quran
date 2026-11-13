'use client'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { useReader } from '@/lib/stores/reader'
import { tx, type Lang } from '@/lib/lang'
import { ayahRef, readAyahText } from './dom'

const lang = () => (useAppStore.getState().language as Lang) || 'en'

export function isBookmarked(key: string) {
  const [s, a] = key.split(':').map(Number)
  return useAppStore.getState().importantAyahs.some((x) => x.surahNumber === s && x.ayahNumber === a)
}

export function toggleBookmark(key: string) {
  const [s, a] = key.split(':').map(Number)
  const st = useAppStore.getState()
  if (isBookmarked(key)) {
    st.removeImportantAyah(s, a)
    toast(tx(lang(), { en: `Removed bookmark ${key}`, bn: `বুকমার্ক সরানো হয়েছে ${key}`, ar: `أُزيلت علامة ${key}` }))
  } else {
    st.addImportantAyah({ surahNumber: s, ayahNumber: a, tags: [] })
    toast.success(tx(lang(), { en: `Bookmarked ${key}`, bn: `বুকমার্ক করা হয়েছে ${key}`, ar: `حُفظت الآية ${key}` }))
  }
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/** Arabic + the translations the reader has enabled + reference & link. */
export function composeAyahText(key: string) {
  const p = useReader.getState()
  const x = readAyahText(key)
  const r = ayahRef(key)
  const parts = [x.ar]
  const btEl = document.querySelector<HTMLElement>(`[data-ayah="${key}"] [data-tr="bt"]`)
  if (x.bt && btEl && getComputedStyle(btEl).display !== 'none') parts.push(x.bt)
  if (p.showTl && x.tl) parts.push(x.tl)
  if (p.showEn) parts.push(p.enEdition === 'haleem' && x.enH ? x.enH : x.en)
  if (p.showBn && x.bn) parts.push(x.bn)
  parts.push(`— Quran ${r.name} ${key}`, r.url)
  return parts.filter(Boolean).join('\n\n')
}

export async function copyAyah(key: string) {
  const ok = await writeClipboard(composeAyahText(key))
  if (ok) toast.success(tx(lang(), { en: `Copied ${key}`, bn: `কপি হয়েছে ${key}`, ar: `نُسخت الآية ${key}` }))
  else toast.error('Copy failed')
}

export async function copyText(text: string, label?: string) {
  const ok = await writeClipboard(text)
  if (ok) toast.success(label ?? tx(lang(), { en: 'Copied', bn: 'কপি হয়েছে', ar: 'تم النسخ' }))
}

export async function shareAyahLink(key: string) {
  const r = ayahRef(key)
  const title = `Quran ${r.name} ${key}`
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text: readAyahText(key).en || title, url: r.url })
      return
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
    }
  }
  const ok = await writeClipboard(r.url)
  if (ok) toast.success(tx(lang(), { en: 'Link copied', bn: 'লিংক কপি হয়েছে', ar: 'تم نسخ الرابط' }), { description: r.url })
}
