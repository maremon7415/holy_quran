import { test, expect, seedStorage } from './fixtures'
import type { Page } from '@playwright/test'

const BN = /[ঀ-৿]/
const AR = /[؀-ۿ]{3,}/

const alternates = (page: Page) =>
  page.evaluate(() => Object.fromEntries([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), new URL((l as HTMLLinkElement).href).pathname])))
const canonical = (page: Page) => page.evaluate(() => new URL(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href).pathname)
const mdAlternate = (page: Page) => page.evaluate(() => { const h = document.querySelector<HTMLLinkElement>('link[rel="alternate"][type="text/markdown"]')?.href; return h ? new URL(h).pathname : null })
/** all @type values across the page's JSON-LD blocks (arrays and @graph included) */
const ldTypes = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = []
    const walk = (n: unknown) => { if (Array.isArray(n)) n.forEach(walk); else if (n && typeof n === 'object') { const o = n as Record<string, unknown>; if (typeof o['@type'] === 'string') out.push(o['@type']); if (o['@graph']) walk(o['@graph']) } }
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => { try { walk(JSON.parse(s.textContent || '')) } catch { /* ignore */ } })
    return out
  })
const ldNodes = (page: Page, type: string) =>
  page.evaluate((t) => {
    const out: Record<string, any>[] = []
    const walk = (n: unknown) => { if (Array.isArray(n)) n.forEach(walk); else if (n && typeof n === 'object') { const o = n as Record<string, any>; if (o['@type'] === t) out.push(o) } }
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => { try { walk(JSON.parse(s.textContent || '')) } catch { /* ignore */ } })
    return out
  }, type)

test.describe('/learn hub', () => {
  test('renders the five guide cards, hreflang pair, markdown alternate and JSON-LD', async ({ page, problems }) => {
    await page.goto('/learn')
    await expect(page.locator('h1')).toContainText(/Learn the basics of Islam/)
    for (const g of ['salah', 'wudu', 'tajweed', 'kalima', 'arabic-alphabet']) await expect(page.locator(`[data-learn-card="${g}"]`)).toHaveAttribute('href', `/learn/${g}`)
    expect(await alternates(page)).toEqual({ en: '/learn', bn: '/bn/learn', 'x-default': '/learn' })
    expect(await canonical(page)).toBe('/learn')
    expect(await mdAlternate(page)).toBe('/learn.md')
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'CollectionPage', 'BreadcrumbList', 'FAQPage']))
    await expect(page.locator('[data-cite]')).toContainText('/learn')
    await expect(page.locator('[data-scholar-note]')).toContainText(/Hanafi/)
    expect(problems.list).toEqual([])
  })

  test('/bn/learn is Bangla on the server and links stay inside /bn', async ({ page, request }) => {
    const html = await (await request.get('/bn/learn')).text()
    expect(html).toMatch(/<h1[^>]*>[^<]*[ঀ-৿]/)
    await page.goto('/bn/learn')
    await expect(page.locator('h1')).toContainText(BN)
    expect(await alternates(page)).toEqual({ en: '/learn', bn: '/bn/learn', 'x-default': '/learn' })
    expect(await canonical(page)).toBe('/bn/learn')
    await expect(page.locator('[data-learn-card="salah"]')).toHaveAttribute('href', '/bn/learn/salah')
    await expect(page.locator('#main a[href="/learn/salah"]')).toHaveCount(0)
  })

  test('nav, command palette, footer and sitemap link the learn section', async ({ page, request }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('option', { name: /How to pray salah/ })).toBeVisible()
    await expect(page.getByRole('option', { name: /Six Kalimas/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('footer a[href="/bn/learn/salah"]')).toContainText('নামাজ শিক্ষা')
    for (const [href, label] of [['/bn/learn/kalima', '৬ কালেমা'], ['/bn/learn/wudu', 'অজুর নিয়ম'], ['/bn/learn/tajweed', 'তাজবীদ']]) await expect(page.locator(`footer a[href="${href}"]`)).toContainText(label)
    const en = await (await request.get('/sitemap/0.xml')).text()
    for (const p of ['/learn', '/learn/salah', '/learn/wudu', '/learn/tajweed', '/learn/tajweed/izhar', '/learn/kalima', '/learn/arabic-alphabet']) expect(en, p).toContain(`${p}</loc>`)
    const entry = en.split('<url>').find((u) => u.includes('/learn/salah</loc>'))!
    expect(entry).toContain('hreflang="bn"')
    const bn = await (await request.get('/sitemap/3.xml')).text()
    for (const p of ['/bn/learn', '/bn/learn/salah', '/bn/learn/tajweed/madd-lazim']) expect(bn, p).toContain(`${p}</loc>`)
    const llms = await (await request.get('/llms.txt')).text()
    expect(llms).toContain('/learn/salah')
    expect(llms).toContain('get_learn_guide')
  })

  test('markdown alternates are served for the hub, guides, rules and Bangla', async ({ request }) => {
    for (const [p, re] of [['/learn.md', /^# /], ['/learn/salah.md', /How to pray salah/], ['/learn/wudu.md', /wudu/i], ['/learn/kalima.md', /Kalima Tayyibah/], ['/learn/arabic-alphabet.md', /\| 28 \|/], ['/learn/tajweed.md', /Izhar/], ['/learn/tajweed/ikhfa.md', /Ikhfa/], ['/bn/learn/kalima.md', /লা ইলাহা ইল্লাল্লাহু/]] as const) {
      const res = await request.get(p)
      expect(res.status(), p).toBe(200)
      expect(res.headers()['content-type'], p).toContain('text/markdown')
      expect(await res.text(), p).toMatch(re)
    }
    expect((await request.get('/learn/tajweed/nope.md')).status()).toBe(404)
  })
})

test.describe('/learn/tajweed', () => {
  test('index lists every rule with the colour legend', async ({ page, problems }) => {
    await page.goto('/learn/tajweed')
    await expect(page.locator('[data-tajweed-rule]')).toHaveCount(17)
    await expect(page.locator('#legend-h')).toBeVisible()
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'CollectionPage', 'BreadcrumbList', 'FAQPage']))
    expect(problems.list).toEqual([])
  })

  test('ikhfa rule page: coloured Quran examples, play button, ayah links, HowTo + FAQ JSON-LD', async ({ page, problems }) => {
    await page.goto('/learn/tajweed/ikhfa')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText(/Ikhfa/)
    const cards = page.locator('[data-tajweed-example]')
    expect(await cards.count()).toBeGreaterThanOrEqual(3)
    expect(await cards.count()).toBeLessThanOrEqual(5)
    // coloured with the existing app colour for ikhfa (#9400a8) — and Arabic comes from the corpus
    const first = cards.first()
    await expect(first.locator('tajweed.ikhafa').first()).toHaveCSS('color', 'rgb(148, 0, 168)')
    await expect(first.locator('.quran-text')).toHaveText(AR)
    const ref = await first.getAttribute('data-tajweed-example')
    const [s, a] = ref!.split(':')
    await expect(first.locator('a[href^="/surah/"]').first()).toHaveAttribute('href', new RegExp(`/surah/[a-z-]+/${a}$`))
    // audio: the play button drives the global player (playRange)
    const play = first.locator('[data-play-ayah]')
    await expect(play).toHaveAttribute('aria-pressed', 'false')
    await play.click()
    await expect(play).toHaveAttribute('aria-pressed', 'true')
    void s
    expect(await mdAlternate(page)).toBe('/learn/tajweed/ikhfa.md')
    expect(await alternates(page)).toEqual({ en: '/learn/tajweed/ikhfa', bn: '/bn/learn/tajweed/ikhfa', 'x-default': '/learn/tajweed/ikhfa' })
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'HowTo', 'FAQPage', 'BreadcrumbList']))
    const howto = (await ldNodes(page, 'HowTo'))[0]
    expect(howto.step.length).toBeGreaterThanOrEqual(3)
    await expect(page.locator('[data-cite]')).toBeVisible()
    // the test browser has no audio codecs / the media host is blocked, so playback itself may report "no supported source"
    expect(problems.list.filter((p) => !/no supported source/.test(p))).toEqual([])
  })

  test('rules the markup does not colour (izhar, tafkheem, waqf) highlight the matched letters', async ({ page }) => {
    await page.goto('/learn/tajweed/izhar')
    await expect(page.locator('[data-tajweed-example] tajweed.izhar').first()).toHaveCSS('color', 'rgb(217, 119, 6)')
    await page.goto('/learn/tajweed/tafkheem-tarqeeq')
    await expect(page.locator('[data-example-group]')).toHaveCount(4)
    await expect(page.locator('[data-example-group="lam-heavy"] tajweed.tafkheem').first()).toBeVisible()
    await expect(page.locator('[data-example-group="lam-light"] tajweed.tarqeeq').first()).toBeVisible()
    await page.goto('/learn/tajweed/waqf-signs')
    await expect(page.locator('[data-example-group]')).toHaveCount(7)
    await expect(page.locator('[data-example-group="la"] tajweed.waqf').first()).toHaveCSS('color', 'rgb(220, 38, 38)')
  })

  for (const theme of ['light', 'sand', 'dusk', 'dark', 'black']) {
    test(`qalqalah examples are coloured and readable in the ${theme} theme`, async ({ page }) => {
      await seedStorage(page, { theme })
      await page.goto('/learn/tajweed/qalqalah')
      await page.waitForLoadState('networkidle')
      const t = page.locator('[data-tajweed-example] tajweed.qalaqah').first()
      await expect(t).toBeVisible()
      const [fg, bg] = await t.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el.closest('article')!).backgroundColor])
      expect(fg).not.toBe(bg)
      const lightness = (c: string) => { const m = c.match(/\d+/g)!.map(Number); return (m[0] * 299 + m[1] * 587 + m[2] * 114) / 1000 }
      // contrast direction: dark themes use a lighter red than the light themes
      if (['dusk', 'dark', 'black'].includes(theme)) expect(lightness(fg)).toBeGreaterThan(lightness(bg) - 60)
      await expect(page.locator('[data-example-group] .quran-text').first()).toBeVisible()
    })
  }

  test('the Bangla twin is server-rendered in Bangla, canonical /bn, hreflang pair and Bangla examples', async ({ page, request }) => {
    const html = await (await request.get('/bn/learn/tajweed/madd-lazim')).text()
    expect(html).toMatch(/<h1[^>]*>[^<]*[ঀ-৿]/)
    await page.goto('/bn/learn/tajweed/madd-lazim')
    await expect(page.locator('h1')).toContainText('মাদ্দে লাযিম')
    expect(await canonical(page)).toBe('/bn/learn/tajweed/madd-lazim')
    expect(await alternates(page)).toEqual({ en: '/learn/tajweed/madd-lazim', bn: '/bn/learn/tajweed/madd-lazim', 'x-default': '/learn/tajweed/madd-lazim' })
    expect(await mdAlternate(page)).toBe('/bn/learn/tajweed/madd-lazim.md')
    await expect(page.locator('[data-tajweed-example]').first().locator('[data-tr="bn"]')).toContainText(BN)
    await expect(page.locator('[data-tajweed-example] tajweed.madda_necessary').first()).toBeVisible()
    await expect(page.locator('h2#faq-h')).toContainText('সচরাচর জিজ্ঞাসা')
  })

  test('unknown rule is a 404', async ({ request }) => {
    expect((await request.get('/learn/tajweed/not-a-rule')).status()).toBe(404)
    expect((await request.get('/bn/learn/tajweed/not-a-rule')).status()).toBe(404)
  })
})

test.describe('/learn/kalima', () => {
  test('six kalimas with Arabic, Bangla uccharon, transliteration, meaning and the honesty note', async ({ page, problems }) => {
    await page.goto('/learn/kalima')
    await expect(page.locator('[data-kalima]')).toHaveCount(6)
    await expect(page.locator('[data-kalima-note]')).toContainText(/teaching convention/)
    const first = page.locator('[data-kalima="tayyibah"]')
    await expect(first).toContainText('La ilaha illallahu Muhammadur rasulullah')
    await expect(first).toContainText(BN)
    await expect(first.locator('[lang="ar"]').first()).toHaveText(AR)
    await expect(first.locator('[data-quran-passage]')).toHaveCount(2) // 47:19 and 48:29 from the corpus
    await expect(page.locator('[data-kalima="radd-e-kufr"]')).toContainText(/Commonly taught/)
    await expect(page.locator('[data-kalima="shahadah"] a[href="/dua/dua-after-wudu"]')).toBeVisible()
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'CollectionPage', 'FAQPage', 'BreadcrumbList']))
    expect(problems.list).toEqual([])
  })
  test('Bangla page leads with Bangla and keeps the Bangla uccharon', async ({ page }) => {
    await page.goto('/bn/learn/kalima')
    await expect(page.locator('h1')).toContainText('৬ কালেমা')
    await expect(page.locator('[data-kalima="tawheed"]')).toContainText('লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু')
    expect(await alternates(page)).toEqual({ en: '/learn/kalima', bn: '/bn/learn/kalima', 'x-default': '/learn/kalima' })
  })
})

test.describe('/learn/wudu', () => {
  test('ten steps with diagrams, four fard, Quran 5:6, breakers with madhhab notes and the dua link', async ({ page, problems }) => {
    await page.goto('/learn/wudu')
    await expect(page.locator('[data-wudu-step]')).toHaveCount(10)
    await expect(page.locator('[data-wudu-step] svg[viewBox="0 0 96 96"]')).toHaveCount(10)
    await expect(page.locator('#fard li')).toHaveCount(4)
    await expect(page.locator('[data-quran-passage="5:6"]')).toContainText(/wash your faces/i)
    await expect(page.locator('[data-quran-passage="5:6"] .quran-text').first()).toHaveText(AR)
    await expect(page.locator('#breakers [data-fiqh-note]')).toContainText(/Hanafi/)
    await expect(page.locator('[data-wudu-step="dua"] a[href="/dua/dua-after-wudu"]')).toBeVisible()
    await expect(page.locator('a[href="/hadith/bukhari/159"]').first()).toBeVisible()
    const howto = (await ldNodes(page, 'HowTo'))[0]
    expect(howto.step).toHaveLength(10)
    expect(howto.step[4].name).toMatch(/face/i)
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'HowTo', 'FAQPage', 'BreadcrumbList']))
    await expect(page.locator('[data-scholar-note]')).toContainText(/local scholar/)
    expect(problems.list).toEqual([])
  })
  test('Bangla twin: Bangla steps and HowTo', async ({ page }) => {
    await page.goto('/bn/learn/wudu')
    await expect(page.locator('h1')).toContainText('অজু')
    await expect(page.locator('[data-wudu-step="face"]')).toContainText('মুখমণ্ডল')
    const howto = (await ldNodes(page, 'HowTo'))[0]
    expect(howto.inLanguage).toBe('bn')
    expect(howto.step[0].text).toMatch(BN)
    expect(await alternates(page)).toEqual({ en: '/learn/wudu', bn: '/bn/learn/wudu', 'x-default': '/learn/wudu' })
  })
})

test.describe('/learn/salah', () => {
  test('rak‘ah table, 13 steps with recitations, Fatiha from the corpus, differences notes, dua links, short surahs', async ({ page, problems }) => {
    await page.goto('/learn/salah')
    const rows = page.locator('[data-rakah-table] tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(page.locator('[data-prayer="maghrib"]')).toContainText('3')
    await expect(page.locator('[data-prayer="isha"]')).toContainText(/Wajib/)
    await expect(page.locator('[data-salah-step]')).toHaveCount(13)
    await expect(page.locator('[data-salah-step="qiyam"] [data-quran-passage="1:1-7"] .quran-text')).toHaveCount(7)
    await expect(page.locator('[data-salah-step="tashahhud"] [data-recitation="tashahhud"]')).toContainText(/At-tahiyyatu lillahi/)
    await expect(page.locator('[data-salah-step="tashahhud"] [data-recitation="tashahhud"] [lang="bn"]').first()).toContainText(BN)
    await expect(page.locator('[data-salah-step="durood"] a[href="/dua/dua-durood-ibrahimiyya"]').first()).toBeVisible()
    await expect(page.locator('#witr a[href="/dua/dua-qunut"]').first()).toBeVisible()
    expect(await page.locator('[data-fiqh-note]').count()).toBeGreaterThanOrEqual(5)
    await expect(page.locator('[data-scholar-note]')).toContainText(/Hanafi/)
    await expect(page.locator('a[data-beginner-surah="112"]')).toHaveAttribute('href', '/surah/al-ikhlas')
    expect(await page.locator('[data-beginner-surah]').count()).toBeGreaterThanOrEqual(8)
    await expect(page.locator('#times a[href="/prayer-times"]')).toBeVisible()
    // hadith citations link into the hadith library
    await expect(page.locator('a[href="/hadith/bukhari/831"]').first()).toBeVisible()
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'HowTo', 'CollectionPage', 'FAQPage', 'BreadcrumbList']))
    const howto = (await ldNodes(page, 'HowTo'))[0]
    expect(howto.step).toHaveLength(13)
    expect(problems.list).toEqual([])
  })
  test('Bangla twin has Bangla table headings, Bangla digits and hreflang', async ({ page }) => {
    await page.goto('/bn/learn/salah')
    await expect(page.locator('h1')).toContainText('নামাজ শিক্ষা')
    await expect(page.locator('[data-rakah-table] thead')).toContainText('ফরজ')
    await expect(page.locator('[data-prayer="fajr"]')).toContainText('২')
    await expect(page.locator('a[data-beginner-surah="112"]')).toHaveAttribute('href', '/bn/surah/al-ikhlas')
    expect(await alternates(page)).toEqual({ en: '/learn/salah', bn: '/bn/learn/salah', 'x-default': '/learn/salah' })
    expect(await canonical(page)).toBe('/bn/learn/salah')
  })
})

test.describe('/learn/arabic-alphabet', () => {
  test('28 letters with four forms, makhraj, a Quran word each, and a working filter', async ({ page, problems }) => {
    await page.goto('/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-letter]')).toHaveCount(28)
    const ba = page.locator('[data-letter="ba"]')
    await expect(ba).toContainText('Ba')
    await expect(ba.locator('[data-form]')).toHaveCount(4)
    await expect(ba.locator('[data-example-word]')).toHaveText(AR)
    await expect(ba.locator('a[href^="/surah/"]').first()).toBeVisible()
    await page.locator('[data-group="shafatan"]').click()
    await expect(page.locator('[data-letter]')).toHaveCount(4) // ba, fa, mim, waw: the lips
    await page.locator('[data-group="all"]').click()
    await expect(page.locator('[data-letter]')).toHaveCount(28)
    expect(await ldTypes(page)).toEqual(expect.arrayContaining(['Article', 'DefinedTermSet', 'FAQPage', 'BreadcrumbList']))
    expect(problems.list).toEqual([])
  })

  test('speech synthesis: the sound button speaks the Arabic name with lang ar-SA when available', async ({ page }) => {
    await page.addInitScript(() => {
      const spoken: { text: string; lang: string }[] = []
      ;(window as any).__spoken = spoken
      ;(window as any).SpeechSynthesisUtterance = function (this: any, text: string) { this.text = text }
      Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [], speak: (u: any) => spoken.push({ text: u.text, lang: u.lang }), cancel() {}, addEventListener() {}, removeEventListener() {} }, configurable: true })
    })
    await page.goto('/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-speak="ba"]').click()
    const spoken = await page.evaluate(() => (window as any).__spoken)
    expect(spoken).toEqual([{ text: 'باء', lang: 'ar-SA' }])
    await expect(page.getByRole('note')).toContainText(/No Arabic voice/)
  })

  test('without speech synthesis the sound buttons are absent but the page still works', async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }) })
    await page.goto('/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-letter]')).toHaveCount(28)
    await expect(page.locator('[data-speak]')).toHaveCount(0)
  })

  test('quiz: start, answer correctly and wrongly, finish a round, restart', async ({ page }) => {
    await page.goto('/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    const quiz = page.locator('[data-alphabet-quiz]')
    await quiz.locator('[data-quiz-start]').click()
    await expect(quiz.locator('[data-quiz-question]')).toBeVisible()
    await expect(quiz.locator('[data-answer]')).toHaveCount(4)
    // exactly one right answer among the options
    await expect(quiz.locator('[data-answer][data-correct="1"]')).toHaveCount(1)
    for (let i = 0; i < 10; i++) {
      const correct = i % 2 === 0
      await quiz.locator(`[data-answer][data-correct="${correct ? 1 : 0}"]`).first().click()
      await expect(quiz.locator('[data-quiz-feedback]')).toContainText(correct ? 'Correct!' : /Not quite/)
      await expect(quiz.locator('[data-answer][data-state="correct"]')).toHaveCount(1)
      await quiz.locator('[data-quiz-next]').click()
    }
    await expect(quiz.locator('[data-quiz-result]')).toContainText('5/10')
    await expect.poll(() => page.evaluate(() => localStorage.getItem('noor-alphabet-best'))).toBe('5')
    await quiz.locator('[data-quiz-restart]').click()
    await expect(quiz.locator('[data-quiz-question]')).toContainText('1/10')
    // other modes
    await quiz.locator('[data-mode="name-letter"]').click()
    await quiz.locator('[data-quiz-start]').click()
    await expect(quiz.locator('[data-quiz-prompt]')).toContainText('?')
    await quiz.locator('[data-mode="form-letter"]').click()
    await quiz.locator('[data-quiz-start]').click()
    await expect(quiz.locator('[data-quiz-prompt]')).toHaveText(/[؀-ۿ]/)
  })

  test('quiz is keyboard operable', async ({ page }) => {
    await page.goto('/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    const quiz = page.locator('[data-alphabet-quiz]')
    await quiz.locator('[data-quiz-start]').focus()
    await page.keyboard.press('Enter')
    await quiz.locator('[data-answer]').first().focus()
    await page.keyboard.press('Enter')
    await expect(quiz.locator('[data-quiz-next]')).toBeFocused()
  })

  test('Arabic UI language shows Arabic letter names and quiz labels', async ({ page }) => {
    await seedStorage(page, { 'quran-store': { state: { language: 'ar' }, version: 0 } })
    await page.goto('/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-letter="ba"] h3')).toHaveText('باء')
    await expect(page.locator('[data-quiz-start]')).toHaveText('ابدأ الاختبار')
  })

  test('Bangla twin: Bangla names and digits', async ({ page }) => {
    await page.goto('/bn/learn/arabic-alphabet')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-letter="ba"] h3')).toHaveText('বা')
    await expect(page.locator('[data-quiz-start]')).toHaveText('কুইজ শুরু করুন')
    expect(await alternates(page)).toEqual({ en: '/learn/arabic-alphabet', bn: '/bn/learn/arabic-alphabet', 'x-default': '/learn/arabic-alphabet' })
  })
})
