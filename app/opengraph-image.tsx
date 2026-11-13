import { ogContentType, ogSize } from '@/lib/content/og'
import { ogHome } from '@/lib/content/og-pages'
import { site } from '@/lib/site'

export const alt = `${site.name}: ${site.tagline}`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogHome('en')
}
