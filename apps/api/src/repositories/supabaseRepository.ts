import { parseMemeDataset, type MemeRecord } from '@msh/shared'
import type { MemeRepository } from './types.js'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function pick<T>(row: Record<string, unknown>, snake: string, camel: string): T {
  return (row[snake] ?? row[camel]) as T
}

export function mapSupabaseMeme(row: unknown): unknown {
  const record = asRecord(row)
  return {
    id: record.id,
    label: record.label,
    imagePath: pick(record, 'image_path', 'imagePath'),
    characterName: pick(record, 'character_name', 'characterName'),
    sourceTitle: pick(record, 'source_title', 'sourceTitle'),
    originalContext: pick(record, 'original_context', 'originalContext'),
    keywords: record.keywords,
    categories: record.categories,
    reactions: record.reactions,
    exampleCaptions: pick(record, 'example_captions', 'exampleCaptions'),
    sourceUrl: pick(record, 'source_url', 'sourceUrl'),
    attribution: record.attribution,
    license: record.license,
    allowDownload: pick(record, 'allow_download', 'allowDownload'),
    verificationStatus: pick(record, 'verification_status', 'verificationStatus'),
    disclaimer: record.disclaimer,
  }
}

export function createSupabaseRepository(url: string, serviceRoleKey: string, fetchImpl: typeof fetch = fetch): MemeRepository {
  let cache: Promise<MemeRecord[]> | null = null
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/memes?select=*`

  function load(): Promise<MemeRecord[]> {
    if (cache) return cache
    const pending = fetchImpl(endpoint, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Supabase memes request failed with status ${response.status}`)
        const body: unknown = await response.json()
        if (!Array.isArray(body)) throw new Error('Supabase memes response was not a list')
        return parseMemeDataset(body.map((row) => mapSupabaseMeme(row)))
      })
      .catch((error: unknown) => {
        cache = null
        throw error
      })
    cache = pending
    return pending
  }

  return {
    source: 'supabase',
    list: load,
    async getById(id) {
      const memes = await load()
      return memes.find((meme) => meme.id === id) ?? null
    },
  }
}
