export interface Masayel {
  id: string
  category: string
  question: {
    en: string
    bn: string
  }
  answer: {
    en: string
    bn: string
  }
  reference: string
}

export async function getAllMasayel(): Promise<Masayel[]> {
  const res = await fetch('/data/masayel.json')
  if (!res.ok) throw new Error('Failed to fetch masayel')
  return res.json()
}

export async function getMasayelByCategory(category: string): Promise<Masayel[]> {
  const masayel = await getAllMasayel()
  return masayel.filter((m) => m.category.toLowerCase() === category.toLowerCase())
}
