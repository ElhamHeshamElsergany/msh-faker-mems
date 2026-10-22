import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MemeRecord } from '@msh/shared'
import { favoriteFromMeme, readFavorites, writeFavorites, type FavoriteEntry } from '../lib/favorites'

interface FavoritesApi {
  items: FavoriteEntry[]
  has: (id: string) => boolean
  toggle: (meme: MemeRecord, caption: string) => void
  updateCaption: (id: string, caption: string) => void
  remove: (id: string) => void
}

const FavoritesContext = createContext<FavoritesApi | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteEntry[]>(() => readFavorites())

  useEffect(() => {
    try {
      writeFavorites(items)
    } catch {
      // Storage can be unavailable in private browsing. The in-memory list still works for this visit.
    }
  }, [items])

  const api = useMemo<FavoritesApi>(
    () => ({
      items,
      has: (id) => items.some((item) => item.id === id),
      toggle: (meme, caption) => {
        setItems((current) => {
          if (current.some((item) => item.id === meme.id)) {
            return current.filter((item) => item.id !== meme.id)
          }
          return [favoriteFromMeme(meme, caption), ...current]
        })
      },
      updateCaption: (id, caption) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, caption } : item)))
      },
      remove: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    }),
    [items],
  )

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesApi {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider')
  return value
}
