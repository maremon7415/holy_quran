'use client'
import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { useTx } from '@/lib/lang'

type Tr = { en: string; bn?: string; ar?: string }

/** A landmark/element whose `aria-label` follows the UI language (usable from server components). */
export function Labelled<E extends ElementType = 'div'>({ as, label, ...rest }: { as?: E; label: Tr } & Omit<ComponentPropsWithoutRef<E>, 'aria-label'>) {
  const t = useTx()
  const Tag = (as ?? 'div') as ElementType
  return <Tag aria-label={t(label)} {...rest} />
}

/** Visually hidden text in the UI language. */
export function Sr({ en, bn, ar }: Tr) {
  const t = useTx()
  return <span className="sr-only">{t({ en, bn, ar })}</span>
}

/** Element with a localized `title` tooltip. */
export function Titled<E extends ElementType = 'span'>({ as, label, ...rest }: { as?: E; label: Tr } & Omit<ComponentPropsWithoutRef<E>, 'title'>) {
  const t = useTx()
  const Tag = (as ?? 'span') as ElementType
  return <Tag title={t(label)} {...rest} />
}
