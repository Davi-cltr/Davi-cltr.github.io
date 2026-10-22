import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'
import App from './App.jsx'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
import '@fontsource/jetbrains-mono/400.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
