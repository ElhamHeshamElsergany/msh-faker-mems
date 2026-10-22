import {
  analyzeSituation,
  emptyMessage,
  normalizeArabic,
  rankMemes,
  tokenVariants,
  type SearchRequest,
  type SearchResponse,
  type SituationAnalysis,
} from '@msh/shared'
import type { MemeRepository } from '../repositories/types.js'
import type { AppConfig } from '../config.js'
import { log } from '../logger.js'
import { analyzeWithOpenAI, type ModelUnderstanding } from './openai.js'

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

export function mergeAnalysis(local: SituationAnalysis, model: ModelUnderstanding): SituationAnalysis {
  const modelKeywords = model.keywords.flatMap((keyword) => {
    const normalized = normalizeArabic(keyword)
    return normalized.split(' ').flatMap((token) => tokenVariants(token))
  })
  return {
    ...local,
    categories: unique([...local.categories, ...model.categories]) as SituationAnalysis['categories'],
    reactions: unique([...local.reactions, ...model.reactions]) as SituationAnalysis['reactions'],
    keywords: unique([...local.keywords, ...modelKeywords]).slice(0, 24),
    intentSummary: model.intentSummary || local.intentSummary,
  }
}

export async function runSearch(
  repository: MemeRepository,
  config: AppConfig,
  request: SearchRequest,
  fetchImpl?: typeof fetch,
): Promise<SearchResponse> {
  const local = analyzeSituation(request.query)
  let analysis = local
  let engine: SearchResponse['engine'] = 'local'
  let situationCaption: string | null = null

  if (config.openaiApiKey) {
    try {
      const model = await analyzeWithOpenAI({
        apiKey: config.openaiApiKey,
        model: config.openaiModel,
        text: request.query,
        fetchImpl,
      })
      analysis = mergeAnalysis(local, model)
      situationCaption = model.suggestedCaption || null
      engine = 'openai'
    } catch (error) {
      log('warn', 'openai analysis failed; using local understanding', {
        reason: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  const outcome = rankMemes(await repository.list(), analysis, request)
  return {
    engine,
    aiConfigured: Boolean(config.openaiApiKey),
    dataSource: repository.source,
    analysis,
    situationCaption,
    results: outcome.results,
    message: outcome.results.length ? null : emptyMessage(outcome.emptyReason),
  }
}
