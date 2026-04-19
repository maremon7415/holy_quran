import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan'

export interface PrayerTimeConfig {
  latitude: number
  longitude: number
  method?: keyof typeof CalculationMethod
}

export function getPrayerTimes(config: PrayerTimeConfig, date: Date = new Date()) {
  const coordinates = new Coordinates(config.latitude, config.longitude)
  
  // Default to MuslimWorldLeague if not specified, 
  // though for Bangladesh/South Asia, 'Karachi' is often used.
  // The 'adhan' library uses TitleCase keys like: MuslimWorldLeague, Karachi, UmmAlQura, etc.
  const methodFn = CalculationMethod[config.method || 'Karachi']
  const params = methodFn ? methodFn() : CalculationMethod.Karachi()
  
  return new PrayerTimes(coordinates, date, params)
}
