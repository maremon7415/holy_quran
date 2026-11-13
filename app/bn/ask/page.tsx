import type { Metadata } from 'next'
import { AskPage, askMeta } from '@/components/pages/ask'

type SP = Promise<{ q?: string | string[] }>
const one = (v?: string | string[]) => ((Array.isArray(v) ? v[0] : v) ?? '').trim().slice(0, 300)

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  return askMeta('bn', one((await searchParams).q))
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  return <AskPage locale="bn" q={one((await searchParams).q)} />
}
