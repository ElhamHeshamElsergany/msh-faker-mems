import type { MemeRecord } from '@msh/shared'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createJsonRepository } from './repositories/jsonRepository.js'

const config = loadConfig({
  NODE_ENV: 'test',
  PORT: '3001',
  HOST: '0.0.0.0',
  CORS_ORIGINS: 'http://localhost:5173',
})

const repository = createJsonRepository()
const app = createApp(config, repository, { supabase: 'unused' })

describe('api', () => {
  it('reports health without claiming an AI provider', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.ai).toBe('off')
    expect(response.body.dataSource).toBe('json')
    expect(response.body.memeCount).toBeGreaterThan(0)
    expect(response.headers['x-powered-by']).toBeUndefined()
  })

  it('lists categories', async () => {
    const response = await request(app).get('/api/categories')
    expect(response.status).toBe(200)
    expect(response.body.categories.map((item: { id: string }) => item.id)).toContain('work')
    expect(response.body.reactions.length).toBeGreaterThan(0)
  })

  it('rejects a short search and ranks a real situation', async () => {
    const invalid = await request(app).post('/api/memes/search').send({ query: 'ا' })
    expect(invalid.status).toBe(400)
    expect(invalid.body.error.code).toBe('VALIDATION')

    const response = await request(app)
      .post('/api/memes/search')
      .send({ query: 'لما المدير يقول فيه تعديل بسيط قبل ما نمشي بخمس دقايق' })
    expect(response.status).toBe(200)
    expect(response.body.engine).toBe('local')
    expect(response.body.aiConfigured).toBe(false)
    expect(response.body.results[0].meme.id).toBe('demo-last-minute-edit')
    expect(response.body.results[0].meme.verificationStatus).toBe('demo')
    expect(response.body.results[0].meme.characterName).toBeNull()
  })

  it('returns an honest empty message instead of a random meme', async () => {
    const response = await request(app)
      .post('/api/memes/search')
      .send({ query: 'وصفة كيكة الشوكولاتة بالمقادير' })
    expect(response.status).toBe(200)
    expect(response.body.results).toEqual([])
    expect(response.body.message).toContain('ملقناش')
  })

  it('returns one meme and a 404 for an unknown id', async () => {
    const found = await request(app).get('/api/memes/demo-good-news')
    expect(found.status).toBe(200)
    expect(found.body.meme.label).toBe('خبر حلو فجأة')

    const missing = await request(app).get('/api/memes/not-a-real-meme')
    expect(missing.status).toBe(404)
    expect(missing.body.error.code).toBe('NOT_FOUND')
  })

  it('does not invent trending traffic', async () => {
    const response = await request(app).get('/api/memes/trending')
    expect(response.status).toBe(200)
    expect(response.body.basis).toBe('dataset-order')
    expect(response.body.items.length).toBeGreaterThan(0)
    expect(JSON.stringify(response.body)).not.toContain('views')
  })

  it('rejects an oversized body', async () => {
    const response = await request(app)
      .post('/api/memes/search')
      .send({ query: 'موقف '.repeat(8000) })
    expect(response.status).toBe(413)
  })

  it('does not allow an unknown origin', async () => {
    const response = await request(app).get('/api/health').set('Origin', 'https://evil.example')
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('allows the configured frontend origin', async () => {
    const response = await request(app).get('/api/health').set('Origin', 'http://localhost:5173')
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })
})

describe('loadConfig', () => {
  it('requires CORS origins in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production', PORT: '3001' })).toThrow(/CORS_ORIGINS/)
  })
})

describe('repository contract', () => {
  it('reads the seed dataset through the json repository', async () => {
    const memes = await repository.list()
    const sample: MemeRecord | undefined = memes[0]
    expect(sample?.verificationStatus).toBe('demo')
    expect(await repository.getById('missing')).toBeNull()
  })
})
