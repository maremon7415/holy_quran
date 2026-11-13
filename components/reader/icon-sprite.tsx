/** One shared SVG sprite for the per-ayah toolbar (rendered once instead of ~8 inline SVGs × 286 ayahs). */
export function ReaderIconSprite() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <symbol id="ri-play" viewBox="0 0 24 24"><path d="M6 4.5v15l13-7.5z" fill="currentColor" stroke="none" /></symbol>
        <symbol id="ri-pause" viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /></symbol>
        <symbol id="ri-bookmark" viewBox="0 0 24 24"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.5.87l-4.5-2.58a2 2 0 0 0-2 0l-4.5 2.58A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" /></symbol>
        <symbol id="ri-tafsir" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3zM16 8h2M16 12h2M6 8h2M6 12h2" /></symbol>
        <symbol id="ri-copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></symbol>
        <symbol id="ri-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></symbol>
        <symbol id="ri-image" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></symbol>
        <symbol id="ri-wbw" viewBox="0 0 24 24"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" /></symbol>
        <symbol id="ri-more" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></symbol>
      </defs>
    </svg>
  )
}
