import { useEffect, useState } from 'react'
import { LANGUAGES, useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'

const SECTIONS = ['about', 'skills', 'projects', 'experience', 'contact']

export function LanguageSwitch({ className = '' }) {
  const { lang, setLang, t } = useLanguage()
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t('lang.label')}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code === 'pt' ? 'pt-BR' : 'en'}
          aria-pressed={lang === code}
          aria-label={t(`lang.${code}`)}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  // Fecha o menu do celular com Esc.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" className="site-header__name">
          {profile.name}
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__bars" aria-hidden="true" />
          <span className="visually-hidden">{open ? t('nav.close') : t('nav.open')}</span>
        </button>

        <nav id="site-nav" className={`site-nav ${open ? 'is-open' : ''}`} aria-label={t('nav.label')}>
          <ul>
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={() => setOpen(false)}>
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
          <LanguageSwitch />
        </nav>
      </div>
    </header>
  )
}
