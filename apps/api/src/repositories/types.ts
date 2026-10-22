import type { MemeRecord } from '@msh/shared'

export interface MemeRepository {
  readonly source: 'json' | 'supabase'
  list(): Promise<MemeRecord[]>
  getById(id: string): Promise<MemeRecord | null>
}

export type SupabaseState = 'unused' | 'active' | 'unavailable'
