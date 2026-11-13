import type { HadithProvider } from './extensions'
import { hadithMcpProvider } from '@/lib/hadith/api'

/**
 * Wire optional providers here. When the hadith library (lib/hadith) is ready, export an
 * object implementing `HadithProvider` from it and assign it below, e.g.
 *
 *   import { hadithMcpProvider } from '@/lib/hadith/mcp'
 *   export const hadithProvider: HadithProvider | null = hadithMcpProvider
 *
 * `get_hadith` / `search_hadith` then appear in tools/list automatically.
 */
export const hadithProvider: HadithProvider | null = hadithMcpProvider
