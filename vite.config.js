import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Endereço público do site, usado nas metatags (link canônico e imagem de compartilhamento).
// No Netlify, a variável URL já vem preenchida com o endereço do site (ex.: https://seu-site.netlify.app).
// Para um domínio próprio, defina SITE_URL nas variáveis de ambiente do Netlify.
const siteUrl = (process.env.SITE_URL || process.env.URL || 'http://localhost:4173').replace(/\/$/, '')

const siteUrlInHtml = {
  name: 'site-url-in-html',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), siteUrlInHtml],
})
