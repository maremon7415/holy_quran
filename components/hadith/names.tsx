import { T } from '@/lib/i18n/text'
import { collectionMeta } from '@/lib/hadith/collections'
import type { Locale } from '@/lib/i18n/routes'

/** Collection name in the page locale (English pages follow the UI language: English / Arabic). */
export function CName({ slug, locale }: { slug: string; locale: Locale }) {
  const m = collectionMeta(slug)
  if (!m) return <>{slug}</>
  return locale === 'bn' ? <>{m.name.bn}</> : <T en={m.name.en} bn={m.name.bn} ar={m.name.ar} />
}
