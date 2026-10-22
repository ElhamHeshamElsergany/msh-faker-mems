import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseMemeDataset } from './schema.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const blockedNames = ['عادل امام', 'محمد هنيدي', 'محمد هنيدى', 'احمد حلمي', 'أحمد حلمي', 'عادل إمام']

describe('curated dataset', () => {
  const memes = parseMemeDataset(JSON.parse(readFileSync(path.join(root, 'data', 'memes.json'), 'utf8')))

  it('keeps demo drawings unlabeled and verified records sourced', () => {
    expect(memes.length).toBeGreaterThanOrEqual(8)
    const verified = memes.filter((meme) => meme.verificationStatus === 'verified')
    expect(verified.map((meme) => meme.id)).toContain('verified-mubarak-knockout')
    for (const meme of memes) {
      const file = path.join(root, 'apps', 'web', 'public', meme.imagePath)
      expect(existsSync(file), file).toBe(true)
      if (meme.verificationStatus === 'demo') {
        expect(meme.characterName).toBeNull()
        expect(meme.sourceTitle).toBeNull()
        expect(meme.sourceUrl).toBeNull()
        expect(meme.disclaimer).toContain('ليس ميم')
        const blob = JSON.stringify(meme)
        for (const name of blockedNames) {
          expect(blob.includes(name)).toBe(false)
        }
      } else {
        expect(meme.sourceUrl).toMatch(/^https:\/\//)
        expect(meme.attribution.length).toBeGreaterThan(2)
        expect(meme.disclaimer).toContain('مش لقطة فيلم')
      }
    }
  })
})
