import { normalizeArabic, tokenVariants, tokenize } from './normalize.js'
import { categoryLabel, reactionLabel, type CategoryId, type ReactionId } from './taxonomy.js'
import type { SituationAnalysis } from './types.js'

const CATEGORY_SIGNALS: Record<CategoryId, string[]> = {
  work: ['شغل', 'مدير', 'مكتب', 'اجتماع', 'مرتب', 'زميل', 'تعديل', 'ديدلاين', 'ايميل', 'شركه', 'موظفين'],
  studying: ['امتحان', 'مذاكره', 'ذاكرت', 'جامعه', 'كليه', 'كتاب', 'محاضره', 'دكتور', 'مشروع', 'مشروع تخرج'],
  family: ['ماما', 'بابا', 'امي', 'ابي', 'اهل', 'عيله', 'اختي', 'اخويا', 'قريبي'],
  relationships: ['خطوبه', 'جواز', 'صاحبتي', 'واتساب', 'رساله', 'بيحبني', 'سابني', 'متشاف', 'من غير رد'],
  social: ['الشات الغلط', 'الجروب', 'قدام الناس', 'عزومه', 'صاحب'],
}

const REACTION_SIGNALS: Record<ReactionId, string[]> = {
  embarrassment: ['احراج', 'اتحرجت', 'فضيحه', 'خجلان', 'مفتحتش الكتاب', 'الشات الغلط'],
  shock: ['صدمه', 'مش مصدق', 'مفاجاه', 'يا نهار', 'خمس دقايق'],
  frustration: ['زهقت', 'ضايق', 'تعبت', 'مش قادر', 'من غير رد', 'تعديل بسيط', 'قبل ما نمشي'],
  happiness: ['فرحان', 'مبسوط', 'نجحت', 'بشري', 'الحمد لله'],
  sarcasm: ['يا سلام', 'تمام اوي', 'كان ممكن يبقي ايميل', 'اكيد طبعا'],
  fear: ['خايف', 'ماما', 'دقيقه بس', 'تعالي دقيقه'],
  confusion: ['مش فاهم', 'ايه ده', 'لخبطه', 'الجروب الغلط'],
  relief: ['الحمد لله خلصت', 'ارتحت', 'عدي الامتحان'],
}

function signalHit(normalized: string, expanded: Set<string>, signal: string): boolean {
  const phrase = normalizeArabic(signal)
  if (!phrase) return false
  if (phrase.includes(' ')) return normalized.includes(phrase)
  return expanded.has(phrase) || tokenVariants(phrase).some((variant) => expanded.has(variant))
}

function collect(normalized: string, expanded: Set<string>, table: Record<string, string[]>): string[] {
  return Object.entries(table)
    .filter(([, signals]) => signals.some((signal) => signalHit(normalized, expanded, signal)))
    .map(([id]) => id)
}

function summary(categories: CategoryId[], reactions: ReactionId[]): string {
  if (!categories.length && !reactions.length) {
    return 'الموقف مش واضح تابع لأنهي نوع. البحث هيتم بالكلمات المتاحة بس.'
  }
  const cats = categories.map((id) => categoryLabel(id)).join(' و')
  const feels = reactions.map((id) => reactionLabel(id)).join(' و')
  if (categories.length && reactions.length) {
    return `الموقف مرتبط بـ${cats}، والإحساس الأقرب: ${feels}.`
  }
  if (categories.length) return `الموقف مرتبط بـ${cats}.`
  return `الإحساس الأقرب: ${feels}.`
}

export function analyzeSituation(original: string): SituationAnalysis {
  const normalized = normalizeArabic(original)
  const tokens = tokenize(normalized)
  const expanded = new Set<string>()
  for (const token of tokens) {
    for (const variant of tokenVariants(token)) expanded.add(variant)
  }
  const categories = collect(normalized, expanded, CATEGORY_SIGNALS) as CategoryId[]
  const reactions = collect(normalized, expanded, REACTION_SIGNALS) as ReactionId[]
  const keywords = [...expanded].filter((token) => token.length > 1).slice(0, 24)
  return {
    original,
    normalized,
    keywords,
    categories,
    reactions,
    intentSummary: summary(categories, reactions),
  }
}
