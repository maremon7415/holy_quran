import { search } from '@/lib/api/corpus'
import { badRequest, intParam, json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/search?q=patience&limit=10&lang=en|bn|ar */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const q = (sp.get('q') ?? '').trim()
  if (q.length < 2) return badRequest('Query parameter "q" is required (at least 2 characters).')
  if (q.length > 200) return badRequest('Query is too long (max 200 characters).')
  const lang = sp.get('lang')
  if (lang && !['en', 'bn', 'ar'].includes(lang)) return badRequest('lang must be en, bn or ar.')
  return json(await search(q, intParam(sp.get('limit'), 10, 1, 50), (lang as 'en' | 'bn' | 'ar' | null) ?? undefined))
}
