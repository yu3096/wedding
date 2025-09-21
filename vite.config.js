import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If deploying to GitHub Pages, set VITE_BASE=/REPO_NAME/ via env or edit 'base' below.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/'
})
