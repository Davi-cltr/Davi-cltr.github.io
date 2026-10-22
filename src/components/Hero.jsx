import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { asset } from '../lib/asset.js'

export function Photo() {
  const { t } = useLanguage()
  if (profile.photo) {
    return (
      <img
        className="photo"
        src={asset(profile.photo)}
        alt={t('photo.alt')}
        width="480"
        height="600"
        fetchPriority="high"
      />
    )
  }
  // Sem foto ainda: monograma no mesmo formato, para o layout não mudar depois.
  return (
    <div className="photo photo--empty" aria-hidden="true">
      <span>DM</span>
    </div>
  )
}

export default function Hero() {
  const { t, pick } = useLanguage()
  const [first, ...rest] = profile.name.split(' ')

  return (
    <section className="hero" id="top" aria-labelledby="hero-name">
      <div className="container hero__grid">
        <div className="hero__text">
          <p className="hero__role">{pick(profile.role)}</p>
          <h1 id="hero-name" className="hero__name">
            {first}
            <br />
            {rest.join(' ')}
          </h1>
          <p className="hero__tagline">
            {pick(profile.tagline)}
            <span className="cursor" aria-hidden="true" />
          </p>
          <p className="hero__intro">{pick(profile.intro)}</p>
          <div className="hero__actions">
            <a className="button button--primary" href="#projects">
              {t('hero.projects')}
            </a>
            <a className="button" href="#contact">
              {t('hero.contact')}
            </a>
          </div>
        </div>
        <div className="hero__photo">
          <Photo />
        </div>
      </div>
    </section>
  )
}
