import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { certificates, education, experience } from '../data/career.js'
import { ExternalLink } from './ui.jsx'

export default function Experience() {
  const { t, pick } = useLanguage()

  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <h2 id="experience-title" className="section__title">
          {t('experience.title')}
        </h2>

        <div className="career">
          <div>
            <h3 className="career__heading">{t('experience.work')}</h3>
            {experience.map((job) => (
              <div className="job" key={job.company}>
                <p className="job__company">{job.company}</p>
                <ol className="timeline">
                  {job.roles.map((role) => (
                    <li key={pick(role.title)}>
                      <p className="timeline__title">{pick(role.title)}</p>
                      <p className="timeline__meta">{pick(role.period)}</p>
                      {pick(role.activities).length > 0 && (
                        <ul className="plainlist">
                          {pick(role.activities).map((activity) => (
                            <li key={activity}>{activity}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div>
            <h3 className="career__heading">{t('experience.education')}</h3>
            <ol className="timeline">
              {education.map((item) => (
                <li key={pick(item.course)} className={`is-${item.status}`}>
                  <p className="timeline__title">{pick(item.institution)}</p>
                  <p className="timeline__course">{pick(item.course)}</p>
                  <p className="timeline__meta">
                    <span className={`edu-status edu-status--${item.status}`}>{t(`experience.eduStatus.${item.status}`)}</span>{' '}
                    {pick(item.detail)}
                  </p>
                </li>
              ))}
            </ol>

            {certificates.length > 0 && (
              <>
                <h3 className="career__heading">{t('experience.certificates')}</h3>
                <ul className="plainlist">
                  {certificates.map((cert) => (
                    <li key={cert.name}>
                      {cert.url ? <ExternalLink href={cert.url}>{cert.name}</ExternalLink> : cert.name}, {cert.issuer}
                      {cert.year && ` (${cert.year})`}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
