/** Tiny IndexedDB helper shared by the page and (duplicated by hand in) public/sw.js.
 *  DB `noor-offline` v1: `kv` (key → value) and `fired` (reminder id → timestamp). */
const DB = 'noor-offline'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
      if (!db.objectStoreNames.contains('fired')) db.createObjectStore('fired')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(store: 'kv' | 'fired', mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const t = db.transaction(store, mode)
      const r = fn(t.objectStore(store))
      t.oncomplete = () => resolve(r.result)
      t.onerror = () => reject(t.error)
      t.onabort = () => reject(t.error)
    })
  } finally {
    db.close()
  }
}

export const kvGet = <T,>(key: string) => tx<T | undefined>('kv', 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>).catch(() => undefined)
export const kvSet = (key: string, value: unknown) => tx('kv', 'readwrite', (s) => s.put(value, key)).then(() => true).catch(() => false)
export const firedHas = (id: string) => tx<unknown>('fired', 'readonly', (s) => s.get(id)).then((v) => v !== undefined).catch(() => false)
export const firedAdd = (id: string) => tx('fired', 'readwrite', (s) => s.put(Date.now(), id)).catch(() => {})
export async function firedPrune(olderThanMs = 3 * 86_400_000) {
  try {
    const db = await open()
    await new Promise<void>((resolve) => {
      const t = db.transaction('fired', 'readwrite')
      const s = t.objectStore('fired')
      const c = s.openCursor()
      c.onsuccess = () => {
        const cur = c.result
        if (!cur) return
        if (Date.now() - (cur.value as number) > olderThanMs) cur.delete()
        cur.continue()
      }
      t.oncomplete = () => { db.close(); resolve() }
      t.onerror = () => { db.close(); resolve() }
    })
  } catch {}
}
