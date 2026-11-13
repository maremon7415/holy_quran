import { defineConfig, devices } from '@playwright/test'

/**
 * Local:  E2E_BASE_URL defaults to the dev server at http://localhost:3100 (start it yourself).
 * CI:     CI=1 → Playwright starts `pnpm build && pnpm start -p 3000` via `webServer` and tests that
 *          (set E2E_SKIP_BUILD=1 when an earlier workflow step already ran `pnpm build`).
 * Browser: preinstalled chromium can be pointed to with PW_CHROMIUM_PATH (e.g. /opt/pw-browsers/chromium).
 */
const CI = !!process.env.CI
const baseURL = process.env.E2E_BASE_URL || (CI ? 'http://localhost:3000' : 'http://localhost:3100')
const executablePath = process.env.PW_CHROMIUM_PATH || undefined

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : CI ? 2 : 4,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: CI ? [['list'], ['html', { open: 'never' }], ['github']] : [['list']],
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer:
    CI && !process.env.E2E_BASE_URL
      ? {
          command: process.env.E2E_SKIP_BUILD ? 'pnpm start -p 3000' : 'pnpm build && pnpm start -p 3000',
          url: 'http://localhost:3000',
          timeout: 600_000,
          reuseExistingServer: false,
          env: { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://noor.example.test' },
        }
      : undefined,
})
