import { resolveCity } from './cities'
import { monthDiff, parseMonthKey } from './export'
import { cityToday } from './times'

/** Months (relative to the current month in the city's own calendar) that may be requested. */
export const MONTH_RANGE = 12

/** Validates `/prayer-times/{city}/{yyyy-mm}`: known city, real month, within ±12 months. Returns null (→ 404) otherwise. */
export function resolveMonth(citySlug: string, month: string, now = Date.now()) {
  const city = resolveCity(citySlug)
  const ym = parseMonthKey(month)
  if (!city || !ym) return null
  const t = cityToday(city, now)
  if (Math.abs(monthDiff({ y: t.y, m: t.m }, ym)) > MONTH_RANGE) return null
  return { city, ...ym, today: t }
}
