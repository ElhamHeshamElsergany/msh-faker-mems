import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMemeDataset, type MemeRecord } from '@msh/shared'
import type { MemeRepository } from './types.js'

export function resolveDataPath(explicit?: string): string {
  if (explicit) {
    if (!existsSync(explicit)) throw new Error('MEME_DATA_PATH does not exist')
    return explicit
  }

  const starts = [process.cwd(), path.dirname(fileURLToPath(import.meta.url))]
  for (const start of starts) {
    let dir = start
    for (let depth = 0; depth < 7; depth += 1) {
      const candidate = path.join(dir, 'data', 'memes.json')
      if (existsSync(candidate)) return candidate
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }

  throw new Error('Could not find data/memes.json')
}

export function createJsonRepository(dataPath?: string): MemeRepository {
  const file = resolveDataPath(dataPath)
  const memes: MemeRecord[] = parseMemeDataset(JSON.parse(readFileSync(file, 'utf8')))
  return {
    source: 'json',
    async list() {
      return memes
    },
    async getById(id) {
      return memes.find((meme) => meme.id === id) ?? null
    },
  }
}
