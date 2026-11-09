/** Shimmer skeleton matching the reader layout (no layout shift when content streams in). */
export function ReaderSkeleton() {
  const bar = 'shimmer rounded-full bg-muted'
  return (
    <div className="mx-auto max-w-[860px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6" aria-busy="true" aria-label="Loading">
      <div className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-6 sm:rounded-[2.5rem] sm:px-10">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className={`${bar} h-3 w-40`} />
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="shimmer size-12 rotate-45 rounded-lg bg-muted" />
          <div className={`${bar} h-14 w-64 sm:w-80`} />
          <div className={`${bar} h-8 w-56`} />
          <div className={`${bar} h-4 w-48`} />
          <div className="mt-2 flex gap-2">{[80, 96, 64, 72].map((w, i) => <div key={i} className={`${bar} h-8`} style={{ width: w }} />)}</div>
          <div className="mt-2 flex gap-2"><div className={`${bar} h-12 w-36`} /><div className={`${bar} h-12 w-28`} /></div>
        </div>
      </div>
      <div className="mx-auto mt-8 h-10 w-72 shimmer rounded-full bg-muted" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-3 py-8 sm:px-6">
          <div className="flex items-center justify-between"><div className={`${bar} h-8 w-14`} /><div className={`${bar} h-8 w-40`} /></div>
          <div className="mt-6 flex flex-col items-end gap-4">
            <div className={`${bar} h-9 w-[92%]`} />
            <div className={`${bar} h-9 w-[64%]`} />
          </div>
          <div className="mt-6 space-y-2.5">
            <div className={`${bar} h-4 w-full`} />
            <div className={`${bar} h-4 w-[85%]`} />
            <div className={`${bar} h-4 w-[70%]`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ReaderNotFound({ kind = 'surah' }: { kind?: 'surah' | 'ayah' | 'juz' }) {
  return null as unknown as JSX.Element
}
