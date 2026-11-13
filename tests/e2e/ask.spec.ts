import { test, expect } from './fixtures'

/**
 * Ask the Quran. The server may answer by meaning (model loaded) or fall back to word matching (model not
 * reachable, e.g. hermetic CI) — both must show real ayahs and never an error page.
 */
test.describe('Ask the Quran', () => {
  // the first question of a server instance may load the embedding model (seconds; a download on a cold CI box)
  test.describe.configure({ timeout: 120_000 })

  test('page renders the question box, examples, privacy note and SEO metadata', async ({ page }) => {
    await page.goto('/ask')
    await expect(page).toHaveTitle(/Ask the Quran — Find verses by meaning/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Ask the Quran/)
    await expect(page.getByRole('textbox', { name: /your question/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /patient in hardship/i })).toBeVisible()
    await expect(page.getByText(/your questions are not stored or logged/i)).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/ask$/)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  })

  test('asking a question shows ayah results with Arabic, translation, why-matched and reader links', async ({ page, problems }) => {
    await page.goto('/ask')
    await page.waitForLoadState('networkidle')
    const box = page.getByRole('textbox', { name: /your question/i })
    await box.fill('what does Allah say about people who are patient in hardship?')
    await box.press('Enter')
    await expect(page).toHaveURL(/\/ask\?q=what/)
    const first = page.locator('article[data-ask-ref]').first()
    await expect(first).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText(/^(Search by meaning|Word match)$/)).toBeVisible()
    await expect(first.locator('.quran-text')).toContainText(/[؀-ۿ]{3,}/)
    await expect(first.locator('p[lang="en"]').first()).toContainText(/\w{3,}/)
    await expect(first.getByText(/why this matched/i)).toBeVisible()
    await expect(first.getByRole('link', { name: /read in context/i })).toHaveAttribute('href', /^\/surah\/[a-z-]+#ayah-\d+$/)
    expect(await page.locator('article[data-ask-ref]').count()).toBeGreaterThan(2)
    expect(problems.list).toEqual([])
  })

  test('?q= result URLs are noindex and run the search on load', async ({ page }) => {
    await page.goto('/ask?q=' + encodeURIComponent('verses that comfort a grieving person'))
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.getByRole('textbox', { name: /your question/i })).toHaveValue('verses that comfort a grieving person')
    await expect(page.locator('article[data-ask-ref]').first()).toBeVisible({ timeout: 90_000 })
  })

  test('/bn/ask is Bangla and shows uccharon for Bangla questions', async ({ page }) => {
    await page.goto('/bn/ask?q=' + encodeURIComponent('বাবা-মায়ের সাথে আচরণ নিয়ে কুরআনে কী আছে'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('কুরআনে প্রশ্ন করুন')
    await expect(page).toHaveTitle(/কুরআনে প্রশ্ন করুন/)
    const first = page.locator('article[data-ask-ref]').first()
    await expect(first).toBeVisible({ timeout: 90_000 })
    await expect(first.locator('p[lang="bn"]').last()).toContainText(/[ঀ-৿]{3,}/)
    await expect(page.locator('article[data-ask-ref] [data-tr="bt"]').first()).toContainText(/[ঀ-৿]/)
  })

  test('falls back to word matching with a note when the meaning search is unavailable', async ({ page }) => {
    // simulate the server model being down: answer like /api/ask does in fallback mode
    await page.route('**/api/ask?**', async (route) => {
      const res = await route.fetch()
      const body = await res.json()
      await route.fulfill({ json: { ...body, mode: 'lexical', note: 'unavailable' } })
    })
    await page.goto('/ask?q=' + encodeURIComponent('patience and prayer'))
    await expect(page.getByRole('note')).toContainText(/unavailable right now/i, { timeout: 90_000 })
    await expect(page.getByText('Word match', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /search exact words/i })).toHaveAttribute('href', /\/search\?q=patience/)
  })

  test('command palette offers "Ask the Quran" for question-like queries', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await page.getByPlaceholder(/Search surah/i).fill('how should I treat my parents?')
    const item = page.locator('[cmdk-item]', { hasText: /Ask the Quran: “how should I treat my parents\?”/ })
    await expect(item).toBeVisible()
    await item.click()
    await expect(page).toHaveURL(/\/ask\?q=how%20should%20I%20treat%20my%20parents%3F/)
    await expect(page.locator('article[data-ask-ref]').first()).toBeVisible({ timeout: 90_000 })
  })

  test('single keywords do not show the Ask action', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await page.getByPlaceholder(/Search surah/i).fill('patience')
    await expect(page.locator('[cmdk-item]').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('[cmdk-item]', { hasText: /Ask the Quran:/ })).toHaveCount(0)
  })
})
