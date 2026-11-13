/** Local backup file (same format the Settings page uses) — shared by /account. */
const RE = /^(quran-store|noor-)/

export function exportBackup() {
  const data: Record<string, string | null> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (RE.test(k)) data[k] = localStorage.getItem(k)
  }
  const blob = new Blob([JSON.stringify({ app: 'noor-quran', exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `noor-quran-backup-${new Date().toISOString().slice(0, 10)}.json` })
  a.click()
  URL.revokeObjectURL(a.href)
}

/** Writes the backup into localStorage; caller reloads the page. Throws if the file is not a Noor backup. */
export async function importBackup(file: File) {
  const json = JSON.parse(await file.text())
  if (json.app !== 'noor-quran' || typeof json.data !== 'object') throw new Error('not a backup')
  for (const [k, v] of Object.entries(json.data)) if (RE.test(k) && typeof v === 'string') localStorage.setItem(k, v)
}
