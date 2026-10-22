import type { CategoryId, ReactionId, SourceId } from './taxonomy.js'

export interface MemeRecord {
  id: string
  label: string
  imagePath: string
  characterName: string | null
  sourceTitle: string | null
  originalContext: string | null
  keywords: string[]
  categories: CategoryId[]
  reactions: ReactionId[]
  exampleCaptions: string[]
  sourceUrl: string | null
  attribution: string
  license: string
  allowDownload: boolean
  verificationStatus: SourceId
  disclaimer: string
}

export interface SituationAnalysis {
  original: string
  normalized: string
  keywords: string[]
  categories: CategoryId[]
  reactions: ReactionId[]
  intentSummary: string
}

export interface RankedMeme {
  meme: MemeRecord
  score: number
  confidence: 'low' | 'medium' | 'high'
  explanation: string
  suggestedCaption: string
  matchedTerms: string[]
}

export interface SearchFilters {
  categories?: CategoryId[]
  reactions?: ReactionId[]
  sources?: SourceId[]
  limit?: number
}

export interface SearchOutcome {
  analysis: SituationAnalysis
  results: RankedMeme[]
  emptyReason: 'none' | 'filters' | 'low-confidence'
}

export interface SearchResponse {
  engine: 'local' | 'openai'
  aiConfigured: boolean
  dataSource: 'json' | 'supabase'
  analysis: SituationAnalysis
  situationCaption: string | null
  results: RankedMeme[]
  message: string | null
}
