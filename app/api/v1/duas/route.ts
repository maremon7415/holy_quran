import { findDuas, listDuaCategories } from '@/lib/api/corpus'
import { badRequest, intParam, json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/duas?q=anxiety&category=sleep&limit=20 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const category = sp.get('category') ?? undefined
  const cats = listDuaCategories()
  if (category && !cats.some((c) => c.id === category)) return badRequest(`Unknown category. Allowed: ${cats.map((c) => c.id).join(', ')}`)
  const q = sp.get('q') ?? undefined
  const res = await findDuas(q, { category, limit: intParam(sp.get('limit'), q ? 10 : 50, 1, 50) })
  return json({ ...res, categories: cats })
}
