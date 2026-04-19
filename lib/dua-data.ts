export interface Dua {
  id: string
  category: string
  arabic: string
  transliteration: string
  translation: {
    en: string
    bn: string
  }
  reference: string
}

export async function getAllDuas(): Promise<Dua[]> {
  const res = await fetch('/data/duas.json')
  if (!res.ok) throw new Error('Failed to fetch duas')
  return res.json()
}

export async function getDuasByCategory(category: string): Promise<Dua[]> {
  const duas = await getAllDuas()
  return duas.filter((d) => d.category.toLowerCase() === category.toLowerCase())
}
