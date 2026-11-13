import { test as base, expect, type Page } from '@playwright/test'

/**
 * Shared fixtures:
 *  - every test runs hermetically: requests to third-party hosts (quran.com API, audio CDNs, tile servers …)
 *    are answered locally so tests never depend on the internet and never flake on it.
 *  - `problems` collects page errors + console errors that originate from our own code.
 */
export interface Problems {
  list: string[]
}

const EMPTY_JSON = JSON.stringify({})

export const test = base.extend<{ problems: Problems }>({
  context: async ({ context, baseURL }, use) => {
    const origin = new URL(baseURL!).origin
    await context.route(
      (url) => url.origin !== origin && /^https?:$/.test(url.protocol),
      (route) => {
        const type = route.request().resourceType()
        if (type === 'image') return route.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64') })
        if (type === 'media') return route.abort('blockedbyclient')
        if (type === 'fetch' || type === 'xhr') return route.fulfill({ status: 200, contentType: 'application/json', body: EMPTY_JSON, headers: { 'access-control-allow-origin': '*' } })
        return route.abort('blockedbyclient')
      }
    )
    // the Next.js dev-mode indicator floats over the bottom-left tab and intercepts clicks; irrelevant in production
    await context.addInitScript(() => {
      const hide = () => {
        if (!document.documentElement) return
        if (document.getElementById('__e2e_hide_nextjs')) return
        const st = document.createElement('style')
        st.id = '__e2e_hide_nextjs'
        st.textContent = 'nextjs-portal{display:none!important}'
        document.documentElement.appendChild(st)
      }
      document.addEventListener('DOMContentLoaded', hide)
      hide()
    })
    await use(context)
  },
  problems: async ({ page }, use) => {
    const problems: Problems = { list: [] }
    page.on('pageerror', (e) => problems.list.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      const text = m.text()
      // resource-load noise for the third-party hosts we deliberately block
      if (/ERR_BLOCKED_BY_CLIENT|Failed to load resource/.test(text) && !/localhost|127\.0\.0\.1/.test(m.location().url)) return
      problems.list.push(`console.error: ${text}`)
    })
    page.on('response', (r) => {
      const u = new URL(r.url())
      if (u.origin === new URL(page.url() === 'about:blank' ? r.url() : page.url()).origin && r.status() >= 500) problems.list.push(`HTTP ${r.status()}: ${u.pathname}`)
    })
    await use(problems)
  },
})

export { expect }

/** Language/theme/reader prefs are persisted in localStorage; seed before the first navigation. */
export async function seedStorage(page: Page, entries: Record<string, unknown>) {
  await page.addInitScript((e) => {
    for (const [k, v] of Object.entries(e)) {
      // do not overwrite state the test itself created before a reload
      if (!sessionStorage.getItem(`__seed_${k}`)) {
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
        sessionStorage.setItem(`__seed_${k}`, '1')
      }
    }
  }, entries)
}

/** The main user-facing routes used by the console-error and a11y sweeps. */
export const MAIN_ROUTES = [
  '/', '/quran', '/surah/al-mulk', '/surah/al-baqarah/255', '/juz/30', '/topics', '/topics/patience', '/dua', '/names-of-allah',
  '/search?q=mercy', '/hifz', '/journey', '/prayer-times', '/qibla', '/calendar', '/dhikr', '/saved', '/settings', '/about',
]
