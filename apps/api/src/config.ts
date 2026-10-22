import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  CORS_ORIGINS: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  SUPABASE_URL: z.union([z.literal(''), z.string().url()]).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  MEME_DATA_PATH: z.string().optional(),
})

export interface AppConfig {
  env: 'development' | 'test' | 'production'
  port: number
  host: string
  corsOrigins: string[]
  openaiApiKey?: string
  openaiModel: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
  memeDataPath?: string
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env)
  const corsOrigins = (parsed.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (parsed.NODE_ENV === 'production' && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS is required in production')
  }

  return {
    env: parsed.NODE_ENV,
    port: parsed.PORT,
    host: parsed.HOST,
    corsOrigins: corsOrigins.length ? corsOrigins : ['http://localhost:5173'],
    openaiApiKey: blankToUndefined(parsed.OPENAI_API_KEY),
    openaiModel: blankToUndefined(parsed.OPENAI_MODEL) ?? 'gpt-4o-mini',
    supabaseUrl: blankToUndefined(parsed.SUPABASE_URL),
    supabaseServiceRoleKey: blankToUndefined(parsed.SUPABASE_SERVICE_ROLE_KEY),
    memeDataPath: blankToUndefined(parsed.MEME_DATA_PATH),
  }
}
