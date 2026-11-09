import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { AyahCard } from '@/components/content/ayah-card'
import { Faq } from '@/components/content/faq'
import { pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { ShareButton } from '@/components/content/copy-button'
import { asmaUlHusna, asmaBySlug } from '@/data/content/asma-ul-husna'
import { getVersesByRefs } from '@/lib/quran/data'
import { refLabel } from '@/lib/content/resolve'
import { articleLd, buildMeta, clip } from '@/lib/content/seo'
import { toBanglaDigits } from '@/lib/quran/chapters'

type P = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export const generateStaticParams = () => asmaUlHusna.map((n) => ({ slug: n.slug }))

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params
  const n = asmaBySlug(slug)
  if (!n) return {}
  return buildMeta({
    title: `${n.tl} (${n.ar}) — Meaning of the Name of Allah | ${n.tlBn} অর্থ`,
    description: clip(`${n.tl} (${n.ar}) means “${n.en}”. ${n.expEn} Name ${n.n} of the 99 Names of Allah, with Quran reference. ${n.tlBn} অর্থ: ${n.bn}।`, 165),
    path: `/names-of-allah/${n.slug}`,
    type: 'article',
    keywords: [`${n.tl} meaning`, `${n.tl} name of Allah`, `${n.tl} ${n.ar}`, `${n.tlBn} অর্থ`, `${n.tlBn} আল্লাহর নাম`, '99 names of Allah'],
  })
}

export default async function NamePage({ params }: P) {
  const { slug } = await params
  const n = asmaBySlug(slug)
  if (!n) notFound()
  const [verse] = await getVersesByRefs([n.ref])
  const idx = n.n - 1
  const prev = asmaUlHusna[(idx + 98) % 99]
  const next = asmaUlHusna[(idx + 1) % 99]
  const path = `/names-of-allah/${n.slug}`
  const faqs = [
    { q: `What does ${n.tl} mean?`, a: `${n.tl} (${n.ar}) means “${n.en}”. ${n.expEn}` },
    { q: `${n.tlBn} এর অর্থ কী?`, a: `${n.tlBn} (${n.ar}) অর্থ “${n.bn}”। ${n.expBn}` },
    { q: n.attr ? `Where is the attribute of ${n.tl} found in the Quran?` : `Where is ${n.tl} mentioned in the Quran?`, a: n.attr ? `The name ${n.tl} is included in the traditional list of 99 names; its attribute can be seen in ${refLabel(n.ref)}: “${verse.en}”` : `The name appears, for example, in ${refLabel(n.ref)}: “${verse.en}”` },
    { q: `Which number is ${n.tl} among the 99 Names?`, a: `${n.tl} is number ${n.n} in the commonly used list of the 99 Names of Allah.` },
  ]
  return (
    <div className={pageShell}>
      <JsonLd data={articleLd({ headline: `${n.tl} (${n.ar}) – Meaning of the Name of Allah`, description: `${n.tl} means ${n.en}. ${n.expEn}`, path, about: n.tl })} />
      <Breadcrumbs items={[{ name: '99 Names of Allah', href: '/names-of-allah' }, { name: n.tl, href: path }]} className="mb-4" />

      <section className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-accent via-card to-gold-soft/50 px-5 py-10 text-center sm:py-14">
        <div aria-hidden className="bg-pattern absolute inset-0 -z-10 [mask-image:radial-gradient(circle,#000,transparent_72%)]" />
        <span className="inline-grid size-10 place-items-center rounded-full bg-card/80 text-sm font-bold text-primary">{n.n}</span>
        <p lang="ar" dir="rtl" className="font-arabic text-gradient-gold mt-2 text-[clamp(4rem,16vw,8rem)] leading-[1.5]">{n.ar}</p>
        <h1 className="font-display text-3xl font-semibold sm:text-5xl">{n.tl}</h1>
        <p className="font-bangla mt-1 text-xl text-gold">{n.tlBn}</p>
        <p className="mx-auto mt-5 max-w-xl text-lg">{n.en}</p>
        <p lang="bn" className="font-bangla mx-auto mt-1 max-w-xl text-lg text-muted-foreground">{n.bn}</p>
        <div className="mt-6 flex justify-center"><ShareButton title={`${n.tl} – Name of Allah`} path={path} /></div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Reveal><section className="card-soft h-full rounded-3xl p-5">
          <h2 className="text-sm font-semibold">Explanation</h2>
          <p className="mt-2 text-[15px] leading-relaxed">{n.expEn}</p>
        </section></Reveal>
        <Reveal delay={0.05}><section className="card-soft h-full rounded-3xl p-5">
          <h2 className="text-sm font-semibold">ব্যাখ্যা</h2>
          <p lang="bn" className="font-bangla mt-2 text-[15px] leading-relaxed">{n.expBn}</p>
        </section></Reveal>
      </div>

      <section className="mt-10" aria-labelledby="ref-h">
        <h2 id="ref-h" className="font-display mb-1 text-2xl font-semibold">{n.attr ? 'Related verse' : 'In the Quran'} <span className="font-bangla text-lg font-medium text-muted-foreground">· {n.attr ? 'সংশ্লিষ্ট আয়াত' : 'কুরআনে'}</span></h2>
        {n.attr && <p className="mb-3 text-sm text-muted-foreground">This verse shows the attribute behind the name; the name itself is part of the traditional list of 99 names. · এই আয়াতে নামটির গুণ প্রকাশ পেয়েছে; নামটি ঐতিহ্যবাহী ৯৯ নামের তালিকাভুক্ত।</p>}
        <AyahCard verse={verse} />
      </section>

      <Faq faqs={faqs} />

      <nav aria-label="Previous and next Name" className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href={`/names-of-allah/${prev.slug}`} className="card-soft lift rounded-3xl p-4"><span className="text-xs text-muted-foreground">← {prev.n}</span><span className="mt-1 flex items-baseline justify-between"><span className="font-semibold">{prev.tl}</span><span lang="ar" className="font-arabic text-2xl">{prev.ar}</span></span></Link>
        <Link href={`/names-of-allah/${next.slug}`} className="card-soft lift rounded-3xl p-4"><span className="text-xs text-muted-foreground">{next.n} →</span><span className="mt-1 flex items-baseline justify-between"><span className="font-semibold">{next.tl}</span><span lang="ar" className="font-arabic text-2xl">{next.ar}</span></span></Link>
      </nav>
      <p className="mt-6 text-center text-xs text-muted-foreground"><Link href="/names-of-allah" className="font-semibold text-primary hover:underline">← All 99 Names · {toBanglaDigits(99)} নাম</Link></p>
    </div>
  )
}
