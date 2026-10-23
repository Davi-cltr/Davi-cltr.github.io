import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { asset } from '../lib/asset.js'
import { prefersReducedMotion } from '../lib/motion.js'
import { ArrowIcon, BrandIcon, ExternalLink, trackPointerLight } from './ui.jsx'

// Botões que se inclinam levemente na direção do cursor (só com mouse).
const magnetic = {
  onPointerMove(e) {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    el.style.translate = `${(x * 5).toFixed(1)}px ${(y * 4).toFixed(1)}px`
  },
  onPointerLeave(e) {
    e.currentTarget.style.translate = ''
  },
}

function CopyIcon({ done }) {
  return (
    <span className={`copy-icon ${done ? 'is-done' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16" className="copy-icon__copy">
        <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <svg viewBox="0 0 16 16" width="16" height="16" className="copy-icon__check">
        <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function Contact() {
  const { t } = useLanguage()
  const { email, github, linkedin } = profile.contact
  const [copyState, setCopyState] = useState('idle') // idle | copied | failed

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 3200)
    return () => clearTimeout(timer)
  }, [copyState])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const [user, domain] = email.split('@')

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="contact__horizon" aria-hidden="true" />
      <div className="container contact__inner">
        <h2 id="contact-title" className="contact__title" data-reveal>
          {t('contact.title')}
        </h2>
        <p className="contact__text" data-reveal style={{ '--d': 1 }}>
          {t('contact.text')}
        </p>

        <a className="contact__email" href={`mailto:${email}`} onPointerMove={trackPointerLight} data-reveal style={{ '--d': 2 }}>
          <span>{user}</span>
          <wbr />
          <span className="contact__at">@{domain}</span>
        </a>

        <div className="contact__actions" data-reveal style={{ '--d': 3 }}>
          <a className="button button--primary" href={`mailto:${email}`} {...magnetic}>
            {t('contact.email')}
            <ArrowIcon />
          </a>
          <button type="button" className={`button ${copyState === 'copied' ? 'is-done' : ''}`} onClick={copyEmail} {...magnetic}>
            <CopyIcon done={copyState === 'copied'} />
            {copyState === 'copied' ? t('contact.copied') : t('contact.copy')}
          </button>
          {profile.resume && (
            <a className="button" href={asset(profile.resume)} download {...magnetic}>
              {t('contact.resume')}
            </a>
          )}
        </div>
        <p className={`contact__feedback ${copyState === 'failed' ? 'is-error' : ''}`} role="status" aria-live="polite">
          {copyState === 'copied' && <span className="visually-hidden">{t('contact.copied')}</span>}
          {copyState === 'failed' && t('contact.copyFailed')}
        </p>

        <ul className="contact__profiles" data-reveal style={{ '--d': 4 }}>
          <li>
            <ExternalLink href={github}>
              <BrandIcon name="github" size={20} />
              <span>GitHub</span>
              <span className="contact__handle" translate="no">
                Davi-cltr
              </span>
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={linkedin}>
              <BrandIcon name="linkedin" size={20} />
              <span>LinkedIn</span>
              <span className="contact__handle" translate="no">
                davi-motta-peluci
              </span>
            </ExternalLink>
          </li>
        </ul>
      </div>
    </section>
  )
}
