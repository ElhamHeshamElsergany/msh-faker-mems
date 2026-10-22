import { Link } from 'react-router-dom'
import type { MemeRecord } from '@msh/shared'
import { confidenceLabel } from '../lib/format'
import { MemeImage } from './MemeImage'

export function MemeCard({
  meme,
  score,
  confidence,
  explanation,
  caption,
  rank,
  saved,
  onToggleSave,
}: {
  meme: MemeRecord
  score?: number
  confidence?: 'low' | 'medium' | 'high'
  explanation?: string
  caption?: string
  rank?: number
  saved: boolean
  onToggleSave: () => void
}) {
  return (
    <article className="rise flex h-full flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-sand-50 shadow-hard">
      <div className="relative bg-sand-100">
        <div className="aspect-[4/5]">
          <MemeImage imagePath={meme.imagePath} label={meme.label} status={meme.verificationStatus} />
        </div>
        <p className="absolute start-3 top-3 rounded-full border-2 border-ink bg-sand-50 px-3 py-1 text-xs font-extrabold">
          {meme.verificationStatus === 'verified' ? 'مصدر متحقق' : 'رسم تجريبي'}
        </p>
        {rank === 1 ? (
          <p className="absolute end-3 top-3 rounded-full bg-stamp px-3 py-1 text-xs font-extrabold text-sand-50">الأقرب</p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-2xl font-extrabold leading-snug">{meme.label}</h3>
        {typeof score === 'number' && confidence ? (
          <p className="text-sm font-bold text-palm-dark">
            {confidenceLabel(confidence)} · درجة {score}
          </p>
        ) : null}
        {explanation ? <p className="text-sm leading-7 text-ink-soft">{explanation}</p> : null}
        {caption ? (
          <p className="rounded-2xl bg-sand-100 px-3 py-2 text-sm leading-7">
            <span className="font-extrabold">اقتراح تعليق: </span>
            {caption}
          </p>
        ) : null}
        <p className="text-sm leading-7 text-ink-soft">{meme.disclaimer}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link
            to={`/meme/${meme.id}`}
            className="rounded-full bg-ink px-4 py-2 text-sm font-extrabold text-sand-50"
          >
            التفاصيل
          </Link>
          <button
            type="button"
            aria-pressed={saved}
            onClick={onToggleSave}
            className="rounded-full border-2 border-ink px-4 py-2 text-sm font-extrabold"
          >
            {saved ? 'محفوظ' : 'احفظ'}
          </button>
        </div>
      </div>
    </article>
  )
}
