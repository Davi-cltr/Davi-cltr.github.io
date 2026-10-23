import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { strings } from './strings.js'

export const LANGUAGES = ['pt', 'en']
const STORAGE_KEY = 'portfolio-lang'

const LanguageContext = createContext(null)

// Ordem de escolha: ?lang= na URL, preferência salva, idioma do navegador, português.
function initialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (LANGUAGES.includes(fromUrl)) return fromUrl
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.includes(saved)) return saved
  } catch {
    // Armazenamento bloqueado: segue com o padrão.
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

function lookup(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage)

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return
    // Troca com um fade cruzado quando o navegador suporta View Transitions
    // e a pessoa não pediu menos movimento; senão, troca direto.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !calm) {
      document.startViewTransition(() => flushSync(() => setLangState(next)))
    } else {
      setLangState(next)
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Sem armazenamento, a escolha vale só nesta visita.
    }
    const url = new URL(window.location.href)
    url.searchParams.set('lang', next)
    window.history.replaceState(null, '', url)
  }, [])

  // Mantém <html lang>, título e descrição em sincronia com o idioma.
  useEffect(() => {
    const meta = strings[lang].meta
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [lang])

  const value = useMemo(() => {
    // t('nav.about') → texto da interface; aceita {variáveis}.
    const t = (key, vars) => {
      let text = lookup(strings[lang], key) ?? lookup(strings.pt, key) ?? key
      if (vars && typeof text === 'string') {
        for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v)
      }
      return text
    }
    // pick({ pt, en }) → conteúdo no idioma atual; strings passam direto.
    const pick = (field) => {
      if (field == null || typeof field !== 'object' || Array.isArray(field)) return field
      return field[lang] ?? field.pt
    }
    return { lang, setLang, t, pick }
  }, [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage precisa estar dentro de <LanguageProvider>')
  return ctx
}
