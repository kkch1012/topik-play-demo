import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vercel serves at the domain root ('/'), while GitHub Pages serves under
// '/topik-play-demo/'. Vercel sets process.env.VERCEL during its build, so we
// switch the base path accordingly to keep both deployments working.
export default defineConfig({
  base: process.env.VERCEL ? '/' : '/topik-play-demo/',
  plugins: [react(), tailwindcss()],
})
