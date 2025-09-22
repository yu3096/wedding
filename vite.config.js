import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import path from 'path'

// If deploying to GitHub Pages, set VITE_BASE=/REPO_NAME/ via env or edit 'base' below.
export default defineConfig({
  plugins: [react(), imagetools()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: process.env.VITE_BASE || '/'
})
