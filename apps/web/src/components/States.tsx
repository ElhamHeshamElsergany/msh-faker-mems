export function LoadingState() {
  return (
    <div aria-live="polite" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {['أول', 'تاني', 'تالت'].map((label) => (
        <div key={label} className="h-80 animate-pulse rounded-3xl border-[3px] border-ink bg-sand-100" />
      ))}
      <p className="sr-only">بندوّر في المجموعة</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-3xl border-[3px] border-stamp bg-sand-50 p-6 shadow-soft">
      <h2 className="text-2xl font-extrabold text-stamp">حصل عطل</h2>
      <p className="mt-2 leading-8">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-stamp px-5 py-2 font-extrabold text-sand-50">
        حاول تاني
      </button>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border-[3px] border-dashed border-ink bg-sand-50 p-6">
      <h2 className="text-2xl font-extrabold">مفيش نتيجة مناسبة</h2>
      <p className="mt-2 leading-8">{message}</p>
    </div>
  )
}

export function IdleState() {
  return (
    <div className="rounded-3xl border-2 border-ink bg-sand-50 p-6">
      <h2 className="text-2xl font-extrabold">لسه مفيش بحث</h2>
      <p className="mt-2 leading-8 text-ink-soft">اكتب الموقف أو اختَر مثال، وبعدين اضغط «هاتلي ميم».</p>
    </div>
  )
}
