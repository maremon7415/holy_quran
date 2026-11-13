import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from './fixtures'

interface Known { routes: Record<string, Record<string, string>> }
const known: Known = JSON.parse(fs.readFileSync(path.join(__dirname, 'a11y-known-issues.json'), 'utf8'))

const ROUTES = [
  '/', '/quran', '/surah/al-mulk', '/surah/al-baqarah/255', '/topics', '/topics/patience', '/dua', '/dua/dua-morning-asbahna',
  '/names-of-allah', '/names-of-allah/ar-rahman', '/search?q=mercy', '/hifz', '/journey', '/prayer-times', '/qibla', '/calendar',
  '/dhikr', '/saved', '/settings', '/about', '/listen', '/mcp', '/developers',
  '/prayer-times/dhaka', '/hijri-date', '/zakat-calculator',
  '/hadith', '/hadith/bukhari', '/hadith/bukhari/1', '/hadith/abudawud/5095', '/hadith/search?q=intended&c=nawawi40',
]

/** wait until no element is mid-fade (entrance animations blend colours and skew contrast results) */
const settled = (page: import('@playwright/test').Page) =>
  page.waitForFunction(() => ![...document.querySelectorAll<HTMLElement>('body *')].some((e) => { const o = parseFloat(getComputedStyle(e).opacity); return o > 0.02 && o < 0.98 && !e.closest('[aria-hidden="true"]') }), null, { timeout: 8000 }).catch(() => {})

const serious = (impact?: string | null) => impact === 'serious' || impact === 'critical'

async function audit(page: import('@playwright/test').Page, theme: string, lang: string) {
  // `.reveal` fades content in with a scroll-driven animation (partially transparent text just below the fold); audit the settled state
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.evaluate(([t, l]) => {
    localStorage.setItem('theme', t)
    if (l === 'ar') localStorage.setItem('quran-store', JSON.stringify({ state: { language: 'ar' }, version: 0 }))
  }, [theme, lang])
}

interface Case { theme: string; lang: 'en' | 'ar'; route: string; include?: string[] }
const BN_ROUTES = ['/bn', '/bn/quran', '/bn/surah/al-mulk', '/bn/dua', '/bn/names-of-allah', '/bn/hifz', '/bn/prayer-times', '/bn/hadith/bukhari/1']
const cases: Case[] = [
  ...ROUTES.map((route) => ({ theme: 'light', lang: 'en' as const, route })),
  // /juz/30 renders ~560 ayahs (axe takes ~40s on the whole page): audit the shell + the first ayahs only
  { theme: 'light', lang: 'en', route: '/juz/30', include: ['header', 'main > :first-child', 'article[data-ayah]:nth-of-type(-n+8)'] },
  // every theme is audited on the pages that use the most token pairs
  ...['sand', 'dusk', 'dark', 'black'].flatMap((theme) => ['/', '/surah/al-mulk', '/dua', '/hifz', '/quran', '/hadith/bukhari/1'].map((route) => ({ theme, lang: 'en' as const, route }))),
  ...BN_ROUTES.map((route) => ({ theme: 'light', lang: 'en' as const, route })),
  ...['/', '/surah/al-mulk', '/dua', '/settings', '/hifz', '/hadith/bukhari/1'].map((route) => ({ theme: 'light', lang: 'ar' as const, route })),
]

for (const { theme, lang, route, include } of cases) {
  {
    test(`a11y (${theme}${lang === 'ar' ? ', ar' : ''}): ${route}`, async ({ page }) => {
      await audit(page, theme, lang)
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(700) // entrance animations (opacity transitions skew contrast results)
      await settled(page)
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      for (const sel of include ?? []) builder = builder.include(sel)
      const results = await builder.analyze()
      const found = results.violations.filter((v) => serious(v.impact))
      const key = [route, theme !== 'light' ? `[${theme}]` : '', lang !== 'en' ? `[${lang}]` : ''].filter(Boolean).join(' ')
      if (process.env.A11Y_COLLECT) {
        // maintenance mode: `A11Y_COLLECT=/tmp/x.ndjson pnpm test:e2e a11y` → rebuild the allow-list (see README)
        fs.appendFileSync(process.env.A11Y_COLLECT, found.map((v) => JSON.stringify({ key, id: v.id, help: `${v.help} (${v.nodes.length} nodes)` })).join('\n') + (found.length ? '\n' : ''))
        return
      }
      const allowed = known.routes[key] ?? {}

      const unexpected = found.filter((v) => !(v.id in allowed))
      const summary = unexpected.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target?.join(' ')} — ${v.helpUrl}`)
      expect(summary, `NEW serious/critical a11y violations on ${key}. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json`).toEqual([])

      const fixed = Object.keys(allowed).filter((id) => !found.some((v) => v.id === id))
      // contrast results can vary slightly with animation timing, so a "fixed" entry is surfaced as an annotation, not a failure
      if (fixed.length) test.info().annotations.push({ type: 'a11y-known-issues-stale', description: `${key}: ${fixed.join(', ')} no longer occur — remove from a11y-known-issues.json` })
    })
  }
}

test.describe('a11y: overlays', () => {
  const run = async (page: import('@playwright/test').Page) => {
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    return r.violations.filter((v) => serious(v.impact)).map((v) => `${v.id}: ${v.nodes[0]?.target?.join(' ')}`)
  }
  test('command palette (open)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: /search the quran/i })).toBeVisible()
    await page.waitForTimeout(700)
    await settled(page)
    expect(await run(page)).toEqual([])
  })
  for (const [name, vp] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 800 }]] as const) {
    test(`reader settings sheet (${name})`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('/surah/al-fatihah')
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: /reading settings/i }).last().click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.waitForTimeout(800)
      await settled(page)
      expect(await run(page)).toEqual([])
    })
  }
})
