import {
  emptyMessage,
  parseMemeDataset,
  searchMemes as searchLocal,
  type SearchRequest,
  type SearchResponse,
} from '@msh/shared'

export async function mockSearch(request: SearchRequest): Promise<SearchResponse> {
  const response = await fetch(`${import.meta.env.BASE_URL}dataset/memes.json`)
  if (!response.ok) throw new Error('تعذر قراءة المجموعة التجريبية')
  const dataset = parseMemeDataset(await response.json())
  const outcome = searchLocal(dataset, request.query, request)
  return {
    engine: 'local',
    aiConfigured: false,
    dataSource: 'json',
    analysis: outcome.analysis,
    situationCaption: null,
    results: outcome.results,
    message: outcome.results.length ? null : emptyMessage(outcome.emptyReason),
  }
}

export async function mockMeme(id: string) {
  const response = await fetch(`${import.meta.env.BASE_URL}dataset/memes.json`)
  if (!response.ok) throw new Error('تعذر قراءة المجموعة التجريبية')
  const dataset = parseMemeDataset(await response.json())
  return dataset.find((meme) => meme.id === id) ?? null
}
