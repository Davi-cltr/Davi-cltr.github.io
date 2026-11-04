import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { projects } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import { estado } from '../core/store.js'
import { useEstado } from '../core/useEstado.js'
import { gsap, ScrollTrigger } from '../core/motion.js'
import { tique } from '../core/som.js'
import { revelarLinhas, useCena, useMagnetico } from './efeitos.jsx'
import { ArrowIcon, BrandIcon, ExternalLink, StatusBadge, highlight, onTabsKeyDown } from './ui.jsx'

const imagem = (src, w) => asset(`images/projects/${src}-${w}.webp`)

function escolherCaptura(id, i) {
  estado.capturas = { ...estado.capturas, [id]: i }
}

/** moldura de navegador: as abas são as capturas; no WebGL, a troca vira uma dissolução de luz */
function Navegador({ project }) {
  const { t, pick } = useLanguage()
  const [indice, setIndice] = useState(0)
  const base = `shot-${project.id}`
  const img = project.images[indice]
  const escolher = (i) => {
    setIndice(i)
    escolherCaptura(project.id, i)
    tique()
  }
  // a rolagem pela história troca a captura (sem tirar o controle das abas)
  useEffect(() => {
    const ouvir = (e) => {
      if (e.detail.id !== project.id) return
      const i = e.detail.indice % project.images.length
      setIndice(i)
      escolherCaptura(project.id, i)
    }
    addEventListener('portfolio-captura', ouvir)
    return () => removeEventListener('portfolio-captura', ouvir)
  }, [project])

  return (
    <figure className="navegador">
      <div className="navegador__barra">
        <span className="navegador__luzes" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="navegador__abas" role="tablist" aria-label={`${t('projects.gallery')}: ${project.name}`}>
          {project.images.map((im, i) => (
            <button
              key={im.src}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={i === indice}
              aria-controls={`${base}-painel`}
              tabIndex={i === indice ? 0 : -1}
              onClick={() => escolher(i)}
              onKeyDown={(e) => onTabsKeyDown(e, project.images.length, i, escolher)}
            >
              {pick(im.label)}
            </button>
          ))}
        </div>
      </div>
      <div className="navegador__endereco" aria-hidden="true" translate="no">
        <span className="cadeado" />
        {project.address}
      </div>
      <div className="navegador__vista" role="tabpanel" id={`${base}-painel`} aria-labelledby={`${base}-tab-${indice}`} data-gl-captura={project.id} data-cursor="open">
        <a href={imagem(img.src, 1280)} target="_blank" rel="noopener noreferrer" title={t('projects.openImage')}>
          <img
            key={img.src}
            src={imagem(img.src, 1280)}
            srcSet={`${imagem(img.src, 640)} 640w, ${imagem(img.src, 1280)} 1280w`}
            sizes="(min-width: 1000px) 640px, 92vw"
            width={img.width}
            height={img.height}
            alt={pick(img.alt)}
            loading="lazy"
            decoding="async"
          />
          <span className="visually-hidden"> {t('external')}</span>
        </a>
      </div>
      <figcaption className="navegador__legenda">{pick(img.alt)}</figcaption>
    </figure>
  )
}

/** o código real da decisão, com as linhas que a implementam acesas */
function Codigo({ code, repo }) {
  const { t } = useLanguage()
  const ref = useRef(null)
  const lit = new Set(code.highlight)
  const largura = String(Math.max(...code.blocks.map((b) => b.start + b.lines.split('\n').length))).length
  useEffect(() => {
    if (estado.reduzido || !ref.current) return
    const linhas = ref.current.querySelectorAll('.cod__linha')
    const tl = gsap.timeline()
    tl.from(linhas, { opacity: 0, x: -12, duration: 0.5, ease: 'expo.out', stagger: 0.018 })
    tl.fromTo(ref.current.querySelectorAll('.cod__linha.is-acesa'), { '--acende': 0 }, { '--acende': 1, duration: 0.8, ease: 'power2.out', stagger: 0.08 }, 0.25)
    return () => tl.kill()
  }, [code])

  return (
    <div className="cod">
      <div className="cod__cabeca">
        <span className="cod__arquivo" translate="no">
          {code.file}
        </span>
        <ExternalLink className="cod__abrir" href={`${repo}/blob/HEAD/${code.file}`}>
          {t('projects.openFile')}
          <ArrowIcon size={14} />
        </ExternalLink>
      </div>
      <pre
        ref={ref}
        className="cod__corpo"
        tabIndex={0}
        style={{ '--gutter': `${largura + 1}ch` }}
        aria-label={t('projects.excerpt', { file: code.file, lines: code.highlight.join(', ') })}
        translate="no"
      >
        <code>
          {code.blocks.map((bloco, b) => (
            <span className="cod__bloco" key={bloco.start}>
              {b > 0 && (
                <span className="cod__salto" aria-hidden="true">
                  ⋯
                </span>
              )}
              {bloco.lines.split('\n').map((linha, i) => {
                const n = bloco.start + i
                return (
                  <span className={`cod__linha ${lit.has(n) ? 'is-acesa' : ''}`} key={n}>
                    <span className="cod__num" aria-hidden="true">
                      {n}
                    </span>
                    <span className="cod__texto">{linha ? highlight(linha) : ' '}</span>
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

function Decisoes({ project }) {
  const { t, pick } = useLanguage()
  const [indice, setIndice] = useState(0)
  const base = `decisao-${project.id}`
  const atual = project.decisions[indice]
  const escolher = (i) => {
    setIndice(i)
    tique(true)
    dispatchEvent(new Event('portfolio-clarao'))
  }
  return (
    <div className="lab">
      <div className="lab__intro">
        <h4 className="lab__titulo" data-linhas>
          {t('projects.decisions')}
        </h4>
        <p className="lab__dica" data-linhas>
          {t('projects.decisionsHint')}
        </p>
        <div className="lab__lista" role="tablist" aria-orientation="vertical" aria-label={t('projects.decisions')}>
          {project.decisions.map((d, i) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={i === indice}
              aria-controls={`${base}-painel`}
              tabIndex={i === indice ? 0 : -1}
              className="decisao"
              data-cursor="pick"
              onClick={() => escolher(i)}
              onKeyDown={(e) => onTabsKeyDown(e, project.decisions.length, i, escolher, 'vertical')}
            >
              <span className="decisao__num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="decisao__titulo">{pick(d.title)}</span>
              <span className="decisao__texto">
                <span>{pick(d.text)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="lab__painel" role="tabpanel" id={`${base}-painel`} aria-labelledby={`${base}-tab-${indice}`}>
        {atual.code && <Codigo code={atual.code} repo={project.repo} />}
      </div>
    </div>
  )
}

function Capitulo({ project, n }) {
  const { t, pick } = useLanguage()
  const demo = useMagnetico(0.3)
  const repo = useMagnetico(0.3)
  const titulo = `projeto-${project.id}-titulo`
  const blocos = [
    { h: t('projects.problem'), corpo: <p>{pick(project.problem)}</p> },
    { h: t('projects.role'), corpo: <p>{pick(project.role)}</p> },
    {
      h: t('projects.features'),
      corpo: (
        <ul className="lista-check">
          {pick(project.features).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
    },
    {
      h: t('projects.stack'),
      corpo: (
        <ul className="etiquetas" translate="no">
          {project.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    },
    project.nextSteps && {
      h: t('projects.nextSteps'),
      corpo: (
        <ul className="lista-simples">
          {pick(project.nextSteps).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    },
    project.learnings && { h: t('projects.learnings'), corpo: <p>{pick(project.learnings)}</p> },
  ].filter(Boolean)

  return (
    <article className={`capitulo capitulo--${project.id}`} id={`projeto-${project.id}`} aria-labelledby={titulo}>
      <span className="capitulo__varredura" aria-hidden="true" />
      <header className="capitulo__cabeca">
        <p className="capitulo__num" data-surge>
          {String(n).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </p>
        <div data-surge>
          <StatusBadge status={project.status} />
        </div>
        <h3 id={titulo} className="capitulo__nome">
          <span className="visually-hidden">{project.name}</span>
          <span aria-hidden="true" className="capitulo__letras">
            {[...project.name].map((c, i) => (
              <span className="letra" key={i}>
                <span className="letra__in">{c}</span>
              </span>
            ))}
          </span>
        </h3>
        <p className="capitulo__frase" data-linhas>
          {pick(project.tagline)}
        </p>
        <p className="capitulo__resumo" data-linhas>
          {pick(project.summary)}
        </p>
        {project.commercial && <p className="capitulo__nota">{pick(project.commercial)}</p>}
        <div className="capitulo__links" data-surge>
          {project.demo && (
            <ExternalLink ref={demo} className="botao botao--luz" href={project.demo}>
              <span>{t('projects.demo')}</span>
              <ArrowIcon />
            </ExternalLink>
          )}
          <ExternalLink ref={repo} className="botao" href={project.repo}>
            <BrandIcon name="github" />
            <span>{t('projects.repo')}</span>
          </ExternalLink>
        </div>
      </header>

      <div className="capitulo__corpo">
        <div className="capitulo__palco">
          <Navegador project={project} />
        </div>
        <div className="capitulo__historia">
          {blocos.map((b, i) => (
            <section className="bloco" key={b.h} data-bloco={i}>
              <h4>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {b.h}
              </h4>
              {b.corpo}
            </section>
          ))}
        </div>
      </div>
      {project.decisions?.length > 0 && <Decisoes project={project} />}
    </article>
  )
}

export default function Projects() {
  const { t, lang } = useLanguage()
  useEstado((s) => s.reduzido)

  const raiz = useCena(
    (el, reduzido) => {
      revelarLinhas(el, reduzido)
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (st) => (estado.secoes.projetos = st.progress),
      })
      el.querySelectorAll('.capitulo').forEach((cap) => {
        const id = cap.id.replace('projeto-', '')
        // cada bloco da história que passa pelo meio da tela troca a captura
        cap.querySelectorAll('[data-bloco]').forEach((b) => {
          ScrollTrigger.create({
            trigger: b,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (st) => {
              if (!st.isActive) return
              b.classList.add('is-visto')
              dispatchEvent(new CustomEvent('portfolio-captura', { detail: { id, indice: Number(b.dataset.bloco) } }))
            },
          })
        })
        if (reduzido) return
        gsap.from(cap.querySelectorAll('.capitulo__letras .letra__in'), {
          yPercent: 110,
          rotate: 6,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.04,
          scrollTrigger: { trigger: cap, start: 'top 75%' },
        })
        // uma linha de luz varre o capítulo quando ele chega
        gsap.fromTo(
          cap.querySelector('.capitulo__varredura'),
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, opacity: 0, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: cap, start: 'top 80%' } },
        )
        // a moldura entra inclinada e se endireita
        gsap.from(cap.querySelector('.navegador'), {
          rotateX: 18,
          rotateY: -10,
          y: 80,
          opacity: 0,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: cap.querySelector('.capitulo__corpo'), start: 'top 85%' },
        })
      })
      // o título gigante corre na horizontal enquanto a seção passa
      if (!reduzido)
        gsap.fromTo(
          el.querySelector('.projetos__corrida'),
          { xPercent: 5 },
          { xPercent: -45, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top -60%', scrub: true } },
        )
    },
    [lang],
  )

  return (
    <section className="secao projetos" id="projetos" ref={raiz} aria-labelledby="proj-titulo">
      <div className="projetos__faixa" aria-hidden="true">
        <p className="projetos__corrida">
          {projects.map((p) => p.name).join(' — ')} — {projects.map((p) => p.name).join(' — ')} —
        </p>
      </div>
      <header className="cabeca">
        <p className="rotulo" data-surge>
          <span>03</span> {t('nav.projects')}
        </p>
        <h2 id="proj-titulo" className="titulo" data-linhas>
          {t('projects.title')}
        </h2>
        <p className="intro" data-linhas>
          {t('projects.intro')}
        </p>
      </header>
      {projects.map((p, i) => (
        <Capitulo key={p.id} project={p} n={i + 1} />
      ))}
    </section>
  )
}
