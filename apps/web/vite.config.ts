import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))
const datasetPath = path.resolve(root, '../../data/memes.json')

function normalizeBase(value: string | undefined): string {
  if (!value || value === '/') return '/'
  const withLead = value.startsWith('/') ? value : `/${value}`
  return withLead.endsWith('/') ? withLead : `${withLead}/`
}

function pagesPlugin(): Plugin {
  return {
    name: 'pages-extras',
    configureServer(server) {
      server.middlewares.use('/dataset/memes.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(readFileSync(datasetPath))
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'dataset/memes.json',
        source: readFileSync(datasetPath, 'utf8'),
      })
    },
    closeBundle() {
      const dist = path.join(root, 'dist')
      const index = path.join(dist, 'index.html')
      if (existsSync(index)) copyFileSync(index, path.join(dist, '404.html'))
    },
  }
}

export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE_PATH),
  plugins: [react(), pagesPlugin()],
  resolve: {
    alias: {
      '@msh/shared': path.resolve(root, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
