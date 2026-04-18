import axios from 'axios'

const API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1'
const cache = new Map<string, any>()

export interface Surah {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

export interface Ayah {
  number: number
  text: string
  numberInSurah: number
  juz: number
  manzil: number
  page: number
  ruku: number
  hizbQuarter: number
  sajdah: boolean
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[]
}

async function fetchWithFallback(url: string) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    // Try minified version as fallback
    const minUrl = url.replace('.json', '.min.json')
    try {
      const response = await axios.get(minUrl)
      return response.data
    } catch {
      console.error(`Failed to fetch from both ${url} and ${minUrl}`)
      throw error
    }
  }
}

export async function getAllSurahs(): Promise<Surah[]> {
  const cacheKey = 'all-surahs'
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const data = await fetchWithFallback(`${API_BASE}/info.json`)
  const surahs = data.chapters.map((chapter: any) => ({
    number: chapter.chapter,
    name: chapter.arabicname,
    englishName: chapter.name,
    englishNameTranslation: chapter.englishname,
    numberOfAyahs: chapter.verses.length,
    revelationType: chapter.revelation,
  }))
  cache.set(cacheKey, surahs)
  return surahs
}

export async function getSurahTranslation(
  surahNumber: number,
  language: 'en' | 'ar' | 'bn' = 'en'
): Promise<any> {
  const translationMap: Record<string, string> = {
    en: 'eng-ummmuhammad',
    ar: 'ara-kingfahadquranc',
    bn: 'ben-muhiuddinkhan',
  }

  const translation = translationMap[language]
  const cacheKey = `surah-${surahNumber}-${language}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    const data = await fetchWithFallback(
      `${API_BASE}/editions/${translation}/${surahNumber}.json`
    )
    
    // Transform to expected old API format
    const result = {
      ayahs: data.chapter.map((v: any) => ({
        number: v.verse,
        text: v.text,
      }))
    }
    cache.set(cacheKey, result)
    return result
  } catch (error) {
    console.error(`Failed to fetch translation for surah ${surahNumber}`, error)
    return null
  }
}

export interface SearchResult {
  surahNumber: number
  surahName: string
  surahEnglishName: string
  ayahNumber: number
  text: string
}

export async function getAllSurahTranslations(
  language: 'en' | 'bn'
): Promise<Map<number, { ayahs: Array<{ number: number; text: string }> }>> {
  const translationMap: Record<string, string> = {
    en: 'eng-ummmuhammad',
    bn: 'ben-muhiuddinkhan',
  }
  const translation = translationMap[language]
  const cacheKey = `all-${language}-translations`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const result = new Map<number, any>()

  try {
    const promises = []
    for (let i = 1; i <= 114; i++) {
      promises.push(
        fetchWithFallback(`${API_BASE}/editions/${translation}/${i}.json`)
          .then(data => ({ surah: i, data }))
          .catch(() => null)
      )
    }

    const responses = await Promise.all(promises)
    responses.forEach((response) => {
      if (response?.data?.chapter) {
        result.set(response.surah, {
          ayahs: response.data.chapter.map((v: any) => ({
            number: v.verse,
            text: v.text,
          })),
        })
      }
    })

    cache.set(cacheKey, result)
    return result
  } catch (error) {
    console.error('Failed to fetch all translations', error)
    return result
  }
}

export async function searchTranslations(
  query: string,
  language: 'en' | 'bn' = 'en'
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const allTranslations = await getAllSurahTranslations(language)
  const results: SearchResult[] = []
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
  const surahInfoCache = new Map<number, { name: string; englishName: string }>()

  for (const [surahNumber, translationData] of allTranslations) {
    if (!translationData?.ayahs) continue

    const surahInfo = surahInfoCache.get(surahNumber)
    if (!surahInfo) {
      const infoData = await fetchWithFallback(`${API_BASE}/info.json`)
      const chapter = infoData.chapters.find((c: any) => c.chapter === surahNumber)
      if (chapter) {
        const info = {
          name: chapter.arabicname,
          englishName: chapter.name,
        }
        surahInfoCache.set(surahNumber, info)
      }
    }
    const cachedSurahInfo = surahInfoCache.get(surahNumber)

    for (const ayah of translationData.ayahs) {
      const textLower = ayah.text.toLowerCase()
      const matches = searchTerms.every(term => textLower.includes(term))

      if (matches && cachedSurahInfo) {
        results.push({
          surahNumber,
          surahName: cachedSurahInfo.name,
          surahEnglishName: cachedSurahInfo.englishName,
          ayahNumber: ayah.number,
          text: ayah.text,
        })
      }
    }
  }

  return results.slice(0, 50)
}

export async function getSurahDetails(surahNumber: number): Promise<SurahDetail | null> {
  const cacheKey = `surah-detail-${surahNumber}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  try {
    // We need info for metadata and ara-quranuthmani for text
    const infoData = await fetchWithFallback(`${API_BASE}/info.json`)
    const chapterInfo = infoData.chapters.find((c: any) => c.chapter === surahNumber)
    
    if (!chapterInfo) return null

    const data = await fetchWithFallback(`${API_BASE}/editions/ara-kingfahadquranc/${surahNumber}.json`)
    
    const ayahs = data.chapter.map((v: any, index: number) => {
      const meta = chapterInfo.verses[index] || {}
      return {
        number: v.verse,
        text: v.text,
        numberInSurah: v.verse,
        juz: meta.juz || 0,
        manzil: meta.manzil || 0,
        page: meta.page || 0,
        ruku: meta.ruku || 0,
        hizbQuarter: meta.maqra || 0,
        sajdah: meta.sajda || false,
      }
    })

    const result = {
      number: chapterInfo.chapter,
      name: chapterInfo.arabicname,
      englishName: chapterInfo.name,
      englishNameTranslation: chapterInfo.englishname,
      numberOfAyahs: chapterInfo.verses.length,
      revelationType: chapterInfo.revelation,
      ayahs,
    }

    cache.set(cacheKey, result)
    return result
  } catch (error) {
    console.error(`Failed to fetch surah details for ${surahNumber}`, error)
    return null
  }
}
