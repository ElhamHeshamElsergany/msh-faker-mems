import { describe, expect, it } from 'vitest'
import { parseModelJson } from './openai.js'

describe('parseModelJson', () => {
  it('keeps allowed labels and drops invented categories', () => {
    const parsed = parseModelJson(
      '```json\n{"categories":["work","movie-star"],"reactions":["frustration"],"keywords":["مدير"],"intentSummary":"شغل","suggestedCaption":"تعديل بسيط يعني بكرة"}\n```',
    )
    expect(parsed.categories).toEqual(['work'])
    expect(parsed.reactions).toEqual(['frustration'])
    expect(parsed.keywords).toEqual(['مدير'])
    expect(parsed.suggestedCaption).toContain('تعديل')
  })
})
