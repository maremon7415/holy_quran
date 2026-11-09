/** Applies layout prefs (mushaf mode, English edition) before first paint — avoids a flash on reload.
 *  Key must match READER_STORAGE_KEY in lib/stores/reader.ts (that module is client-only). */
export function ReaderPrefsInline() {
  const js = `try{var s=JSON.parse(localStorage.getItem('noor-reader')||'{}').state||{};var d=document.documentElement.dataset;d.readerMode=s.mode||'translation';d.enEd=s.enEdition||'sahih'}catch(e){}`
  return <script dangerouslySetInnerHTML={{ __html: js }} />
}
