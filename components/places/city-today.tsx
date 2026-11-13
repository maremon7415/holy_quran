'use client'
import { useEffect, useState } from 'react'
import { FaqList } from '@/components/content/faq-list'
import type { City } from '@/lib/places/cities'
import { faqsFor } from '@/lib/places/city-faqs'
import { cityDay, fmtDate, ymdKey, zonedYmd, type CityDay } from '@/lib/places/times'
import { fmtHijri, hijriOf } from '@/lib/places/hijri'
import type { Locale } from '@/lib/i18n/routes'
import { PrayerGrid, SehriIftar } from './city-ui'

type CityLike = Pick<City, 'tz' | 'madhab' | 'lat' | 'lng' | 'method'>

/**
 * The prayer day for "today" in the city's own zone.
 * The first render (server and hydration) uses `days[0]` — the day the page was rendered for — so there is no
 * hydration mismatch; after mount, every 30 s and when the tab becomes visible again, it switches to the matching entry
 * of `days` (the server rendered a few days ahead) — or computes it in the browser when the cached page is older than that.
 * ISR can serve a page rendered before the city's midnight, which would otherwise show yesterday.
 */
export function useTodayDay(days: CityDay[], city: CityLike): CityDay {
  const [day, setDay] = useState<CityDay>(days[0])
  const { tz, lat, lng, method, madhab } = city
  useEffect(() => {
    const update = () => {
      const ymd = zonedYmd(Date.now(), tz)
      const key = ymdKey(ymd)
      const hit = days.find((d) => d.date === key) ?? cityDay({ lat, lng, method, madhab }, ymd)
      setDay((cur) => (cur.date === key ? cur : hit))
    }
    update()
    const id = setInterval(update, 30_000)
    document.addEventListener('visibilitychange', update)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', update) }
  }, [days, tz, lat, lng, method, madhab])
  return day
}

export function TodayPrayerGrid({ city, days, locale }: { city: CityLike; days: CityDay[]; locale: Locale }) {
  return <PrayerGrid city={city} day={useTodayDay(days, city)} locale={locale} />
}

export function TodaySehriIftar({ city, days, locale }: { city: CityLike; days: CityDay[]; locale: Locale }) {
  return <SehriIftar city={city} day={useTodayDay(days, city)} locale={locale} />
}

/** "Friday, 13 November 2026 · 2 Jumada al-Awwal 1448 AH" under the page title. */
export function TodayHeroDate({ city, days, locale }: { city: CityLike; days: CityDay[]; locale: Locale }) {
  const d = useTodayDay(days, city)
  return <span data-testid="today-date">{fmtDate(d.ymd, locale, { weekday: true })} · {fmtHijri(hijriOf(d.ymd), locale)}</span>
}

/** FAQ answers quote today's times and date, so they follow the same swap. */
export function TodayFaqItems({ city, days, locale, qibla }: { city: City; days: CityDay[]; locale: Locale; qibla: { bearing: number; distanceKm: number } }) {
  return <FaqList faqs={faqsFor(city, useTodayDay(days, city), locale, qibla)} />
}
