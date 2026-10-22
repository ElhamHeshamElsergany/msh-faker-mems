import { analyzeSituation } from './analyze.js'
import { normalizeArabic, tokenVariants, canonicalToken } from './normalize.js'
import { categoryLabel, reactionLabel } from './taxonomy.js'
import type { MemeRecord, RankedMeme, SearchFilters, SearchOutcome, SituationAnalysis } from './types.js'

const MIN_SCORE = 8

function expandedSet(tokens: string[]): Set<string> {
  const set = new Set<string>()
  for (const token of tokens) {
    for (const variant of tokenVariants(token)) set.add(variant)
  }
  return set
}

function textTokens(value: string): string[] {
  return normalizeArabic(value).split(' ').filter(Boolean)
}

function overlaps(memeTerms: Set<string>, queryTerms: Set<string>): string[] {
  const queryKeys = new Set([...queryTerms].map((term) => canonicalToken(term)))
  const hits = new Set<string>()
  for (const term of memeTerms) {
    const key = canonicalToken(term)
    if (queryKeys.has(key)) hits.add(key)
  }
  return [...hits]
}

function confidenceFor(score: number): RankedMeme['confidence'] {
  if (score >= 16) return 'high'
  if (score >= 10) return 'medium'
  return 'low'
}

function bestCaption(meme: MemeRecord, queryTerms: Set<string>): string {
  let best = meme.exampleCaptions[0] ?? ''
  let bestScore = -1
  for (const caption of meme.exampleCaptions) {
    const tokens = expandedSet(textTokens(caption))
    let score = 0
    for (const token of tokens) {
      if (queryTerms.has(token)) score += 1
    }
    if (score > bestScore) {
      best = caption
      bestScore = score
    }
  }
  return best
}

function explanation(meme: MemeRecord, matched: string[], analysis: SituationAnalysis): string {
  const words = matched.slice(0, 4).join('، ')
  const sharedCategories = meme.categories.filter((id) => analysis.categories.includes(id))
  const sharedReactions = meme.reactions.filter((id) => analysis.reactions.includes(id))
  const parts: string[] = []
  if (words) parts.push(`كلمات قريبة: ${words}`)
  if (sharedCategories.length) {
    parts.push(`التصنيف: ${sharedCategories.map((id) => categoryLabel(id)).join('، ')}`)
  }
  if (sharedReactions.length) {
    parts.push(`الإحساس: ${sharedReactions.map((id) => reactionLabel(id)).join('، ')}`)
  }
  if (!parts.length) return 'التشابه ضعيف، فالسجل ده مش مترشح.'
  return parts.join('. ') + '.'
}

function passesFilters(meme: MemeRecord, filters: SearchFilters): boolean {
  if (filters.sources?.length && !filters.sources.includes(meme.verificationStatus)) return false
  if (filters.categories?.length && !meme.categories.some((id) => filters.categories?.includes(id))) {
    return false
  }
  if (filters.reactions?.length && !meme.reactions.some((id) => filters.reactions?.includes(id))) {
    return false
  }
  return true
}

function scoreMeme(meme: MemeRecord, analysis: SituationAnalysis): Omit<RankedMeme, 'confidence'> | null {
  const queryTerms = expandedSet(analysis.keywords)
  const keywordTerms = expandedSet(meme.keywords.flatMap((keyword) => textTokens(keyword)))
  const captionTerms = expandedSet(meme.exampleCaptions.flatMap((caption) => textTokens(caption)))
  const contextTerms = meme.originalContext ? expandedSet(textTokens(meme.originalContext)) : new Set<string>()

  const keywordHits = overlaps(keywordTerms, queryTerms)
  const captionHits = overlaps(captionTerms, queryTerms)
  const contextHits = overlaps(contextTerms, queryTerms)
  let score = keywordHits.length * 3 + captionHits.length + contextHits.length * 2

  const normalizedQuery = analysis.normalized
  for (const keyword of meme.keywords) {
    const phrase = normalizeArabic(keyword)
    if (phrase.includes(' ') && normalizedQuery.includes(phrase)) {
      score += 8
      if (!keywordHits.includes(phrase.split(' ')[0] ?? phrase)) keywordHits.push(phrase)
    }
  }

  const sharedCategories = meme.categories.filter((id) => analysis.categories.includes(id))
  const sharedReactions = meme.reactions.filter((id) => analysis.reactions.includes(id))
  score += sharedCategories.length * 3
  score += sharedReactions.length * 2

  if (!keywordHits.length && !captionHits.length) {
    score = Math.min(score, 4)
  }

  const matched = [...new Set([...keywordHits, ...captionHits])].slice(0, 8)
  return {
    meme,
    score,
    explanation: explanation(meme, matched, analysis),
    suggestedCaption: bestCaption(meme, queryTerms),
    matchedTerms: matched,
  }
}

export function rankMemes(
  memes: MemeRecord[],
  analysis: SituationAnalysis,
  filters: SearchFilters = {},
): SearchOutcome {
  const filtered = memes.filter((meme) => passesFilters(meme, filters))
  const filtersExcludedEverything = memes.length > 0 && filtered.length === 0
  const scored = filtered
    .map((meme) => scoreMeme(meme, analysis))
    .filter((item): item is Omit<RankedMeme, 'confidence'> => item !== null && item.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.meme.id.localeCompare(b.meme.id))

  const seen = new Set<string>()
  const unique = scored.filter((item) => {
    const key = `${item.meme.id}:${item.meme.imagePath}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (!unique.length) {
    return {
      analysis,
      results: [],
      emptyReason: filtersExcludedEverything ? 'filters' : 'low-confidence',
    }
  }

  const best = unique[0]?.score ?? 0
  const requested = filters.limit ?? 6
  const cap = best >= 16 ? requested : best >= 10 ? Math.min(requested, 4) : Math.min(requested, 2)
  const results = unique.slice(0, cap).map((item) => ({
    ...item,
    confidence: confidenceFor(item.score),
  }))

  return { analysis, results, emptyReason: 'none' }
}

export function searchMemes(memes: MemeRecord[], query: string, filters: SearchFilters = {}): SearchOutcome {
  return rankMemes(memes, analyzeSituation(query), filters)
}

export function emptyMessage(reason: SearchOutcome['emptyReason']): string {
  if (reason === 'filters') {
    return 'مفيش سجل في المجموعة يطابق الفلاتر دي. شيّل فلتر وجرّب تاني.'
  }
  return 'ملقناش ميم قريب بدرجة كافية في المجموعة الحالية. جرّب كلمات أبسط، أو استنى لما تتضاف سجلات متحققة. مش هنرجّع نتيجة بعيدة ونسميها ميم مصري.'
}
