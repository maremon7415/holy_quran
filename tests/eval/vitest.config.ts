import { defineConfig } from 'vitest/config'
import path from 'node:path'

const root = path.resolve(__dirname, '../..')
/** Ask the Quran quality eval with the REAL model (slow, downloads ~118 MB once): `pnpm eval:ask` */
export default defineConfig({
  root,
  test: { include: ['tests/eval/**/*.eval.ts'], testTimeout: 900_000, hookTimeout: 900_000, env: { ASK_REAL_MODEL: '1' } },
  resolve: { alias: { '@': root, 'server-only': path.join(root, 'tests/helpers/server-only.ts') } },
})
