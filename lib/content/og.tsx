import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const FONT_URLS = [
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/tajawal/Tajawal-Medium.ttf',
  'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Medium.ttf',
]
let fontPromise: Promise<ArrayBuffer | null> | null = null

/**
 * Arabic font fetched once per build/process. Amiri (and other Naskh fonts) use GSUB lookups that Satori cannot parse
 * ("lookupType: 5 - substFormat: 3"), so we use Tajawal, which shapes correctly. Returns null when offline so OG images fall back to Latin-only. */
function loadArabicFont() {
  fontPromise ??= (async () => {
    for (const url of FONT_URLS) {
      try {
        const res = await fetch(url)
        if (res.ok) return await res.arrayBuffer()
      } catch { /* try next */ }
    }
    return null
  })()
  return fontPromise
}

const EMERALD = '#0b3d2e'
const EMERALD_2 = '#0e6b51'
const GOLD = '#d9b25f'

export interface OgProps {
  /** Small label above the title, e.g. "What the Quran says" */
  kicker?: string
  title: string
  subtitle?: string
  /** Arabic line shown large (needs the font; skipped if unavailable) */
  arabic?: string
  /** Larger Arabic (for names of Allah) */
  arabicSize?: number
}

export async function renderOg({ kicker, title, subtitle, arabic, arabicSize = 96 }: OgProps) {
  const font = await loadArabicFont()
  const showArabic = !!(arabic && font)
  const titleSize = title.length > 70 ? 52 : title.length > 44 ? 62 : 74
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 72px', color: '#fff', background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_2} 100%)`, position: 'relative' }}>
        <div style={{ position: 'absolute', right: -120, top: -120, width: 460, height: 460, borderRadius: 460, border: `2px solid ${GOLD}55`, display: 'flex' }} />
        <div style={{ position: 'absolute', right: -60, top: -60, width: 340, height: 340, borderRadius: 340, border: `2px solid ${GOLD}33`, display: 'flex' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: GOLD, display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 52, background: GOLD, color: EMERALD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>N</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1 }}>{site.name}</div>
          {kicker && <div style={{ marginLeft: 12, padding: '6px 18px', borderRadius: 40, background: '#ffffff1f', fontSize: 24, color: '#f3e7cc', display: 'flex' }}>{kicker}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {showArabic && <div style={{ fontFamily: 'Tajawal', fontSize: arabicSize, color: GOLD, lineHeight: 1.25, display: 'flex', justifyContent: 'flex-start' }}>{arabic}</div>}
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, display: 'flex' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: '#d6e6df', lineHeight: 1.35, display: 'flex' }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: '#cfe3da' }}>
          <div style={{ display: 'flex' }}>{site.url.replace(/^https?:\/\//, '')}</div>
          <div style={{ display: 'flex', color: GOLD }}>Arabic · English · বাংলা</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: font ? [{ name: 'Tajawal', data: font, style: 'normal', weight: 400 }] : undefined },
  )
}
