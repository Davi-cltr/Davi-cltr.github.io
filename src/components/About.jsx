import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'

export default function About() {
  const { t, pick } = useLanguage()
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="container">
        <h2 id="about-title" className="section__label">
          {t('about.title')}
        </h2>

        <p className="about__statement" data-reveal>
          {pick(profile.statement)}
        </p>

        <div className="about__body">
          <div className="prose" data-reveal>
            {pick(profile.about).map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="about__aside" data-reveal style={{ '--d': 1 }}>
            <dl className="facts">
              {profile.facts.map((fact) => (
                <div key={pick(fact.label)}>
                  <dt>{pick(fact.label)}</dt>
                  <dd>{pick(fact.value)}</dd>
                </div>
              ))}
            </dl>
            <h3 className="about__goals-title">{t('about.goals')}</h3>
            <p className="about__goals">{pick(profile.goals)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
