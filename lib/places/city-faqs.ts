import { bnGenitive, cityTitle, compassPoint, METHOD_NAMES, type City } from './cities'
import { bnDigits, fmtClock, fmtDate, type CityDay } from './times'
import type { Locale } from '@/lib/i18n/routes'

const num = (locale: Locale, v: number | string) => (locale === 'bn' ? bnDigits(v) : String(v))

/** FAQ entries for a city on one day (pure: also re-run in the browser when the page is older than the city's date). */
export function faqsFor(city: City, day: CityDay, locale: Locale, qibla: { bearing: number; distanceKm: number }) {
  const t = (ms: number) => fmtClock(ms, city.tz, locale)
  const name = cityTitle(city, locale)
  const date = fmtDate(day.ymd, locale)
  const m = METHOD_NAMES[city.method]
  const asr = city.madhab === 'hanafi'
  const km = Math.round(qibla.distanceKm).toLocaleString('en-US')
  if (locale === 'bn') {
    const g = bnGenitive(name)
    return [
      { q: `আজ ${g} ফজরের নামাজের সময় কখন?`, a: `${date} তারিখে ${g} ফজরের ওয়াক্ত শুরু হবে ${t(day.fajr)}-এ এবং সূর্যোদয় ${t(day.sunrise)}-এ ফজরের ওয়াক্ত শেষ হবে।` },
      { q: `আজ ${g} ইফতারের (মাগরিব) সময় কখন?`, a: `${date} তারিখে ${g} সূর্যাস্ত ও মাগরিবের ওয়াক্ত শুরু ${t(day.maghrib)}-এ। রোজাদার এই সময়ে ইফতার করবেন।` },
      { q: `${g} সেহরির শেষ সময় আজ কখন?`, a: `হিসাব অনুযায়ী সেহরির শেষ সময় ফজরের ওয়াক্ত শুরুর সময় অর্থাৎ ${t(day.fajr)}। কিছু স্থানীয় সময়সূচিতে সতর্কতাবশত কয়েক মিনিট আগে সেহরি শেষ করার কথা বলা হয়; আমরা কোনো বাড়তি সময় যোগ করিনি।` },
      { q: `আসরের সময় কখন — হানাফি নাকি শাফেয়ি?`, a: `${g} আজ হানাফি মাযহাব অনুযায়ী আসরের ওয়াক্ত শুরু ${t(day.asrHanafi)}-এ এবং শাফেয়ি/স্ট্যান্ডার্ড হিসাবে ${t(day.asrStandard)}-এ।` },
      { q: `এই সময়সূচি কোন পদ্ধতিতে হিসাব করা হয়েছে?`, a: `${m.bn} পদ্ধতিতে, ${asr ? 'হানাফি আসর সহ' : 'স্ট্যান্ডার্ড আসর সহ'}। অবস্থান: ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°। স্থানীয় মসজিদের সময়সূচি কয়েক মিনিট আলাদা হতে পারে। /prayer-times পাতা থেকে পদ্ধতি বদলানো যায়।` },
      { q: `${g} থেকে কিবলার দিক কোনটি?`, a: `${g} থেকে কাবার দিক উত্তর থেকে ঘড়ির কাঁটার দিকে ${num(locale, qibla.bearing.toFixed(1))}° (${compassPoint(qibla.bearing, 'bn')}), দূরত্ব প্রায় ${num(locale, km)} কিলোমিটার।` },
    ]
  }
  return [
    { q: `What time is Fajr in ${name} today?`, a: `On ${date}, Fajr in ${name} begins at ${t(day.fajr)} and lasts until sunrise at ${t(day.sunrise)}.` },
    { q: `What time is Maghrib and iftar in ${name} today?`, a: `On ${date}, sunset and the start of Maghrib in ${name} is at ${t(day.maghrib)}. A fasting person breaks the fast (iftar) at this time.` },
    { q: `What is the sehri end time in ${name} today?`, a: `By calculation, sehri ends when Fajr begins: ${t(day.fajr)} on ${date}. Some local timetables end sehri a few minutes earlier as a precaution; no margin is added here.` },
    { q: `When is Asr in ${name} — Hanafi or Shafi’i?`, a: `Today in ${name}, Asr starts at ${t(day.asrHanafi)} by the Hanafi reckoning (shadow twice the object’s height) and at ${t(day.asrStandard)} by the Shafi’i/Maliki/Hanbali reckoning.` },
    { q: `Which calculation method are these prayer times based on?`, a: `${m.en}, with ${asr ? 'Hanafi' : 'standard (Shafi’i)'} Asr as the regional default, for coordinates ${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}° (${city.tz}).${city.country === 'GB' ? ' Mosques in the UK use different conventions, so check your local mosque timetable.' : ' Your local mosque may differ by a few minutes.'} You can change the method and madhab on the main prayer times page.` },
    { q: `What is the Qibla direction in ${name}?`, a: `From ${name} the Kaaba lies at ${qibla.bearing.toFixed(1)}° clockwise from true north (${compassPoint(qibla.bearing)}), about ${km} km away.` },
  ]
}
