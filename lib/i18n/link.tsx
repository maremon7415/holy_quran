'use client'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useLocalizedHref } from './locale-context'

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string }

/** next/link that keeps the user inside /bn when a Bangla twin of the target exists. */
export function LocalizedLink({ href, ...rest }: Props) {
  const loc = useLocalizedHref()
  return <Link href={loc(href)} {...rest} />
}
export default LocalizedLink
