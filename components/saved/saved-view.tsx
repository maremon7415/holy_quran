'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from '@/lib/i18n/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { chapters, readerHref, surahHref, surahNamesBn, toArabicDigits } from '@/lib/quran/chapters'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'
import { duas as allDuas, duaCategories } from '@/data/content/duas'

interface VerseText { ar: string; en?: string; bn?: string }
type Tab = 'ayahs' | 'surahs' | 'duas' | 'notes'

function Empty({ icon, title, body, href, cta }: { icon: string; title: string; body: string; href: string; cta: string }) {
  return (
    <div className="card-soft relative overflow-hidden p-10 text-center">
      <div aria-hidden className="bg-pattern absolute inset-0 opacity-50" />
      <div className="relative">
        <UiIcon name={icon} size={80} className="mx-auto" />
        <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
        <Link href={href} className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 active:scale-[0.98]">{cta}</Link>
      </div>
    </div>
  )
}

export function SavedView() {
  const mounted = useMounted()
  const t = useTx()
  const lang = useLang()
  const { importantAyahs, favoriteSurahs, bookmarkedDuas, removeImportantAyah, updateImportantAyah, toggleFavoriteSurah, toggleDuaBookmark } = useAppStore()
  const [tab, setTab] = useState<Tab>('ayahs')
  const [texts, setTexts] = useState<Record<string, VerseText>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const keys = useMemo(() => importantAyahs.map((a) => `${a.surahNumber}:${a.ayahNumber}`), [importantAyahs])
  useEffect(() => {
    let dead = false
    keys.filter((k) => !texts[k]).forEach(async (k) => {
      try {
        const r = await fetch(`https://api.quran.com/api/v4/verses/by_key/${k}?fields=text_uthmani&translations=20,161`)
        const j = await r.json()
        const v = j.verse
        if (!v || dead) return
        const tr = (id: number) => (v.translations as { resource_id: number; text: string }[] | undefined)?.find((x) => x.resource_id === id)?.text?.replace(/<[^>]+>/g, '')
        setTexts((s) => ({ ...s, [k]: { ar: v.text_uthmani, en: tr(20), bn: tr(161) } }))
      } catch { /* show reference only */ }
    })
    return () => { dead = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(',')])

  // Bookmarks store dua slugs (current data); very old installs stored numeric ids from the legacy list — drop those.
  useEffect(() => {
    if (!mounted) return
    const stale = bookmarkedDuas.filter((id) => /^\d+$/.test(id))
    stale.forEach((id) => toggleDuaBookmark(id))
  }, [mounted, bookmarkedDuas, toggleDuaBookmark])

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 pb-32 pt-8"><div className="card-soft h-96 shimmer" /></div>

  const notes = importantAyahs.filter((a) => a.note?.trim())
  const savedDuas = allDuas.filter((d) => bookmarkedDuas.includes(d.slug))
  const tabs: { id: Tab; en: string; bn: string; ar?: string; n: number; icon: string }[] = [
    { id: 'ayahs', en: 'Ayahs', bn: 'আয়াত', ar: 'الآيات', n: importantAyahs.length, icon: 'quran' },
    { id: 'surahs', en: 'Surahs', bn: 'সূরা', ar: 'السور', n: favoriteSurahs.length, icon: 'heart' },
    { id: 'duas', en: 'Duas', bn: 'দোয়া', ar: 'الأدعية', n: savedDuas.length, icon: 'dua' },
    { id: 'notes', en: 'Notes', bn: 'নোট', ar: 'الملاحظات', n: notes.length, icon: 'note' },
  ]
  const nf = (n: number) => (lang === 'bn' ? String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]) : String(n))
  const sName = (id: number) => (lang === 'bn' ? surahNamesBn[id - 1] : lang === 'ar' ? chapters[id - 1].nameArabic : chapters[id - 1].nameSimple)
  const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, scale: 0.97 }, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } }

  const renderAyah = (a: (typeof importantAyahs)[number], withNote?: boolean) => {
    const k = `${a.surahNumber}:${a.ayahNumber}`
    const v = texts[k]
    const isEdit = editing === k
    return (
      <motion.article layout key={k} {...fade} className="card-soft lift p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href={readerHref(a.surahNumber, a.ayahNumber)} className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold transition hover:opacity-80">{sName(a.surahNumber)} · {nf(a.surahNumber)}:{nf(a.ayahNumber)}</Link>
          <div className="flex items-center gap-1">
            <Link href={surahHref(a.surahNumber, a.ayahNumber)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-accent">{t({ en: 'Tafsir', bn: 'তাফসীর', ar: 'التفسير' })}</Link>
            <button aria-label={t({ en: 'Remove', bn: 'মুছুন', ar: 'إزالة' })} onClick={() => removeImportantAyah(a.surahNumber, a.ayahNumber)} className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
        </div>
        {v ? (
          <div className="mt-4 space-y-2">
            <p dir="rtl" lang="ar" className="quran-text text-right text-[1.6rem]">{v.ar} <span className="ayah-marker">{toArabicDigits(a.ayahNumber)}</span></p>
            {lang === 'bn' ? (v.bn && <p lang="bn" className="font-bangla text-sm leading-relaxed text-muted-foreground">{v.bn}</p>) : (v.en && <p className="text-sm leading-relaxed text-muted-foreground">{v.en}</p>)}
          </div>
        ) : <div className="mt-4 h-16 rounded-2xl shimmer" aria-hidden />}
        {a.tags?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{a.tags.map((x) => <span key={x} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground">#{x}</span>)}</div>}
        {isEdit ? (
          <div className="mt-3">
            <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder={t({ en: 'Write a note…', bn: 'নোট লিখুন…', ar: 'اكتب ملاحظة…' })} className="w-full rounded-2xl border bg-background p-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-accent">{t({ en: 'Cancel', bn: 'বাতিল', ar: 'إلغاء' })}</button>
              <button onClick={() => { updateImportantAyah(a.surahNumber, a.ayahNumber, { note: draft.trim() }); setEditing(null) }} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t({ en: 'Save', bn: 'সংরক্ষণ', ar: 'حفظ' })}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setEditing(k); setDraft(a.note ?? '') }} className={cn('mt-3 flex w-full items-start gap-2 rounded-2xl p-3 text-start text-sm transition', a.note ? 'bg-gold-soft/60' : withNote ? 'hidden' : 'border border-dashed text-muted-foreground hover:border-primary/40')}>
            <UiIcon name="note" size={20} />
            <span>{a.note || t({ en: 'Add a note', bn: 'নোট যোগ করুন', ar: 'أضف ملاحظة' })}</span>
          </button>
        )}
      </motion.article>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      <div className="mb-5 flex items-center gap-4">
        <UiIcon name="bookmark" size={56} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t({ en: 'Your library', bn: 'আপনার সংগ্রহ', ar: 'مكتبتك' })}</p>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: 'Saved', bn: 'সংরক্ষিত', ar: 'المحفوظات' })}</h1>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {tabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)} className={cn('flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition active:scale-95', tab === x.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/40')}>
            <UiIcon name={x.icon} size={20} /> {t({ en: x.en, bn: x.bn, ar: x.ar })}
            <span className={cn('rounded-full px-2 text-xs', tab === x.id ? 'bg-primary-foreground/20' : 'bg-surface-2 text-muted-foreground')}>{nf(x.n)}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {tab === 'ayahs' && (importantAyahs.length
            ? importantAyahs.map((a) => renderAyah(a))
            : <Empty key="e1" icon="bookmark" title={t({ en: 'No saved ayahs yet', bn: 'এখনো কোনো আয়াত সংরক্ষিত নেই', ar: 'لا توجد آيات محفوظة بعد' })} body={t({ en: 'Tap the bookmark on any ayah while reading to keep it here with a note.', bn: 'পড়ার সময় যেকোনো আয়াতে বুকমার্ক ট্যাপ করুন; নোটসহ এখানে থাকবে।', ar: 'اضغط على علامة الحفظ عند أي آية أثناء القراءة لتحتفظ بها هنا مع ملاحظة.' })} href="/quran" cta={t({ en: 'Start reading', bn: 'পড়া শুরু করুন', ar: 'ابدأ القراءة' })} />)}

          {tab === 'surahs' && (favoriteSurahs.length ? (
            <div key="s" className="grid gap-3 sm:grid-cols-2">
              {favoriteSurahs.map((id) => (
                <motion.div layout key={id} {...fade} className="card-soft lift flex items-center gap-4 p-4">
                  <Link href={surahHref(id)} className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 font-display text-lg font-semibold text-gold">{nf(id)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{sName(id)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{chapters[id - 1].meaning} · {nf(chapters[id - 1].versesCount)} {t({ en: 'ayahs', bn: 'আয়াত', ar: 'آية' })}</span>
                    </span>
                    <span lang="ar" className="font-arabic ms-auto text-2xl text-gold">{chapters[id - 1].nameArabic}</span>
                  </Link>
                  <button aria-label={t({ en: 'Remove', bn: 'মুছুন', ar: 'إزالة' })} onClick={() => toggleFavoriteSurah(id)} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                </motion.div>
              ))}
            </div>
          ) : <Empty key="e2" icon="heart" title={t({ en: 'No favourite surahs', bn: 'কোনো প্রিয় সূরা নেই', ar: 'لا توجد سور مفضلة' })} body={t({ en: 'Favourite a surah from the surah list for one-tap access.', bn: 'সূরা তালিকা থেকে প্রিয় সূরা বেছে নিন।', ar: 'أضف سورة إلى المفضلة من قائمة السور للوصول إليها بلمسة واحدة.' })} href="/quran" cta={t({ en: 'Browse surahs', bn: 'সূরা দেখুন', ar: 'تصفّح السور' })} />)}

          {tab === 'duas' && (savedDuas.length ? savedDuas.map((d) => (
            <motion.article layout key={d.slug} {...fade} className="card-soft lift p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold">{t(duaCategories.find((c) => c.id === d.cat)?.title ?? { en: d.cat, bn: d.cat })}</span>
                <button aria-label={t({ en: 'Remove', bn: 'মুছুন', ar: 'إزالة' })} onClick={() => toggleDuaBookmark(d.slug)} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
              <Link href={`/dua/${d.slug}`} className="mt-3 block font-display text-lg font-semibold hover:text-primary">{t(d.title)}</Link>
              {d.ar && <p dir="rtl" lang="ar" className="quran-text mt-3 text-right text-[1.5rem]">{d.ar}</p>}
              {d.tl && <p className="mt-2 text-sm italic text-muted-foreground">{d.tl}</p>}
              {d.meaning && <p className="mt-1 text-sm">{t(d.meaning)}</p>}
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gold">{d.source}</p>
            </motion.article>
          )) : <Empty key="e3" icon="dua" title={t({ en: 'No saved duas', bn: 'কোনো দোয়া সংরক্ষিত নেই', ar: 'لا توجد أدعية محفوظة' })} body={t({ en: 'Bookmark duas to find them quickly when you need them.', bn: 'দোয়া বুকমার্ক করুন, প্রয়োজনে দ্রুত খুঁজে পাবেন।', ar: 'احفظ الأدعية لتجدها بسرعة عند الحاجة.' })} href="/dua" cta={t({ en: 'Explore duas', bn: 'দোয়া দেখুন', ar: 'استكشف الأدعية' })} />)}

          {tab === 'notes' && (notes.length
            ? notes.map((a) => renderAyah(a, true))
            : <Empty key="e4" icon="note" title={t({ en: 'No notes yet', bn: 'এখনো কোনো নোট নেই', ar: 'لا توجد ملاحظات بعد' })} body={t({ en: 'Add a reflection to a saved ayah and it will appear here.', bn: 'সংরক্ষিত আয়াতে নোট যোগ করলে এখানে দেখা যাবে।', ar: 'أضف تأملًا إلى آية محفوظة وسيظهر هنا.' })} href="/quran" cta={t({ en: 'Open the Quran', bn: 'কুরআন খুলুন', ar: 'افتح المصحف' })} />)}
        </AnimatePresence>
      </div>
    </div>
  )
}
