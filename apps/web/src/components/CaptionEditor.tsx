import { useState } from 'react'
import { assetUrl } from '../lib/format'
import { MemeImage } from './MemeImage'

export function CaptionEditor({
  imagePath,
  label,
  status,
  caption,
  allowDownload,
  onCaptionChange,
}: {
  imagePath: string
  label: string
  status: 'demo' | 'verified'
  caption: string
  allowDownload: boolean
  onCaptionChange: (value: string) => void
}) {
  const [position, setPosition] = useState<'top' | 'middle' | 'bottom'>('bottom')
  const [notice, setNotice] = useState('')
  const positionClass = position === 'top' ? 'top-4' : position === 'middle' ? 'top-1/2 -translate-y-1/2' : 'bottom-4'

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption)
      setNotice('التعليق اتنسخ')
    } catch {
      setNotice('النسخ مش متاح من المتصفح ده')
    }
  }

  async function share() {
    const url = window.location.href
    const text = `${caption}\n${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: label, text: caption, url })
        setNotice('اتفتحت مشاركة الجهاز')
        return
      }
      await navigator.clipboard.writeText(text)
      setNotice('الرابط والتعليق اتنسخوا')
    } catch {
      setNotice('المشاركة اتلغت أو مش متاحة')
    }
  }

  return (
    <section className="rounded-3xl border-[3px] border-ink bg-sand-50 p-4 shadow-hard sm:p-6">
      <h2 className="text-2xl font-extrabold">جرّب التعليق</h2>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        الكتابة بتظهر فوق الصورة للمعاينة بس. الصورة الأصلية مش بتتعدل.
      </p>
      <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-ink bg-sand-100">
        <div className="aspect-[4/5] sm:aspect-square">
          <MemeImage imagePath={imagePath} label={label} status={status} />
        </div>
        {caption.trim() ? (
          <p className={`absolute inset-x-4 ${positionClass} rounded-2xl bg-ink/90 px-4 py-3 text-center text-lg font-extrabold leading-8 text-sand-50`}>
            {caption}
          </p>
        ) : null}
      </div>
      <label htmlFor="caption" className="mt-4 block font-extrabold">
        نص التعليق
      </label>
      <textarea
        id="caption"
        value={caption}
        onChange={(event) => onCaptionChange(event.target.value)}
        rows={3}
        maxLength={180}
        className="mt-2 w-full rounded-2xl border-2 border-ink bg-sand-50 p-3 text-lg"
      />
      <fieldset className="mt-3">
        <legend className="mb-2 text-sm font-bold">مكان الكتابة</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['top', 'فوق'],
              ['middle', 'النص'],
              ['bottom', 'تحت'],
            ] as const
          ).map(([value, name]) => (
            <button
              key={value}
              type="button"
              aria-pressed={position === value}
              onClick={() => setPosition(value)}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                position === value ? 'border-palm bg-palm text-sand-50' : 'border-ink'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copyCaption()} className="rounded-full bg-ink px-4 py-2 font-extrabold text-sand-50">
          انسخ التعليق
        </button>
        <button type="button" onClick={() => void share()} className="rounded-full border-2 border-ink px-4 py-2 font-extrabold">
          شارك
        </button>
        {allowDownload ? (
          <a
            href={assetUrl(imagePath)}
            download
            className="rounded-full border-2 border-palm px-4 py-2 font-extrabold text-palm-dark"
          >
            نزّل الصورة الأصلية
          </a>
        ) : (
          <p className="self-center text-sm font-bold text-ink-soft">التنزيل مش متاح حسب الترخيص.</p>
        )}
      </div>
      {allowDownload ? <p className="mt-2 text-sm text-ink-soft">الملف النازل هو الرسم الأصلي من غير التعليق.</p> : null}
      <p role="status" className="mt-3 min-h-6 font-bold text-palm-dark">
        {notice}
      </p>
    </section>
  )
}
