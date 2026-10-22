import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { asset } from '../lib/asset.js'
import { BrandIcon, ExternalLink } from './ui.jsx'

export default function Contact() {
  const { t } = useLanguage()
  const { email, github, linkedin } = profile.contact
  const [copyState, setCopyState] = useState('idle') // idle | copied | failed

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 4000)
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

  return (
    <section className="section section--contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <h2 id="contact-title" className="section__title">
          {t('contact.title')}
        </h2>
        <p className="section__intro">{t('contact.text')}</p>

        <a className="contact__email" href={`mailto:${email}`}>
          {email}
        </a>

        <div className="contact__actions">
          <a className="button button--primary" href={`mailto:${email}`}>
            {t('contact.email')}
          </a>
          <button type="button" className="button" onClick={copyEmail}>
            {t('contact.copy')}
          </button>
          {profile.resume && (
            <a className="button" href={asset(profile.resume)} download>
              {t('contact.resume')}
            </a>
          )}
        </div>
        <p className={`contact__feedback ${copyState === 'failed' ? 'is-error' : ''}`} role="status" aria-live="polite">
          {copyState === 'copied' && t('contact.copied')}
          {copyState === 'failed' && t('contact.copyFailed')}
        </p>

        <ul className="contact__profiles">
          <li>
            <ExternalLink href={github}>
              <BrandIcon name="github" />
              GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={linkedin}>
              <BrandIcon name="linkedin" />
              LinkedIn
            </ExternalLink>
          </li>
        </ul>
      </div>
    </section>
  )
}
