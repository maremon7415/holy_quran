'use client'
import { useRef, useState } from 'react'
import { useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'

const KEYS = ['quran-store', 'noor-hifz', 'noor-journey', 'noor-reader']

export function BackupPanel() {
  const t = useTx()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const exportData = () => {
    const data: Record<string, unknown> = {}
    for (const k of KEYS) {
      try {
        const v = localStorage.getItem(k)
        if (v) data[k] = JSON.parse(v)
      } catch {}
    }
    const blob = new Blob([JSON.stringify({ app: 'noor-quran', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `noor-quran-backup-${new Date().toLocaleDateString('en-CA')}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    setMsg({ ok: true, text: t({ en: 'Backup downloaded.', bn: 'ব্যাকআপ ডাউনলোড হয়েছে।' }) })
  }

  const importData = async (f: File) => {
    try {
      const json = JSON.parse(await f.text())
      if (json?.app !== 'noor-quran' || typeof json.data !== 'object') throw new Error('bad')
      let n = 0
      for (const k of KEYS) if (json.data[k]) { localStorage.setItem(k, JSON.stringify(json.data[k])); n++ }
      setMsg({ ok: true, text: t({ en: `Restored ${n} data set${n === 1 ? '' : 's'}. Reloading…`, bn: `${n}টি ডেটা পুনরুদ্ধার হয়েছে। রিলোড হচ্ছে…` }) })
      setTimeout(() => location.reload(), 900)
    } catch {
      setMsg({ ok: false, text: t({ en: 'That file is not a valid Noor Quran backup.', bn: 'এটি বৈধ নূর কুরআন ব্যাকআপ ফাইল নয়।' }) })
    }
  }

  return (
    <div id="backup" className="card-soft rounded-3xl border border-border bg-card p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <UiIcon name="settings" size={36} />
        <div>
          <h3 className="font-display text-xl">{t({ en: 'Backup & restore', bn: 'ব্যাকআপ ও পুনরুদ্ধার' })}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t({ en: 'Your progress, bookmarks, hifz and khatam plans live only on this device — nothing is sent to a server. Export a backup to keep it safe or move it to another device.', bn: 'আপনার অগ্রগতি, বুকমার্ক, হিফজ ও খতম পরিকল্পনা শুধু এই ডিভাইসে থাকে — কোনো সার্ভারে পাঠানো হয় না। নিরাপদ রাখতে বা অন্য ডিভাইসে নিতে ব্যাকআপ নিন।' })}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={exportData} className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition active:scale-95">{t({ en: 'Export JSON', bn: 'JSON এক্সপোর্ট' })}</button>
        <button onClick={() => file.current?.click()} className="h-11 rounded-full border border-border px-6 text-sm font-semibold transition hover:bg-muted active:scale-95">{t({ en: 'Import backup', bn: 'ব্যাকআপ ইমপোর্ট' })}</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = '' }} />
      </div>
      {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-primary' : 'text-destructive'}`}>{msg.text}</p>}
    </div>
  )
}
