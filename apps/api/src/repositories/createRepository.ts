import type { AppConfig } from '../config.js'
import { log } from '../logger.js'
import { createJsonRepository } from './jsonRepository.js'
import { createSupabaseRepository } from './supabaseRepository.js'
import type { MemeRepository, SupabaseState } from './types.js'

export async function createRepository(config: AppConfig): Promise<{ repository: MemeRepository; supabase: SupabaseState }> {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return { repository: createJsonRepository(config.memeDataPath), supabase: 'unused' }
  }

  try {
    const repository = createSupabaseRepository(config.supabaseUrl, config.supabaseServiceRoleKey)
    const memes = await repository.list()
    if (!memes.length) {
      log('warn', 'supabase meme table is empty; using the local dataset')
      return { repository: createJsonRepository(config.memeDataPath), supabase: 'unavailable' }
    }
    log('info', 'meme repository ready', { dataSource: 'supabase', memeCount: memes.length })
    return { repository, supabase: 'active' }
  } catch (error) {
    log('warn', 'supabase meme repository unavailable; using the local dataset', {
      reason: error instanceof Error ? error.message : 'unknown',
    })
    return { repository: createJsonRepository(config.memeDataPath), supabase: 'unavailable' }
  }
}
