import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { projects } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import {
  ArrowIcon,
  BrandIcon,
  ExternalLink,
  StatusBadge,
  highlight,
  onTabsKeyDown,
  trackPointerLight,
} from './ui.jsx'

const imagePath = (src, width) => asset(`images/projects/${src}-${width}.webp`)

// Moldura de navegador: as abas são as capturas de tela do projeto.
function BrowserFrame({ project }) {
  const { t, pick } = useLanguage()
  const [index, setIndex] = useState(0)
  const image = project.images[index]
  const tall = image.height > image.width
  const base = `shot-${project.id}`

  return (
    <figure className="browser" onPointerMove={trackPointerLight}>
      <div className="browser__bar">
        <span className="browser__lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="browser__tabs" role="tablist" aria-label={`${t('projects.gallery')}: ${project.name}`}>
          {project.images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={i === index}
              aria-controls={`${base}-panel`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => onTabsKeyDown(e, project.images.length, i, setIndex)}
            >
              {pick(img.label)}
            </button>
          ))}
        </div>
      </div>
      <div className="browser__address" aria-hidden="true" translate="no">
        {project.address}
      </div>
      <div
        className={`browser__view ${tall ? 'is-tall' : ''}`}
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${index}`}
      >
        <a href={imagePath(image.src, 1280)} target="_blank" rel="noopener noreferrer" title={t('projects.openImage')}>
          <img
            key={image.src}
            src={imagePath(image.src, 1280)}
            srcSet={`${imagePath(image.src, 640)} 640w, ${imagePath(image.src, 1280)} 1280w`}
            sizes="(min-width: 1000px) 600px, 92vw"
            width={image.width}
            height={image.height}
            alt={pick(image.alt)}
            loading="lazy"
            decoding="async"
          />
          <span className="visually-hidden"> {t('external')}</span>
        </a>
      </div>
      <figcaption className="browser__caption">{pick(image.alt)}</figcaption>
    </figure>
  )
}

// Painel de código: mostra o arquivo real e acende as linhas da decisão escolhida.
function CodePanel({ code, repo }) {
  const { t } = useLanguage()
  const lit = new Set(code.highlight)
  const width = String(Math.max(...code.blocks.map((b) => b.start + b.lines.split('\n').length))).length

  return (
    <div className="code" key={code.file}>
      <div className="code__head">
        <span className="code__file" translate="no">
          {code.file}
        </span>
        <ExternalLink className="code__open" href={`${repo}/blob/HEAD/${code.file}`}>
          {t('projects.openFile')}
          <ArrowIcon size={14} />
        </ExternalLink>
      </div>
      <pre
        className="code__body"
        tabIndex={0}
        style={{ '--gutter': `${width + 1}ch` }}
        aria-label={t('projects.excerpt', { file: code.file, lines: code.highlight.join(', ') })}
        translate="no"
      >
        <code>
          {code.blocks.map((block, b) => (
            <span className="code__block" key={block.start}>
              {b > 0 && (
                <span className="code__gap" aria-hidden="true">
                  ⋯
                </span>
              )}
              {block.lines.split('\n').map((line, i) => {
                const n = block.start + i
                return (
                  <span className={`code__line ${lit.has(n) ? 'is-lit' : ''}`} key={n} style={{ '--n': i }}>
                    <span className="code__num" aria-hidden="true">
                      {n}
                    </span>
                    <span className="code__text">{line ? highlight(line) : ' '}</span>
                  </span>
                )
              })}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

function DecisionLab({ project }) {
  const { t, pick } = useLanguage()
  const [index, setIndex] = useState(0)
  const base = `decision-${project.id}`
  const current = project.decisions[index]

  return (
    <div className="lab" data-reveal>
      <div className="lab__intro">
        <h4 className="lab__title">{t('projects.decisions')}</h4>
        <p className="lab__hint">{t('projects.decisionsHint')}</p>
        <div className="lab__list" role="tablist" aria-orientation="vertical" aria-label={t('projects.decisions')}>
          {project.decisions.map((decision, i) => (
            <button
              key={decision.id}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={i === index}
              aria-controls={`${base}-panel`}
              tabIndex={i === index ? 0 : -1}
              className="decision"
              onClick={() => setIndex(i)}
              onKeyDown={(e) => onTabsKeyDown(e, project.decisions.length, i, setIndex, 'vertical')}
            >
              <span className="decision__title">{pick(decision.title)}</span>
              <span className="decision__text">
                <span>{pick(decision.text)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="lab__panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${index}`}>
        {current.code && <CodePanel code={current.code} repo={project.repo} />}
      </div>
    </div>
  )
}

function Chapter({ project }) {
  const { t, pick } = useLanguage()
  const titleId = `project-${project.id}-title`

  return (
    <article className={`chapter chapter--${project.id}`} id={`project-${project.id}`} aria-labelledby={titleId}>
      <header className="chapter__head">
        <div className="chapter__status" data-reveal>
          <StatusBadge status={project.status} />
        </div>
        <h3 id={titleId} className="chapter__name" data-reveal>
          {project.name}
        </h3>
        <p className="chapter__tagline" data-reveal style={{ '--d': 1 }}>
          {pick(project.tagline)}
        </p>
        <div className="chapter__lede" data-reveal style={{ '--d': 2 }}>
          <p className="chapter__summary">{pick(project.summary)}</p>
          {project.commercial && <p className="chapter__note">{pick(project.commercial)}</p>}
          <div className="chapter__links">
            {project.demo && (
              <ExternalLink className="button button--primary" href={project.demo}>
                {t('projects.demo')}
                <ArrowIcon />
              </ExternalLink>
            )}
            <ExternalLink className="button" href={project.repo}>
              <BrandIcon name="github" />
              {t('projects.repo')}
            </ExternalLink>
          </div>
        </div>
      </header>

      <div className="chapter__body">
        <div className="chapter__stage" data-reveal>
          <BrowserFrame project={project} />
        </div>

        <div className="chapter__story">
          <section className="story-block" data-reveal>
            <h4>{t('projects.problem')}</h4>
            <p>{pick(project.problem)}</p>
          </section>
          <section className="story-block" data-reveal>
            <h4>{t('projects.role')}</h4>
            <p>{pick(project.role)}</p>
          </section>
          <section className="story-block" data-reveal>
            <h4>{t('projects.features')}</h4>
            <ul className="checklist">
              {pick(project.features).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
          <section className="story-block" data-reveal>
            <h4>{t('projects.stack')}</h4>
            <ul className="tags" translate="no">
              {project.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </section>
          {project.nextSteps && (
            <section className="story-block" data-reveal>
              <h4>{t('projects.nextSteps')}</h4>
              <ul className="plainlist">
                {pick(project.nextSteps).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </section>
          )}
          {project.learnings && (
            <section className="story-block" data-reveal>
              <h4>{t('projects.learnings')}</h4>
              <p>{pick(project.learnings)}</p>
            </section>
          )}
        </div>
      </div>

      {project.decisions?.length > 0 && <DecisionLab project={project} />}
    </article>
  )
}

export default function Projects() {
  const { t } = useLanguage()
  return (
    <section className="section projects" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <header className="section__head projects__head">
          <h2 id="projects-title" className="section__title" data-reveal>
            {t('projects.title')}
          </h2>
          <p className="section__intro" data-reveal style={{ '--d': 1 }}>
            {t('projects.intro')}
          </p>
        </header>
        {projects.map((project) => (
          <Chapter key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
