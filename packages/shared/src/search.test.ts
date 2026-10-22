import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { normalizeArabic } from './normalize.js'
import { parseMemeDataset } from './schema.js'
import { searchMemes } from './search.js'
import type { MemeRecord } from './types.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

function loadMemes(): MemeRecord[] {
  const raw = readFileSync(path.join(root, 'data', 'memes.json'), 'utf8')
  return parseMemeDataset(JSON.parse(raw))
}

describe('normalizeArabic', () => {
  it('folds alef variants, ta marbuta, alef maqsura, and diacritics', () => {
    expect(normalizeArabic('إِمْتِحَانٌ أَهْلَى')).toBe('امتحان اهلي')
    expect(normalizeArabic('دقيقة')).toBe('دقيقه')
    expect(normalizeArabic('على')).toBe('علي')
  })

  it('drops punctuation and keeps the words', () => {
    expect(normalizeArabic('تعديل، بسيط!')).toBe('تعديل بسيط')
  })

  it('maps eastern digits', () => {
    expect(normalizeArabic('٥ دقايق')).toBe('5 دقايق')
  })
})

describe('searchMemes', () => {
  const memes = loadMemes()

  it('ranks the last-minute work situation first', () => {
    const outcome = searchMemes(memes, 'لما المدير يقول فيه تعديل بسيط قبل ما نمشي بخمس دقايق')
    expect(outcome.results.length).toBeGreaterThan(0)
    expect(outcome.results[0]?.meme.id).toBe('demo-last-minute-edit')
    expect(outcome.results[0]?.confidence).not.toBe('low')
    expect(outcome.analysis.categories).toContain('work')
    expect(outcome.results.map((item) => item.meme.id)).not.toContain('demo-mom-one-minute')
    const ids = outcome.results.map((item) => item.meme.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('finds studying, family, and chat situations', () => {
    expect(searchMemes(memes, 'لما حد يسألني ذاكرت ولا لسه وأنا مفتحتش الكتاب').results[0]?.meme.id).toBe(
      'demo-closed-book',
    )
    expect(searchMemes(memes, 'لما ماما تقول تعال دقيقة بس').results[0]?.meme.id).toBe('demo-mom-one-minute')
    expect(searchMemes(memes, 'بعَت الرسالة في الشات الغلط').results[0]?.meme.id).toBe('demo-wrong-chat')
  })

  it('returns no results instead of a weak match', () => {
    const outcome = searchMemes(memes, 'وصفة كيكة الشوكولاتة بالتفصيل والمقادير')
    expect(outcome.results).toEqual([])
    expect(outcome.emptyReason).toBe('low-confidence')
  })

  it('respects a source filter that excludes the whole catalog', () => {
    const outcome = searchMemes(memes, 'تعديل بسيط من المدير', { sources: ['verified'] })
    expect(outcome.results).toEqual([])
    expect(outcome.emptyReason).toBe('filters')
  })

  it('keeps a suggested caption from the matched record', () => {
    const top = searchMemes(memes, 'الرسالة متشافة على الواتساب من غير رد').results[0]
    expect(top?.meme.id).toBe('demo-seen-no-reply')
    expect(top?.suggestedCaption.length).toBeGreaterThan(2)
    expect(top?.meme.exampleCaptions).toContain(top?.suggestedCaption)
  })
})
