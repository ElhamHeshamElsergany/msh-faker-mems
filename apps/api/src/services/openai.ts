import { CATEGORY_IDS, REACTION_IDS, type CategoryId, type ReactionId } from '@msh/shared'

export interface ModelUnderstanding {
  categories: CategoryId[]
  reactions: ReactionId[]
  keywords: string[]
  intentSummary: string
  suggestedCaption: string
}

function onlyAllowed<T extends string>(values: readonly T[], input: unknown): T[] {
  if (!Array.isArray(input)) return []
  return input.filter((item): item is T => typeof item === 'string' && values.includes(item as T)).slice(0, 4)
}

function stringList(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 12)
}

export function parseModelJson(content: string): ModelUnderstanding {
  const cleaned = content.replace(/```json|```/g, '').trim()
  const parsed: unknown = JSON.parse(cleaned)
  if (!parsed || typeof parsed !== 'object') throw new Error('Model response was not an object')
  const record = parsed as Record<string, unknown>
  return {
    categories: onlyAllowed(CATEGORY_IDS, record.categories),
    reactions: onlyAllowed(REACTION_IDS, record.reactions),
    keywords: stringList(record.keywords).map((keyword) => keyword.trim().slice(0, 40)),
    intentSummary: typeof record.intentSummary === 'string' ? record.intentSummary.trim().slice(0, 240) : '',
    suggestedCaption: typeof record.suggestedCaption === 'string' ? record.suggestedCaption.trim().slice(0, 180) : '',
  }
}

export async function analyzeWithOpenAI(options: {
  apiKey: string
  model: string
  text: string
  fetchImpl?: typeof fetch
}): Promise<ModelUnderstanding> {
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You classify an Egyptian Arabic situation so an app can search a curated meme catalog. Do not invent movie titles, character names, origins, or image URLs. Reply with JSON only: {"categories":[],"reactions":[],"keywords":[],"intentSummary":"","suggestedCaption":""}. categories from work, studying, family, relationships, social. reactions from embarrassment, shock, frustration, happiness, sarcasm, fear, confusion, relief. keywords and suggestedCaption in Egyptian Arabic. suggestedCaption is a new suggestion, not a quote.',
        },
        { role: 'user', content: options.text.slice(0, 500) },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`)
  }

  const body: unknown = await response.json()
  const content =
    body &&
    typeof body === 'object' &&
    'choices' in body &&
    Array.isArray(body.choices) &&
    body.choices[0] &&
    typeof body.choices[0] === 'object' &&
    'message' in body.choices[0] &&
    body.choices[0].message &&
    typeof body.choices[0].message === 'object' &&
    'content' in body.choices[0].message &&
    typeof body.choices[0].message.content === 'string'
      ? body.choices[0].message.content
      : ''

  if (!content) throw new Error('OpenAI response did not include content')
  return parseModelJson(content)
}
