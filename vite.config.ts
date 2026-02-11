import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/topik-play-demo/',
  plugins: [react(), tailwindcss()],
})
