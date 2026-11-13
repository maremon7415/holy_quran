import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from './fixtures'

interface Known { routes: Record<string, Record<string, string>> }
const known: Known = JSON.parse(fs.readFileSync(path.join(__dirname, 'a11y-known-issues.json'), 'utf8'))

const ROUTES = [
  '/', '/quran', '/surah/al-mulk', '/surah/al-baqarah/255', '/juz/30', '/topics', '/topics/patience', '/dua', '/dua/dua-morning-asbahna',
  '/names-of-allah', '/names-of-allah/ar-rahman', '/search?q=mercy', '/hifz', '/journey', '/prayer-times', '/qibla', '/calendar',
  '/dhikr', '/saved', '/settings', '/about', '/listen',
]

const serious = (impact?: string | null) => impact === 'serious' || impact === 'critical'

async function audit(page: import('@playwright/test').Page, theme: string) {
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('theme', t), theme)
}

for (const theme of ['light', 'dark']) {
  for (const route of theme === 'light' ? ROUTES : ['/', '/surah/al-mulk', '/dua', '/hifz']) {
    test(`a11y (${theme}): ${route}`, async ({ page }) => {
      await audit(page, theme)
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(700) // entrance animations (opacity transitions skew contrast results)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      const found = results.violations.filter((v) => serious(v.impact))
      const key = theme === 'light' ? route : `${route} [${theme}]`
      const allowed = known.routes[key] ?? {}

      const unexpected = found.filter((v) => !(v.id in allowed))
      const summary = unexpected.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target?.join(' ')} — ${v.helpUrl}`)
      expect(summary, `NEW serious/critical a11y violations on ${key}. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json`).toEqual([])

      const fixed = Object.keys(allowed).filter((id) => !found.some((v) => v.id === id))
      expect(fixed, `a11y-known-issues.json lists rules that no longer occur on ${key}; remove them`).toEqual([])
    })
  }
}
