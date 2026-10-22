import { useCallback, useState } from 'react'
import type { SearchRequest, SearchResponse } from '@msh/shared'
import { ApiError, searchMemes } from '../api/client'

export function useMemeSearch() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (request: SearchRequest) => {
    setStatus('loading')
    setError(null)
    try {
      const result = await searchMemes(request)
      setResponse(result)
      setStatus('ready')
    } catch (caught) {
      setResponse(null)
      setStatus('error')
      setError(caught instanceof ApiError ? caught.message : 'حصل خطأ غير متوقع.')
    }
  }, [])

  return { status, response, error, search }
}
