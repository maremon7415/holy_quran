import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const FONT_URLS = [
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/tajawal/Tajawal-Medium.ttf',
  'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Medium.ttf',
]
const BN_FONT_URLS = [
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/hindsiliguri/HindSiliguri-SemiBold.ttf',
  'https://raw.githubusercontent.com/google/fonts/main/ofl/hindsiliguri/HindSiliguri-SemiBold.ttf',
]
let fontPromise: Promise<ArrayBuffer | null> | null = null
let bnFontPromise: Promise<ArrayBuffer | null> | null = null

/** Hind Siliguri (Bangla + Latin) for /bn OG images; null when offline → the caller falls back to the English card. */
function loadBanglaFont() {
  bnFontPromise ??= (async () => {
    for (const url of BN_FONT_URLS) {
      try {
        const res = await fetch(url)
        if (res.ok) return await res.arrayBuffer()
      } catch { /* try next */ }
    }
    return null
  })()
  return bnFontPromise
}

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

export interface OgTexts {
  kicker?: string
  title: string
  subtitle?: string
}

export interface OgProps {
  /** Small label above the title, e.g. "What the Quran says" */
  kicker?: string
  title: string
  subtitle?: string
  /** Arabic line shown large (needs the font; skipped if unavailable) */
  arabic?: string
  /** Larger Arabic (for names of Allah) */
  arabicSize?: number
  /** Bangla copy, used for `/bn` pages when the Bangla font could be loaded (otherwise the English copy above is rendered) */
  bn?: OgTexts
}

/** Satori's bundled shaping copes with plain Arabic + harakat but not Uthmani-only marks; normalise them away. */
const plainArabic = (s: string) => s.replace(/ٱ/g, 'ا').replace(/[\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640]/g, '').replace(/\s+/g, ' ').trim()

/**
 * Satori does no Indic shaping: pre-base vowel signs (ি ে ৈ ো ৌ) are not reordered and conjuncts (hasanta + consonant,
 * e.g. র্ফলা / ক্ক) are drawn unjoined. Only Bangla strings free of those sequences render correctly, so a Bangla card is
 * used when its title is "safe" (individual kicker/subtitle lines are dropped when not); otherwise the English card is rendered.
 */
export const bnShapesCorrectly = (s: string) => !/[\u09CD\u09BF\u09C7\u09C8\u09CB\u09CC]/.test(s)

export async function renderOg(props: OgProps, opts: { locale?: 'en' | 'bn' } = {}) {
  const { arabic, arabicSize = 96 } = props
  const bnFont = opts.locale === 'bn' && props.bn && bnShapesCorrectly(props.bn.title) ? await loadBanglaFont() : null
  const useBn = !!bnFont
  const texts = useBn ? props.bn! : props
  const { title } = texts
  const kicker = useBn && texts.kicker && !bnShapesCorrectly(texts.kicker) ? undefined : texts.kicker
  const subtitle = useBn && texts.subtitle && !bnShapesCorrectly(texts.subtitle) ? undefined : texts.subtitle
  const font = await loadArabicFont()
  const showArabic = !!(arabic && font)
  const titleSize = title.length > 70 ? 52 : title.length > 44 ? 62 : 74
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 72px', color: '#fff', ...(useBn ? { fontFamily: 'Hind' } : {}), background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_2} 100%)`, position: 'relative' }}>
        <div style={{ position: 'absolute', right: -120, top: -120, width: 460, height: 460, borderRadius: 460, border: `2px solid ${GOLD}55`, display: 'flex' }} />
        <div style={{ position: 'absolute', right: -60, top: -60, width: 340, height: 340, borderRadius: 340, border: `2px solid ${GOLD}33`, display: 'flex' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: GOLD, display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 52, background: GOLD, color: EMERALD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>N</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: useBn ? 0 : 1 }}>{useBn ? 'নূর কুরআন' : site.name}</div>
          {kicker && <div style={{ marginLeft: 12, padding: '6px 18px', borderRadius: 40, background: '#ffffff1f', fontSize: 24, color: '#f3e7cc', display: 'flex' }}>{kicker}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {showArabic && <div style={{ fontFamily: 'Tajawal', fontSize: arabicSize, color: GOLD, lineHeight: 1.3, width: '100%', display: 'flex', direction: 'rtl', justifyContent: 'flex-end' }}>{plainArabic(arabic!)}</div>}
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, display: 'flex' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: '#d6e6df', lineHeight: 1.35, display: 'flex' }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: '#cfe3da' }}>
          <div style={{ display: 'flex' }}>{site.url.replace(/^https?:\/\//, '')}</div>
          <div style={{ display: 'flex', color: GOLD }}>Arabic · English · বাংলা</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [...(font ? [{ name: 'Tajawal', data: font, style: 'normal' as const, weight: 400 as const }] : []), ...(bnFont ? [{ name: 'Hind', data: bnFont, style: 'normal' as const, weight: 400 as const }] : [])] },
  )
}
