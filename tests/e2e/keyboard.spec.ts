import { test, expect } from './fixtures'

/** Keyboard + focus management: skip link, dialogs trap focus and give it back, no traps, visible focus ring. */

test.describe('keyboard', () => {
  test('the skip link is the first stop, becomes visible and moves focus into <main>', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to content/i })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main$/)
    await expect(page.locator('#main')).toBeFocused()
  })

  test('command palette: modal dialog, focus trapped, scroll locked, focus returns to the trigger', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const trigger = page.locator('header button:visible', { hasText: /search/i }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dlg = page.getByRole('dialog', { name: /search the quran/i })
    await expect(dlg).toBeVisible()
    await expect(dlg).toHaveAttribute('aria-modal', 'true')
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  for (const [name, button] of [['reading settings', /reading settings/i], ['tafsir', /^tafsir$/i]] as const) {
    test(`reader ${name} sheet: focus stays inside, Escape returns focus to its trigger`, async ({ page }) => {
      await page.goto('/surah/al-fatihah')
      await page.waitForLoadState('networkidle')
      const trigger = page.getByRole('button', { name: button }).locator('visible=true').first()
      await trigger.focus()
      await page.keyboard.press('Enter')
      const dlg = page.getByRole('dialog')
      await expect(dlg).toBeVisible()
      // the sheet must be fully on-screen once settled
      await expect.poll(async () => {
        const r = await dlg.evaluate((el) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: innerWidth, h: innerHeight } })
        return r.l >= -1 && r.t >= -1 && r.r <= r.w + 1 && r.b <= r.h + 1
      }).toBe(true)
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab')
        expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
      }
      await page.keyboard.press('Escape')
      await expect(dlg).toBeHidden()
      await expect(trigger).toBeFocused()
    })
  }

  test('mobile: reader settings sheet opens fully on-screen the very first time', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('/surah/al-fatihah')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /reading settings/i }).locator('visible=true').first().click()
    const dlg = page.getByRole('dialog')
    await expect(dlg).toBeVisible()
    await expect.poll(() => dlg.evaluate((el) => { const b = el.getBoundingClientRect(); return b.bottom <= innerHeight + 1 && b.left >= -1 && b.right <= innerWidth + 1 })).toBe(true)
  })

  for (const route of ['/', '/settings', '/hifz', '/dua']) {
    test(`no keyboard trap and every stop has a visible focus indicator: ${route}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const seen = new Set<string>()
      const missing: string[] = []
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab')
        const d = await page.evaluate(() => {
          const e = document.activeElement as HTMLElement
          if (!e || e === document.body) return null
          const cs = getComputedStyle(e)
          const r = e.getBoundingClientRect()
          const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
          const shadow = cs.boxShadow !== 'none'
          let wrap = false
          for (let p = e.parentElement, n = 0; p && n < 3; p = p.parentElement, n++) if (p.matches(':focus-within') && getComputedStyle(p).boxShadow !== 'none') wrap = true
          return { id: `${e.tagName}|${e.className}|${e.getAttribute('aria-label') ?? e.textContent?.trim().slice(0, 20)}|${Math.round(r.top)}|${Math.round(r.left)}`, ring: outline || shadow || wrap, visible: r.width > 0 && r.height > 0, sr: !!e.closest('.sr-only') }
        })
        if (!d) continue
        seen.add(d.id)
        if (d.visible && !d.sr && !d.ring) missing.push(d.id)
      }
      expect(seen.size, 'focus keeps moving through the page').toBeGreaterThan(15)
      expect(missing, 'focused elements without a visible indicator').toEqual([])
    })
  }
})
