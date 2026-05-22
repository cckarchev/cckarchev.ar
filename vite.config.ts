import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

// Without this, dev requests like `/tools/warmaster-map/` fall through to the
// SPA shell instead of `public/tools/warmaster-map/index.html`. Production
// static hosts resolve directory indexes natively, so this is dev-only.
const publicDirIndexFallback = {
  name: 'public-dir-index-fallback',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && req.url.endsWith('/') && req.url !== '/') {
        const candidate = join(server.config.publicDir, req.url, 'index.html')
        if (existsSync(candidate)) {
          req.url = req.url + 'index.html'
        }
      }
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), publicDirIndexFallback],
  server: {
    host: true,
    port: 8000,
  },
  preview: {
    host: true,
    port: 8000,
  },
})
