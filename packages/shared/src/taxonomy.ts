export const CATEGORIES = [
  { id: 'work', label: 'شغل' },
  { id: 'studying', label: 'مذاكرة' },
  { id: 'family', label: 'عيلة' },
  { id: 'relationships', label: 'علاقات' },
  { id: 'social', label: 'موقف اجتماعي' },
] as const

export const REACTIONS = [
  { id: 'embarrassment', label: 'إحراج' },
  { id: 'shock', label: 'صدمة' },
  { id: 'frustration', label: 'إحباط' },
  { id: 'happiness', label: 'فرح' },
  { id: 'sarcasm', label: 'سخرية' },
  { id: 'fear', label: 'توتر' },
  { id: 'confusion', label: 'لخبطة' },
  { id: 'relief', label: 'ارتياح' },
] as const

export const SOURCES = [
  { id: 'demo', label: 'رسوم تجريبية' },
  { id: 'verified', label: 'مصدر متحقق' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']
export type ReactionId = (typeof REACTIONS)[number]['id']
export type SourceId = (typeof SOURCES)[number]['id']

export const CATEGORY_IDS = CATEGORIES.map((item) => item.id) as [
  CategoryId,
  ...CategoryId[],
]
export const REACTION_IDS = REACTIONS.map((item) => item.id) as [
  ReactionId,
  ...ReactionId[],
]
export const SOURCE_IDS = SOURCES.map((item) => item.id) as [SourceId, ...SourceId[]]

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((item) => item.id === id)?.label ?? id
}

export function reactionLabel(id: ReactionId): string {
  return REACTIONS.find((item) => item.id === id)?.label ?? id
}

export function sourceLabel(id: SourceId): string {
  return SOURCES.find((item) => item.id === id)?.label ?? id
}
