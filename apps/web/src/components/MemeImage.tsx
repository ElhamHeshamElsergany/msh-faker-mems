import { useState } from 'react'
import { assetUrl, imageAlt } from '../lib/format'

export function MemeImage({
  imagePath,
  label,
  status,
}: {
  imagePath: string
  label: string
  status: 'demo' | 'verified'
}) {
  const [failed, setFailed] = useState(false)
  const alt = imageAlt(label, status)

  if (failed) {
    return (
      <div className="grid h-full min-h-48 place-items-center bg-sand-200 px-4 text-center" role="img" aria-label={alt}>
        <p className="font-bold text-ink">الصورة مش متاحة دلوقتي</p>
      </div>
    )
  }

  return (
    <img
      src={assetUrl(imagePath)}
      alt={alt}
      className="h-full w-full object-contain"
      onError={() => setFailed(true)}
    />
  )
}
