import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { projects } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import { BrandIcon, CodeExcerpt, ExternalLink, StatusBadge } from './ui.jsx'

const imagePath = (src, width) => asset(`images/projects/${src}-${width}.webp`)

function Gallery({ project }) {
  const { t, pick } = useLanguage()
  const [index, setIndex] = useState(0)
  const image = project.images[index]
  const tall = image.height > image.width

  return (
    <div className="gallery">
      <figure className={`gallery__main ${tall ? 'is-tall' : ''}`}>
        <a href={imagePath(image.src, 1280)} target="_blank" rel="noopener noreferrer" title={t('projects.openImage')}>
          <img
            key={image.src}
            src={imagePath(image.src, 1280)}
            srcSet={`${imagePath(image.src, 640)} 640w, ${imagePath(image.src, 1280)} 1280w`}
            sizes="(min-width: 960px) 560px, 100vw"
            width={image.width}
            height={image.height}
            alt={pick(image.alt)}
            loading="lazy"
            decoding="async"
          />
          <span className="visually-hidden"> {t('external')}</span>
        </a>
        <figcaption>{pick(image.alt)}</figcaption>
      </figure>

      {project.images.length > 1 && (
        <div className="gallery__thumbs" role="group" aria-label={`${t('projects.gallery')}: ${project.name}`}>
          {project.images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              aria-pressed={i === index}
              aria-label={t('projects.showImage', { n: i + 1, total: project.images.length })}
              onClick={() => setIndex(i)}
            >
              <img src={imagePath(img.src, 640)} alt="" width={img.width} height={img.height} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCase({ project }) {
  const { t, pick } = useLanguage()
  const titleId = `project-${project.id}`

  return (
    <article className="case" aria-labelledby={titleId}>
      <header className="case__head">
        <h3 id={titleId} className="case__name">
          {project.name}
        </h3>
        <StatusBadge status={project.status} />
      </header>

      <p className="case__summary">{pick(project.summary)}</p>
      {project.commercial && <p className="case__note">{pick(project.commercial)}</p>}

      <div className="case__links">
        <ExternalLink className="button" href={project.repo}>
          <BrandIcon name="github" />
          {t('projects.repo')}
        </ExternalLink>
        {project.demo && (
          <ExternalLink className="button button--primary" href={project.demo}>
            {t('projects.demo')}
          </ExternalLink>
        )}
      </div>

      <div className="case__body">
        <Gallery project={project} />

        <div className="case__details">
          <h4>{t('projects.problem')}</h4>
          <p>{pick(project.problem)}</p>

          <h4>{t('projects.role')}</h4>
          <p>{pick(project.role)}</p>

          <h4>{t('projects.stack')}</h4>
          <ul className="tags">
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="case__columns">
        <div>
          <h4>{t('projects.features')}</h4>
          <ul className="checklist">
            {pick(project.features).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          {project.nextSteps && (
            <>
              <h4>{t('projects.nextSteps')}</h4>
              <ul className="plainlist">
                {pick(project.nextSteps).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </>
          )}
          {project.learnings && (
            <>
              <h4>{t('projects.learnings')}</h4>
              <p>{pick(project.learnings)}</p>
            </>
          )}
        </div>

        {project.decisions && (
          <div className="decisions">
            <h4>{t('projects.decisions')}</h4>
            {project.code && <CodeExcerpt code={project.code} repo={project.repo} label={t('projects.code')} />}
            <dl>
              {project.decisions.map((decision) => (
                <div key={pick(decision.title)}>
                  <dt>{pick(decision.title)}</dt>
                  <dd>{pick(decision.text)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Projects() {
  const { t } = useLanguage()
  return (
    <section className="section section--projects" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <h2 id="projects-title" className="section__title">
          {t('projects.title')}
        </h2>
        <p className="section__intro">{t('projects.intro')}</p>
        {projects.map((project) => (
          <ProjectCase key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
