import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'
import App from './App.jsx'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
import '@fontsource/jetbrains-mono/400.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/chrome.css'
import './styles/hero.css'
import './styles/about.css'
import './styles/skills.css'
import './styles/projects.css'
import './styles/journey.css'
import './styles/contact.css'

// A abertura animada roda uma vez por sessão; ao voltar para a página, ela já aparece pronta.
try {
  if (sessionStorage.getItem('intro-seen')) document.documentElement.classList.add('intro-seen')
  else sessionStorage.setItem('intro-seen', '1')
} catch {
  // Sem armazenamento: a abertura simplesmente roda.
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
