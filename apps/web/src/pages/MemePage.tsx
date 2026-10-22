import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { MemeRecord } from '@msh/shared'
import { categoryLabel, reactionLabel } from '@msh/shared'
import { ApiError, getMeme } from '../api/client'
import { CaptionEditor } from '../components/CaptionEditor'
import { ErrorState } from '../components/States'
import { useFavorites } from '../hooks/useFavorites'

export function MemePage() {
  const { id = '' } = useParams()
  const favorites = useFavorites()
  const [meme, setMeme] = useState<MemeRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [caption, setCaption] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getMeme(id)
      .then((record) => {
        if (!active) return
        setMeme(record)
        const saved = favorites.items.find((item) => item.id === record.id)
        setCaption(saved?.caption || record.exampleCaptions[0] || '')
        document.title = `${record.label} · مش فاكر الميم`
      })
      .catch((caught: unknown) => {
        if (!active) return
        setMeme(null)
        setError(caught instanceof ApiError ? caught.message : 'تعذر فتح السجل.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <p className="text-xl font-bold">بنفتح السجل…</p>
  if (error || !meme) {
    return (
      <div className="space-y-4">
        <ErrorState message={error ?? 'السجل مش موجود.'} onRetry={() => window.location.reload()} />
        <Link to="/" className="inline-block font-extrabold text-palm-dark">
          الرجوع للبحث
        </Link>
      </div>
    )
  }

  const saved = favorites.has(meme.id)

  return (
    <article className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <Link to="/" className="font-extrabold text-palm-dark">
          الرجوع للبحث
        </Link>
        <p className="inline-block rounded-full border-2 border-ink px-3 py-1 text-sm font-extrabold">
          {meme.verificationStatus === 'verified' ? 'مصدر متحقق' : 'رسم تجريبي'}
        </p>
        <h1 className="text-4xl font-extrabold leading-tight">{meme.label}</h1>
        <p className="leading-8">{meme.disclaimer}</p>
        <dl className="space-y-3 rounded-3xl border-2 border-ink bg-sand-50 p-4">
          <div>
            <dt className="font-extrabold">الشخص</dt>
            <dd>{meme.characterName ?? 'مش منسوب لشخص حقيقي.'}</dd>
          </div>
          <div>
            <dt className="font-extrabold">الفيلم أو المسلسل أو المصدر</dt>
            <dd>{meme.sourceTitle ?? 'مفيش مصدر متحقق مربوط بالسجل ده.'}</dd>
          </div>
          <div>
            <dt className="font-extrabold">السياق الأصلي</dt>
            <dd>{meme.originalContext ?? 'غير معروف. مش هنخترع مشهد.'}</dd>
          </div>
          <div>
            <dt className="font-extrabold">الرابط</dt>
            <dd>
              {meme.sourceUrl ? (
                <a href={meme.sourceUrl} className="font-bold text-palm-dark underline" rel="noreferrer">
                  مصدر السجل
                </a>
              ) : (
                'مفيش رابط مصدر.'
              )}
            </dd>
          </div>
          <div>
            <dt className="font-extrabold">النسبة والترخيص</dt>
            <dd>
              {meme.attribution} · {meme.license}
            </dd>
          </div>
        </dl>
        <p className="text-sm leading-7">
          التصنيف: {meme.categories.map((item) => categoryLabel(item)).join('، ')}
          <br />
          الإحساس: {meme.reactions.map((item) => reactionLabel(item)).join('، ')}
        </p>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => favorites.toggle(meme, caption)}
          className="rounded-full bg-stamp px-5 py-2 font-extrabold text-sand-50"
        >
          {saved ? 'شيل من المحفوظات' : 'احفظ في المحفوظات'}
        </button>
        {saved ? (
          <button type="button" onClick={() => favorites.updateCaption(meme.id, caption)} className="ms-2 rounded-full border-2 border-ink px-5 py-2 font-extrabold">
            حدّث التعليق المحفوظ
          </button>
        ) : null}
      </div>
      <CaptionEditor
        imagePath={meme.imagePath}
        label={meme.label}
        status={meme.verificationStatus}
        caption={caption}
        allowDownload={meme.allowDownload}
        onCaptionChange={setCaption}
      />
    </article>
  )
}
