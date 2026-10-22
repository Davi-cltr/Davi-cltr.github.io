import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'

export default function About() {
  const { t, pick } = useLanguage()
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container split">
        <h2 id="about-title" className="section__title">
          {t('about.title')}
        </h2>
        <div className="prose">
          {pick(profile.about).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <h3>{t('about.goals')}</h3>
          <p>{pick(profile.goals)}</p>
        </div>
      </div>
    </section>
  )
}
