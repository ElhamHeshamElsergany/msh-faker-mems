import {
  CATEGORIES,
  REACTIONS,
  SOURCES,
  searchRequestSchema,
  type SearchResponse,
} from '@msh/shared'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { ZodError } from 'zod'
import type { AppConfig } from './config.js'
import { HttpError } from './httpError.js'
import { log } from './logger.js'
import type { MemeRepository, SupabaseState } from './repositories/types.js'
import { runSearch } from './services/searchService.js'

interface AppMeta {
  supabase: SupabaseState
}

function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const started = Date.now()
  res.on('finish', () => {
    log('info', 'request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - started,
      contentLength: Number(req.headers['content-length'] ?? 0),
    })
  })
  next()
}

function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error)
    return
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION',
        message: 'البيانات اللي وصلت ناقصة أو أطول من اللازم.',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    })
    return
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } })
    return
  }

  const boom = error as { status?: number; type?: string }
  if (boom?.type === 'entity.too.large' || boom?.status === 413) {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'الطلب أكبر من المسموح.' } })
    return
  }
  if (boom?.type === 'entity.parse.failed' || (error instanceof SyntaxError && boom?.status === 400)) {
    res.status(400).json({ error: { code: 'BAD_JSON', message: 'الطلب مش JSON صالح.' } })
    return
  }

  log('error', 'unhandled error', { reason: error instanceof Error ? error.message : 'unknown' })
  res.status(500).json({ error: { code: 'INTERNAL', message: 'حصل خطأ في الخادم.' } })
}

export function createApp(config: AppConfig, repository: MemeRepository, meta: AppMeta) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(null, false)
      },
    }),
  )
  app.use(express.json({ limit: '16kb' }))
  app.use(requestLogger)

  const limiterOptions = {
    windowMs: 10 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
  } as const
  const readLimiter = rateLimit({
    ...limiterOptions,
    limit: config.env === 'test' ? 10_000 : 80,
  })
  const searchLimiter = rateLimit({
    ...limiterOptions,
    limit: config.env === 'test' ? 10_000 : 30,
  })

  app.get('/', (_req, res) => {
    res.json({ name: 'msh-faker-mems', health: '/api/health' })
  })

  app.get('/api/health', async (_req, res, next) => {
    try {
      const memes = await repository.list()
      res.json({
        status: 'ok',
        dataSource: repository.source,
        supabase: meta.supabase,
        ai: config.openaiApiKey ? 'configured' : 'off',
        memeCount: memes.length,
        uptimeSeconds: Math.round(process.uptime()),
      })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/categories', readLimiter, (_req, res) => {
    res.json({ categories: CATEGORIES, reactions: REACTIONS, sources: SOURCES })
  })

  app.post('/api/memes/search', searchLimiter, async (req, res, next) => {
    try {
      const body = searchRequestSchema.parse(req.body)
      const payload: SearchResponse = await runSearch(repository, config, body)
      res.json(payload)
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/memes/trending', readLimiter, async (_req, res, next) => {
    try {
      const items = await repository.list()
      res.json({
        basis: 'dataset-order',
        note: 'لا توجد إحصاءات استخدام حقيقية. الترتيب هو ترتيب السجلات المتاحة فقط.',
        items: items.slice(0, 6),
      })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/memes/:id', readLimiter, async (req, res, next) => {
    try {
      const id = req.params.id
      if (!id) throw new HttpError(404, 'NOT_FOUND', 'السجل ده مش موجود في المجموعة.')
      const meme = await repository.getById(id)
      if (!meme) {
        throw new HttpError(404, 'NOT_FOUND', 'السجل ده مش موجود في المجموعة.')
      }
      res.json({ meme })
    } catch (error) {
      next(error)
    }
  })

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المسار مش موجود.' } })
  })
  app.use(errorHandler)
  return app
}
