import type { FormEvent } from 'react'

export function SearchForm({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: {
  query: string
  loading: boolean
  onQueryChange: (value: string) => void
  onSubmit: () => void
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="notebook rounded-3xl border-[3px] border-ink p-4 shadow-hard sm:p-6">
      <label htmlFor="situation" className="mb-3 block text-lg font-extrabold">
        الموقف
      </label>
      <textarea
        id="situation"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault()
            onSubmit()
          }
        }}
        placeholder="احكيلي الموقف اللي محتاجله ميم 😂"
        rows={4}
        maxLength={500}
        className="w-full resize-y bg-transparent text-xl leading-9 text-ink placeholder:text-ink-soft/70"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Ctrl + Enter للبحث. النص الأصلي بيفضل زي ما كتبته.</p>
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="rounded-full bg-stamp px-8 py-3 text-lg font-extrabold text-sand-50 shadow-soft transition hover:bg-stamp-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'بندوّر…' : 'هاتلي ميم'}
        </button>
      </div>
    </form>
  )
}
