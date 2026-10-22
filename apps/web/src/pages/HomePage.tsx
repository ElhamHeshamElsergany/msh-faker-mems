import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CategoryId, MemeRecord, ReactionId, SourceId } from '@msh/shared'
import { getTrending } from '../api/client'
import { ExampleChips } from '../components/ExampleChips'
import { FilterBar } from '../components/FilterBar'
import { MemeCard } from '../components/MemeCard'
import { SearchForm } from '../components/SearchForm'
import { EmptyState, ErrorState, IdleState, LoadingState } from '../components/States'
import { useFavorites } from '../hooks/useFavorites'
import { useMemeSearch } from '../hooks/useMemeSearch'

export function HomePage() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [categories, setCategories] = useState<CategoryId[]>([])
  const [reactions, setReactions] = useState<ReactionId[]>([])
  const [sources, setSources] = useState<SourceId[]>([])
  const [searched, setSearched] = useState(false)
  const { status, response, error, search } = useMemeSearch()
  const favorites = useFavorites()
  const [verified, setVerified] = useState<MemeRecord[]>([])

  useEffect(() => {
    let active = true
    getTrending()
      .then((payload) => {
        if (!active) return
        setVerified(payload.items.filter((item) => item.verificationStatus === 'verified'))
      })
      .catch(() => {
        if (active) setVerified([])
      })
    return () => {
      active = false
    }
  }, [])

  function run(nextQuery: string, next = { categories, reactions, sources }) {
    const trimmed = nextQuery.trim()
    if (trimmed.length < 2) return
    setSearched(true)
    setParams({ q: trimmed })
    void search({
      query: trimmed,
      categories: next.categories.length ? next.categories : undefined,
      reactions: next.reactions.length ? next.reactions : undefined,
      sources: next.sources.length ? next.sources : undefined,
    })
  }

  useEffect(() => {
    if (initialQuery.trim().length >= 2) run(initialQuery)
  }, [])

  useEffect(() => {
    if (!searched) return
    run(query)
  }, [categories, reactions, sources])

  return (
    <div className="space-y-8">
      <section className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-3 inline-block -rotate-2 rounded-full border-2 border-stamp bg-sand-50 px-4 py-1 text-sm font-extrabold text-stamp">
            مصري · على قد المجموعة
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">مش فاكر الميم؟</h1>
          <p className="mt-4 max-w-2xl text-lg leading-9 sm:text-xl">
            اوصف الموقف بالمصري، وندوّر لك في المجموعة على أقرب سجل موجود. مفيش توليد صور، ومفيش نسبة لأي فيلم
            أو شخص من غير مصدر متحقق.
          </p>
        </div>
        <aside className="rounded-3xl border-[3px] border-ink bg-palm px-5 py-5 text-sand-50 shadow-hard">
          <p className="text-sm font-bold text-sand-200">ملاحظة صادقة</p>
          <p className="mt-2 text-lg font-extrabold leading-8">
            في كاريكاتير واحد متحقق من 11 فبراير 2011، وترخيصه نطاق عام. باقي الرسوم لسه تجريبية، ومفيش لقطات أفلام.
          </p>
        </aside>
      </section>

      <SearchForm query={query} loading={status === 'loading'} onQueryChange={setQuery} onSubmit={() => run(query)} />
      <ExampleChips
        onPick={(value) => {
          setQuery(value)
          run(value)
        }}
      />

      {verified.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-3xl font-extrabold">ميم متحقق</h2>
          <p className="max-w-2xl leading-8 text-ink-soft">
            الصورة دي كاريكاتير حقيقي، مش رسم التجربة. المصدر والترخيص موجودين في صفحة التفاصيل.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {verified.map((meme) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                saved={favorites.has(meme.id)}
                onToggleSave={() => favorites.toggle(meme, meme.exampleCaptions[0] ?? '')}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-live="polite" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-extrabold">النتائج</h2>
          {response ? (
            <p className="max-w-xl text-sm leading-7 text-ink-soft">
              {response.engine === 'openai'
                ? 'اتفهم الموقف بنموذج على الخادم، والنتائج من المجموعة فقط.'
                : 'الفهم والبحث محليين. مفيش نموذج مدفوع شغّال.'}{' '}
              {response.analysis.intentSummary}
            </p>
          ) : null}
        </div>
        <FilterBar
          categories={categories}
          reactions={reactions}
          sources={sources}
          onCategories={setCategories}
          onReactions={setReactions}
          onSources={setSources}
        />
        {status === 'loading' ? <LoadingState /> : null}
        {status === 'error' && error ? <ErrorState message={error} onRetry={() => run(query)} /> : null}
        {status === 'idle' ? <IdleState /> : null}
        {status === 'ready' && response && response.results.length === 0 ? (
          <EmptyState message={response.message ?? 'ملقناش نتيجة مناسبة.'} />
        ) : null}
        {status === 'ready' && response && response.results.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {response.results.map((result, index) => (
              <MemeCard
                key={result.meme.id}
                meme={result.meme}
                score={result.score}
                confidence={result.confidence}
                explanation={result.explanation}
                caption={result.suggestedCaption}
                rank={index + 1}
                saved={favorites.has(result.meme.id)}
                onToggleSave={() => favorites.toggle(result.meme, result.suggestedCaption)}
              />
            ))}
          </div>
        ) : null}
        {response?.situationCaption ? (
          <p className="rounded-2xl border-2 border-gold bg-sand-50 p-4 leading-8">
            <span className="font-extrabold">اقتراح عام من النموذج، مش كابتشن أصلي: </span>
            {response.situationCaption}
          </p>
        ) : null}
      </section>
    </div>
  )
}
