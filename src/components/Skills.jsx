import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { interests, skillGroups } from '../data/skills.js'

const LEVELS = ['work', 'project', 'learning']

export default function Skills() {
  const { t, pick } = useLanguage()
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container split">
        <div>
          <h2 id="skills-title" className="section__title">
            {t('skills.title')}
          </h2>
          <p className="section__intro">{t('skills.intro')}</p>
          <ul className="legend">
            {LEVELS.map((level) => (
              <li key={level}>
                <span className={`level-mark level-mark--${level}`} aria-hidden="true" />
                {t(`skills.levels.${level}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="skills">
          {skillGroups.map((group) => (
            <div className="skills__group" key={group.id}>
              <h3>{pick(group.title)}</h3>
              <dl>
                {group.items.map((item) => (
                  <div className="skill" key={pick(item.name)}>
                    <dt>{pick(item.name)}</dt>
                    <dd className="skill__level">
                      <span className={`level-mark level-mark--${item.level}`} aria-hidden="true" />
                      {t(`skills.levels.${item.level}`)}
                    </dd>
                    <dd className="skill__evidence">{pick(item.evidence)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="skills__group">
            <h3>{t('skills.interests')}</h3>
            <ul className="interests">
              {pick(interests).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
