import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { useActiveSection } from '../lib/motion.js'

const SECTIONS = ['about', 'skills', 'projects', 'journey', 'contact']

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

// Linha âmbar no topo que acompanha a rolagem da página.
function ReadingProgress() {
  const bar = useRef(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      bar.current?.style.setProperty('--progress', p.toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return <div className="reading-progress" ref={bar} aria-hidden="true" />
}

export default function Header() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggle = useRef(null)
  const active = useActiveSection(SECTIONS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menu do celular: trava a rolagem, desativa o resto da página e fecha com Esc.
  useEffect(() => {
    const outside = [document.getElementById('main'), document.querySelector('.site-footer')]
    document.documentElement.classList.toggle('menu-open', open)
    outside.forEach((el) => el && (el.inert = open))
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <ReadingProgress />
      <div className="container site-header__inner">
        <a href="#top" className="site-header__name" onClick={() => setOpen(false)}>
          {profile.name}
          <span className="site-header__dot" aria-hidden="true" />
        </a>

        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__bars" aria-hidden="true" />
          <span className="visually-hidden">{open ? t('nav.close') : t('nav.open')}</span>
        </button>

        <nav id="site-nav" className="site-nav" aria-label={t('nav.label')}>
          <ul>
            {SECTIONS.map((id, i) => (
              <li key={id} style={{ '--i': i }}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
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
