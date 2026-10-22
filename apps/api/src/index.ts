import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { log } from './logger.js'
import { createRepository } from './repositories/createRepository.js'

const here = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(here, '../.env') })
dotenv.config({ path: path.resolve(here, '../../../.env') })

const config = loadConfig()
const { repository, supabase } = await createRepository(config)
const app = createApp(config, repository, { supabase })

const server = app.listen(config.port, config.host, () => {
  log('info', 'api listening', {
    host: config.host,
    port: config.port,
    dataSource: repository.source,
    supabase,
    ai: config.openaiApiKey ? 'configured' : 'off',
  })
})

function shutdown(signal: string): void {
  log('info', 'api shutting down', { signal })
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
