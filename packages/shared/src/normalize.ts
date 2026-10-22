const DIACRITICS = /[\u064B-\u065F\u0670\u0640]/g
const EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/**
 * Normalize Arabic for matching while the original text stays available for display.
 * Alef variants, alef maqsura, and ta marbuta are folded. Diacritics and tatweel are removed.
 */
export function normalizeArabic(input: string): string {
  const folded = input
    .replace(DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (digit) => String(EASTERN_DIGITS.indexOf(digit)))
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  return folded
}

const SYNONYM_GROUPS = [
  ['دقايق', 'دقائق', 'دقيقه'],
  ['عايز', 'عاوز', 'عايزه', 'عاوزه'],
  ['كده', 'كدا'],
  ['اوي', 'قوي', 'اوى'],
  ['دلوقتي', 'دلوقت'],
  ['ذاكرت', 'زاكرت'],
  ['مذاكره', 'مذاكر'],
  ['امتحان', 'امتحانات'],
  ['رساله', 'رساله', 'مساج', 'مسج'],
  ['واتساب', 'واتس', 'الواتس'],
  ['ايميل', 'اميل', 'ايميلات'],
  ['شات', 'شاتات'],
  ['متشاف', 'متشافه'],
]

const STOP_WORDS = new Set([
  'لما',
  'يقول',
  'تقول',
  'فيه',
  'في',
  'قبل',
  'ما',
  'و',
  'من',
  'علي',
  'على',
  'يا',
  'هو',
  'هي',
  'ان',
  'انا',
  'الي',
  'اللي',
  'ده',
  'دي',
  'بس',
  'عشان',
  'او',
  'ثم',
  'بعد',
  'مع',
  'عن',
  'الي',
  'الى',
  'حد',
  'انت',
  'اني',
  'اني',
  'كان',
  'كانت',
  'اني',
  'لو',
  'لا',
  'مش',
  'لسه',
  'لسا',
  'وانا',
  'وانا',
])

export function stripDefiniteArticle(token: string): string {
  if (token.startsWith('ال') && token.length > 4) return token.slice(2)
  return token
}

export function tokenVariants(token: string): string[] {
  const base = stripDefiniteArticle(token)
  const seeds = new Set<string>([token, base])
  if (/^[بفوكل]/.test(token) && token.length > 3) {
    const rest = token.slice(1)
    seeds.add(rest)
    seeds.add(stripDefiniteArticle(rest))
  }
  const expanded = new Set<string>()
  for (const seed of seeds) {
    expanded.add(seed)
    const group = SYNONYM_GROUPS.find((entry) => entry.includes(seed))
    if (group) {
      for (const item of group) expanded.add(item)
    }
  }
  return [...expanded]
}

export function canonicalToken(token: string): string {
  const group = SYNONYM_GROUPS.find((entry) => entry.includes(stripDefiniteArticle(token)) || entry.includes(token))
  return group?.[0] ?? stripDefiniteArticle(token)
}

export function tokenize(normalized: string): string[] {
  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token) && !STOP_WORDS.has(stripDefiniteArticle(token)))
}
