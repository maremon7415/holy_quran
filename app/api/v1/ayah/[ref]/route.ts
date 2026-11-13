import { getAyah, TRANSLATION_KEYS, type TranslationKey } from '@/lib/api/corpus'
import { badRequest, json, notFound } from '@/lib/api/http'
import { withRateLimit } from '@/lib/api/ratelimit'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/ayah/2:255 · /api/v1/ayah/2:255-257 · ?translations=saheeh,bangla */
export const GET = withRateLimit(async function GET(req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const { ref } = await ctx.params
  const tp = new URL(req.url).searchParams.get('translations')
  let translations: readonly TranslationKey[] = TRANSLATION_KEYS
  if (tp) {
    const list = tp.split(',').map((s) => s.trim()).filter(Boolean)
    const bad = list.filter((s) => !(TRANSLATION_KEYS as readonly string[]).includes(s))
    if (bad.length) return badRequest(`Unknown translations: ${bad.join(', ')}. Allowed: ${TRANSLATION_KEYS.join(', ')}`)
    translations = list as TranslationKey[]
  }
  const r = await getAyah(ref, translations)
  if ('error' in r) return /Ranges are limited/.test(r.error) ? badRequest(r.error) : notFound(r.error)
  return json(r)
})
