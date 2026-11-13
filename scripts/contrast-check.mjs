// WCAG contrast audit of the key token pairs in every theme (parsed from app/globals.css).
// usage: node scripts/contrast-check.mjs   (exit 1 if any pair < 4.5:1)
import fs from 'node:fs'
const css = fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const themes = { light: ':root,\n.light', sand: '.sand', dusk: '.dusk', dark: '.dark', black: '.black' }
const read = (sel) => {
  const i = css.indexOf(sel + ' {')
  const body = css.slice(i, css.indexOf('\n}', i))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map((m) => [m[1], m[2]]))
}
const rgb = (h) => { h = h.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) }
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const mix = (fg, bg, a) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)))
const PAIRS = [
  ['foreground', 'background'], ['foreground', 'card'], ['muted-foreground', 'background'], ['muted-foreground', 'card'], ['muted-foreground', 'muted'],
  ['muted-foreground', 'secondary'], ['muted-foreground', 'accent'], ['muted-foreground', 'surface-2'], ['muted-foreground', 'popover'],
  ['gold', 'background'], ['gold', 'card'], ['gold', 'gold-soft'], ['gold', 'accent'], ['gold', 'muted'], ['gold', 'popover'], ['gold', 'surface-2'],
  ['primary', 'background'], ['primary', 'card'], ['primary', 'accent'], ['primary', 'muted'], ['accent-foreground', 'accent'], ['primary-foreground', 'primary'], ['word-active', 'background'],
]
// translucent patterns used in the UI: [fg, bg, alpha-of-fg-over-bg, label]
const BLEND = [['primary', 'card', 0.2, 'primary/20 bar'], ['foreground', 'background', 0.8, 'foreground/80'], ['muted-foreground', 'card', 1, 'muted on card']]
let bad = 0
for (const [name, sel] of Object.entries(themes)) {
  const t = read(sel); const base = name === 'light' ? t : { ...read(':root,\n.light'), ...t }
  console.log(`\n${name}`)
  for (const [f, b] of PAIRS) {
    if (!base[f] || !base[b]) continue
    const r = ratio(rgb(base[f]), rgb(base[b])); const ok = r >= 4.5; if (!ok) bad++
    console.log(`  ${(f + ' on ' + b).padEnd(34)} ${base[f]} / ${base[b]}  ${r.toFixed(2).padStart(5)}  ${ok ? 'AA' : 'FAIL'}`)
  }
  const tint = mix(rgb(base.primary), rgb(base.card), 0.2)
  const r = ratio(rgb(base.primary), tint); if (r < 4.5) bad++
  console.log(`  ${'primary on primary/20 tint'.padEnd(34)} ${base.primary} / #${tint.map((c) => c.toString(16).padStart(2, '0')).join('')}  ${r.toFixed(2).padStart(5)}  ${r >= 4.5 ? 'AA' : 'FAIL'}`)
}
console.log(bad ? `\n${bad} pair(s) below 4.5:1` : '\nAll pairs >= 4.5:1')
process.exit(bad ? 1 : 0)
