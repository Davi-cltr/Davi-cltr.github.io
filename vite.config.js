import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// "base" é o caminho onde o site fica publicado.
// - Repositório Davi-cltr.github.io  → base '/'  (padrão)
// - Outro repositório, ex. "portfolio" → defina BASE_PATH=/portfolio/ no build
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
