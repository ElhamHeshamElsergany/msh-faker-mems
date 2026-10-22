import type { MemeRecord, SourceId } from '@msh/shared'

const STORAGE_KEY = 'msh-faker-mems-favorites'

export interface FavoriteEntry {
  id: string
  savedAt: string
  caption: string
  label: string
  imagePath: string
  verificationStatus: SourceId
}

function isEntry(value: unknown): value is FavoriteEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<FavoriteEntry>
  return (
    typeof entry.id === 'string' &&
    typeof entry.savedAt === 'string' &&
    typeof entry.caption === 'string' &&
    typeof entry.label === 'string' &&
    typeof entry.imagePath === 'string' &&
    (entry.verificationStatus === 'demo' || entry.verificationStatus === 'verified')
  )
}

export function readFavorites(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isEntry) : []
  } catch {
    return []
  }
}

export function writeFavorites(entries: FavoriteEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function favoriteFromMeme(meme: MemeRecord, caption: string): FavoriteEntry {
  return {
    id: meme.id,
    savedAt: new Date().toISOString(),
    caption,
    label: meme.label,
    imagePath: meme.imagePath,
    verificationStatus: meme.verificationStatus,
  }
}
