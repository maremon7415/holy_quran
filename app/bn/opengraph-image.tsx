import { ogContentType, ogSize } from '@/lib/content/og'
import { ogHome } from '@/lib/content/og-pages'

export const alt = 'নূর কুরআন: পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন'
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogHome('bn')
}
