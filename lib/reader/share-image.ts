'use client'
/** Canvas renderer for "Share as image" ayah cards (1080×1350, Instagram portrait). */

export type CardTheme = 'emerald' | 'parchment' | 'midnight'

export const CARD_THEMES: Record<CardTheme, { name: { en: string; bn: string }; bg: [string, string]; pattern: string; arabic: string; text: string; muted: string; accent: string; swatch: string }> = {
  emerald: { name: { en: 'Emerald', bn: 'পান্না' }, bg: ['#0f4a37', '#06261c'], pattern: 'rgba(230,194,122,0.11)', arabic: '#fbf5e4', text: '#dcebe2', muted: 'rgba(220,235,226,0.62)', accent: '#e6c27a', swatch: '#0f4a37' },
  parchment: { name: { en: 'Parchment', bn: 'পার্চমেন্ট' }, bg: ['#f8efd9', '#e9d6ab'], pattern: 'rgba(148,102,27,0.12)', arabic: '#2b1f12', text: '#4a3b26', muted: 'rgba(74,59,38,0.62)', accent: '#94661b', swatch: '#efe0bb' },
  midnight: { name: { en: 'Midnight', bn: 'মধ্যরাত' }, bg: ['#111a33', '#04060d'], pattern: 'rgba(160,180,255,0.08)', arabic: '#f4f6ff', text: '#cdd3e8', muted: 'rgba(205,211,232,0.6)', accent: '#d9b56a', swatch: '#111a33' },
}

export interface CardInput {
  ar: string
  translation: string
  lang: 'en' | 'bn' | 'ar'
  key: string
  surahName: string
  surahArabic: string
  theme: CardTheme
}

const W = 1080
const H = 1350

const GIRIH = [
  'M60 18 72 48 102 60 72 72 60 102 48 72 18 60 48 48Z',
  'M30.3 30.3 60 42.6 89.7 30.3 77.4 60 89.7 89.7 60 77.4 30.3 89.7 42.6 60Z',
  'M0 0 18 0 30.3 30.3 0 18ZM120 0 102 0 89.7 30.3 120 18ZM0 120 18 120 30.3 89.7 0 102ZM120 120 102 120 89.7 89.7 120 102Z',
  'M60 0V18M60 102V120M0 60H18M102 60H120',
]

function cssFont(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v || fallback
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

/** Fit text into a box by shrinking the font; returns the chosen size and lines. */
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, maxW: number, maxH: number, max: number, min: number, lh: number, weight = '400') {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`
    const lines = wrap(ctx, text, maxW)
    if (lines.length * size * lh <= maxH) return { size, lines }
  }
  ctx.font = `${weight} ${min}px ${family}`
  const lines = wrap(ctx, text, maxW)
  const maxLines = Math.max(1, Math.floor(maxH / (min * lh)))
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + ' …'
  }
  return { size: min, lines }
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.62
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  ctx.closePath()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

let logo: Promise<HTMLImageElement | null> | null = null
const loadLogo = () =>
  (logo ??= new Promise((res) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => res(null)
    img.src = '/brand/logo.svg'
  }))

export async function renderAyahCard(canvas: HTMLCanvasElement, input: CardInput) {
  const th = CARD_THEMES[input.theme]
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const fAr = cssFont('--font-amiri-quran', "'Amiri Quran', serif")
  const fArUi = cssFont('--font-amiri', "'Amiri', serif")
  const fDisplay = cssFont('--font-display-serif', 'Georgia, serif')
  const fUi = cssFont('--font-ui', 'system-ui, sans-serif')
  const fBn = cssFont('--font-hind-siliguri', 'sans-serif')
  try {
    await Promise.all([
      document.fonts.load(`60px ${fAr}`, 'بِسْمِ'),
      document.fonts.load(`40px ${fArUi}`, 'سورة'),
      document.fonts.load(`italic 36px ${fDisplay}`, 'Aa'),
      document.fonts.load(`600 24px ${fUi}`, 'Aa'),
      input.lang === 'bn' ? document.fonts.load(`32px ${fBn}`, 'আ') : Promise.resolve(),
    ])
  } catch {}

  // background
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H)
  g.addColorStop(0, th.bg[0])
  g.addColorStop(1, th.bg[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, H * 0.36, 40, W / 2, H * 0.36, W * 0.75)
  glow.addColorStop(0, input.theme === 'parchment' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.07)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // girih pattern
  ctx.save()
  ctx.strokeStyle = th.pattern
  ctx.lineWidth = 1.4
  const paths = GIRIH.map((d) => new Path2D(d))
  const tile = 150
  for (let y = -tile / 2; y < H; y += tile) {
    for (let x = -tile / 2; x < W; x += tile) {
      ctx.setTransform(tile / 120, 0, 0, tile / 120, x, y)
      for (const p of paths) ctx.stroke(p)
      ctx.beginPath()
      ctx.arc(60, 60, 10, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.restore()
  // vignette so the pattern fades behind text
  const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * 0.7)
  v.addColorStop(0, input.theme === 'parchment' ? 'rgba(248,239,217,0.75)' : 'rgba(0,0,0,0.0)')
  v.addColorStop(1, input.theme === 'parchment' ? 'rgba(248,239,217,0)' : 'rgba(0,0,0,0.35)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, W, H)

  // double frame
  ctx.strokeStyle = th.accent
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 2
  roundRect(ctx, 44, 44, W - 88, H - 88, 36)
  ctx.stroke()
  ctx.globalAlpha = 0.25
  roundRect(ctx, 58, 58, W - 116, H - 116, 28)
  ctx.stroke()
  ctx.globalAlpha = 1

  // header: surah name
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = th.accent
  ctx.font = `400 46px ${fArUi}`
  ctx.direction = 'rtl'
  ctx.fillText(`سُورَةُ ${input.surahArabic}`, W / 2, 150)
  ctx.direction = 'ltr'
  ctx.font = `700 22px ${fUi}`
  ctx.fillStyle = th.muted
  const label = `SURAH ${input.surahName.toUpperCase()}  ·  ${input.key}`
  // letter spacing
  ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '5px'
  ctx.fillText(label, W / 2, 196)
  ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px'

  // layout budget
  const top = 250
  const bottom = H - 190
  const hasTr = input.lang !== 'ar' && !!input.translation
  const arMaxH = hasTr ? (bottom - top) * 0.56 : bottom - top - 40
  const maxW = W - 220

  // Arabic
  ctx.direction = 'rtl'
  const ar = fit(ctx, input.ar, fAr, maxW, arMaxH, 84, 34, 1.95)
  ctx.font = `400 ${ar.size}px ${fAr}`
  ctx.fillStyle = th.arabic
  const arBlockH = ar.lines.length * ar.size * 1.95
  let trFit: { size: number; lines: string[] } | null = null
  const trFamily = input.lang === 'bn' ? fBn : fDisplay
  if (hasTr) {
    ctx.direction = 'ltr'
    trFit = fit(ctx, input.translation, trFamily, maxW - 20, bottom - top - arBlockH - 110, 40, 22, input.lang === 'bn' ? 1.65 : 1.5)
  }
  const trLh = input.lang === 'bn' ? 1.65 : 1.5
  const trBlockH = trFit ? trFit.lines.length * trFit.size * trLh : 0
  const total = arBlockH + (trFit ? 90 + trBlockH : 0)
  let y = top + Math.max(0, (bottom - top - total) / 2)

  ctx.direction = 'rtl'
  ctx.font = `400 ${ar.size}px ${fAr}`
  ctx.fillStyle = th.arabic
  for (const line of ar.lines) {
    y += ar.size * 1.95
    ctx.fillText(line, W / 2, y - ar.size * 0.55)
  }

  if (trFit) {
    // ornament divider
    y += 45
    ctx.strokeStyle = th.accent
    ctx.globalAlpha = 0.6
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(W / 2 - 150, y); ctx.lineTo(W / 2 - 26, y); ctx.moveTo(W / 2 + 26, y); ctx.lineTo(W / 2 + 150, y); ctx.stroke()
    ctx.globalAlpha = 1
    ctx.fillStyle = th.accent
    star(ctx, W / 2, y, 14)
    ctx.fill()
    y += 45
    ctx.direction = 'ltr'
    ctx.fillStyle = th.text
    ctx.font = input.lang === 'bn' ? `400 ${trFit.size}px ${trFamily}` : `italic 400 ${trFit.size}px ${trFamily}`
    for (const line of trFit.lines) {
      y += trFit.size * trLh
      ctx.fillText(line, W / 2, y - trFit.size * 0.35)
    }
  }

  // footer
  ctx.direction = 'ltr'
  ctx.fillStyle = th.muted
  ctx.font = `600 26px ${fUi}`
  ctx.fillText(`Qur'an ${input.key}`, W / 2, H - 140)
  const img = await loadLogo()
  ctx.font = `600 24px ${fDisplay}`
  const brand = 'Noor Quran'
  const bw = ctx.measureText(brand).width
  const lx = W / 2 - (bw + 40) / 2
  if (img) ctx.drawImage(img, lx, H - 112, 30, 30)
  else {
    ctx.fillStyle = th.accent
    star(ctx, lx + 15, H - 97, 14)
    ctx.fill()
  }
  ctx.fillStyle = th.accent
  ctx.textAlign = 'left'
  ctx.fillText(brand, lx + 40, H - 89)
  ctx.textAlign = 'center'
}

export const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/png'))
