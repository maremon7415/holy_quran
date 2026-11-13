import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    // tests/e2e is Playwright's; never let vitest pick it up
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      // `server-only` throws outside the Next.js server bundle; stub it for unit tests
      'server-only': path.resolve(__dirname, 'tests/helpers/server-only.ts'),
    },
  },
})
