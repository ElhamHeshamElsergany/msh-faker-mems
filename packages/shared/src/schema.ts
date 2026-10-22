import { z } from 'zod'
import { CATEGORY_IDS, REACTION_IDS, SOURCE_IDS } from './taxonomy.js'
import type { MemeRecord } from './types.js'

const localImage = /^memes\/[a-z0-9/-]+\.(svg|png|webp|jpg|jpeg)$/
const remoteImage = /^https:\/\/\S+$/

export const memeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{3,80}$/),
    label: z.string().trim().min(2).max(80),
    imagePath: z.string().min(1).max(300),
    characterName: z.string().trim().min(1).max(120).nullable(),
    sourceTitle: z.string().trim().min(1).max(160).nullable(),
    originalContext: z.string().trim().min(1).max(500).nullable(),
    keywords: z.array(z.string().trim().min(1).max(80)).min(2).max(40),
    categories: z.array(z.enum(CATEGORY_IDS)).min(1).max(4),
    reactions: z.array(z.enum(REACTION_IDS)).min(1).max(4),
    exampleCaptions: z.array(z.string().trim().min(2).max(180)).min(1).max(6),
    sourceUrl: z.string().url().nullable(),
    attribution: z.string().trim().min(2).max(300),
    license: z.string().trim().min(2).max(200),
    allowDownload: z.boolean(),
    verificationStatus: z.enum(SOURCE_IDS),
    disclaimer: z.string().trim().min(2).max(400),
  })
  .superRefine((meme, ctx) => {
    const imageOk =
      localImage.test(meme.imagePath) ||
      (meme.verificationStatus === 'verified' && remoteImage.test(meme.imagePath))
    if (!imageOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imagePath'],
        message: 'Image must be a local memes/ path, or https only when verified.',
      })
    }

    if (meme.verificationStatus === 'demo') {
      if (meme.characterName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['characterName'],
          message: 'Demo records cannot name a real person.',
        })
      }
      if (meme.sourceTitle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sourceTitle'],
          message: 'Demo records cannot claim a movie or show.',
        })
      }
      if (meme.sourceUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sourceUrl'],
          message: 'Demo records cannot claim a source URL.',
        })
      }
      if (meme.originalContext) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['originalContext'],
          message: 'Demo records have no verified original context.',
        })
      }
    }

    if (meme.verificationStatus === 'verified') {
      if (!meme.sourceUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sourceUrl'],
          message: 'Verified records need a source URL.',
        })
      }
    }
  })

export const memeListSchema = z.array(memeSchema).min(1)

export const searchRequestSchema = z.object({
  query: z.string().trim().min(2, 'اكتب الموقف في كلمتين على الأقل').max(500),
  categories: z.array(z.enum(CATEGORY_IDS)).max(8).optional(),
  reactions: z.array(z.enum(REACTION_IDS)).max(8).optional(),
  sources: z.array(z.enum(SOURCE_IDS)).max(2).optional(),
  limit: z.number().int().min(1).max(12).optional(),
})

export type SearchRequest = z.infer<typeof searchRequestSchema>

export function parseMemeDataset(data: unknown): MemeRecord[] {
  const memes = memeListSchema.parse(data)
  const ids = new Set<string>()
  const images = new Set<string>()
  for (const meme of memes) {
    if (ids.has(meme.id)) {
      throw new Error(`Duplicate meme id: ${meme.id}`)
    }
    if (images.has(meme.imagePath)) {
      throw new Error(`Duplicate image path: ${meme.imagePath}`)
    }
    ids.add(meme.id)
    images.add(meme.imagePath)
  }
  return memes
}
