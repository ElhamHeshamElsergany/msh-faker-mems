import type { MemeRecord, SearchRequest, SearchResponse } from '@msh/shared'
import { mockMeme, mockSearch } from './mock'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function mockEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
}

export function getApiBaseUrl(): string | null {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (import.meta.env.DEV) return ''
  return null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl()
  if (base === null) {
    throw new ApiError('عنوان الـ API مش متظبط في النسخة المنشورة. شوف خطوات ربط الخادم في ملف التشغيل.', 0)
  }

  let response: Response
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError('مش قادرين نوصل للخادم. تأكد إنه شغال وجرّب تاني.', 0)
  }

  if (!response.ok) {
    let message = 'حصل خطأ أثناء الطلب.'
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && 'error' in body) {
        const error = body.error
        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
          message = error.message
        }
      }
    } catch {
      message = 'حصل خطأ أثناء الطلب.'
    }
    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<T>
}

export function searchMemes(body: SearchRequest): Promise<SearchResponse> {
  if (mockEnabled()) return mockSearch(body)
  return request<SearchResponse>('/api/memes/search', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getMeme(id: string): Promise<MemeRecord> {
  if (mockEnabled()) {
    const meme = await mockMeme(id)
    if (!meme) throw new ApiError('السجل ده مش موجود في المجموعة.', 404)
    return meme
  }
  const payload = await request<{ meme: MemeRecord }>(`/api/memes/${encodeURIComponent(id)}`)
  return payload.meme
}

export interface TaxonomyResponse {
  categories: { id: string; label: string }[]
  reactions: { id: string; label: string }[]
  sources: { id: string; label: string }[]
}

export function getTaxonomy(): Promise<TaxonomyResponse> {
  return request<TaxonomyResponse>('/api/categories')
}
