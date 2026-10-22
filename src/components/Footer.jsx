import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { LanguageSwitch } from './Header.jsx'
import { ExternalLink } from './ui.jsx'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          <strong>{profile.fullName}</strong>
          <br />
          {t('footer.role')}
        </p>
        <ul className="site-footer__links">
          <li>
            <a href={`mailto:${profile.contact.email}`}>E-mail</a>
          </li>
          <li>
            <ExternalLink href={profile.contact.github}>GitHub</ExternalLink>
          </li>
          <li>
            <ExternalLink href={profile.contact.linkedin}>LinkedIn</ExternalLink>
          </li>
          <li>
            <a href="#top">{t('footer.top')}</a>
          </li>
        </ul>
        <LanguageSwitch />
      </div>
    </footer>
  )
}
