export function assetUrl(imagePath: string): string {
  if (/^https?:\/\//.test(imagePath)) return imagePath
  const base = import.meta.env.BASE_URL
  return `${base}${imagePath}`.replace(/([^:]\/)\/+/g, '$1')
}

export function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.replace(/\/$/, '')
}

export const EXAMPLES = [
  'لما المدير يقول فيه تعديل بسيط قبل ما نمشي بخمس دقايق',
  'لما حد يسألني ذاكرت ولا لسه وأنا مفتحتش الكتاب',
  'لما ماما تقول تعال دقيقة بس',
  'بعت الرسالة في الشات الغلط',
  'الرسالة متشافة على الواتساب من غير رد',
  'الاجتماع كان ممكن يبقى إيميل',
]

export function confidenceLabel(level: 'low' | 'medium' | 'high'): string {
  if (level === 'high') return 'تطابق عالي'
  if (level === 'medium') return 'تطابق متوسط'
  return 'تطابق محدود'
}

export function imageAlt(label: string, status: 'demo' | 'verified'): string {
  if (status === 'verified') return `ميم متحقق: ${label}`
  return `رسم تجريبي للموقف: ${label}`
}
