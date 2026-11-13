/** IndexNow (https://www.indexnow.org): keys are 8–128 chars of a-z, A-Z, 0-9 and "-". */
export const INDEXNOW_KEY_RE = /^[a-zA-Z0-9-]{8,128}$/

export function indexNowKey(env: Record<string, string | undefined> = process.env): string | null {
  const k = env.INDEXNOW_KEY?.trim()
  return k && INDEXNOW_KEY_RE.test(k) ? k : null
}
