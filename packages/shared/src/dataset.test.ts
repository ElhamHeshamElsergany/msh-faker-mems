import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseMemeDataset } from './schema.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const blockedNames = ['عادل امام', 'محمد هنيدي', 'محمد هنيدى', 'احمد حلمي', 'أحمد حلمي', 'عادل إمام']

describe('curated dataset', () => {
  const memes = parseMemeDataset(JSON.parse(readFileSync(path.join(root, 'data', 'memes.json'), 'utf8')))

  it('is a small honest seed with local demo art', () => {
    expect(memes.length).toBeGreaterThanOrEqual(8)
    for (const meme of memes) {
      expect(meme.verificationStatus).toBe('demo')
      expect(meme.characterName).toBeNull()
      expect(meme.sourceTitle).toBeNull()
      expect(meme.sourceUrl).toBeNull()
      expect(meme.disclaimer).toContain('ليس ميم')
      const file = path.join(root, 'apps', 'web', 'public', meme.imagePath)
      expect(existsSync(file), file).toBe(true)
      const blob = JSON.stringify(meme)
      for (const name of blockedNames) {
        expect(blob.includes(name)).toBe(false)
      }
    }
  })
})
