import type { Metadata } from 'next'

/**
 * Search-console verification tags from env (all optional):
 *   GOOGLE_SITE_VERIFICATION → <meta name="google-site-verification">
 *   BING_SITE_VERIFICATION   → <meta name="msvalidate.01">   (Bing Webmaster Tools; Bing powers ChatGPT search & Copilot)
 *   YANDEX_VERIFICATION      → <meta name="yandex-verification">
 */
export function verificationMeta(env: Record<string, string | undefined> = process.env): Metadata['verification'] | undefined {
  const google = env.GOOGLE_SITE_VERIFICATION?.trim()
  const bing = env.BING_SITE_VERIFICATION?.trim()
  const yandex = env.YANDEX_VERIFICATION?.trim()
  if (!google && !bing && !yandex) return undefined
  return { ...(google ? { google } : {}), ...(yandex ? { yandex } : {}), ...(bing ? { other: { 'msvalidate.01': bing } } : {}) }
}
