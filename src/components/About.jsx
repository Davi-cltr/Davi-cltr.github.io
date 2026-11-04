import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { estado } from '../core/store.js'
import { gsap, ScrollTrigger } from '../core/motion.js'
import { embaralhar, revelarLinhas, useCena } from './efeitos.jsx'

export default function About() {
  const { t, pick, lang } = useLanguage()

  const raiz = useCena(
    (el, reduzido) => {
      revelarLinhas(el, reduzido)
      // o retrato se monta de poeira de luz conforme a rolagem
      ScrollTrigger.create({
        trigger: el.querySelector('.sobre__corpo'),
        start: 'top 85%',
        end: 'bottom 60%',
        onUpdate: (st) => (estado.secoes['sobre-retrato'] = st.progress),
        onRefresh: (st) => (estado.secoes['sobre-retrato'] = st.progress),
      })
      // a frase de destaque acende palavra por palavra
      const palavras = el.querySelectorAll('.sobre__frase .palavra')
      if (!reduzido)
        gsap.fromTo(
          palavras,
          { '--luz': 0 },
          {
            '--luz': 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: el.querySelector('.sobre__frase'), start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        )
      else gsap.set(palavras, { '--luz': 1 })
      // a ficha se escreve quando aparece
      el.querySelectorAll('.ficha dd').forEach((dd, i) => {
        ScrollTrigger.create({
          trigger: dd,
          start: 'top 90%',
          once: true,
          onEnter: () => setTimeout(() => embaralhar(dd.querySelector('[data-valor]'), dd.dataset.texto, { duracao: 0.9 }), i * 120),
        })
      })
    },
    [lang],
  )

  const frase = pick(profile.statement).split(' ')

  return (
    <section className="secao sobre" id="sobre" ref={raiz} aria-labelledby="sobre-titulo">
      <div className="sobre__corpo">
        <div className="sobre__texto">
          <p className="rotulo" data-surge>
            <span>01</span> {t('nav.about')}
          </p>
          <h2 id="sobre-titulo" className="titulo" data-linhas>
            {t('about.title')}
          </h2>
          {pick(profile.about).map((p) => (
            <p className="sobre__par" key={p.slice(0, 20)} data-linhas>
              {p}
            </p>
          ))}
          <dl className="ficha">
            {profile.facts.map((f) => (
              <div className="ficha__item" key={pick(f.label)} data-surge>
                <dt>{pick(f.label)}</dt>
                <dd data-texto={pick(f.value)}>
                  <span className="visually-hidden">{pick(f.value)}</span>
                  <span aria-hidden="true" data-valor>
                    {pick(f.value)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="sobre__retrato">
          <div className="sobre__moldura" data-gl="particulas" aria-hidden="true" />
          <span className="sobre__coord" aria-hidden="true">
            22.7°S · 47.3°W
          </span>
        </div>
      </div>
      <blockquote className="sobre__frase">
        <p>
          {frase.map((w, i) => (
            <span className="palavra" key={i}>
              {w}{' '}
            </span>
          ))}
        </p>
      </blockquote>
      <div className="sobre__metas">
        <h3 data-linhas>{t('about.goals')}</h3>
        <p data-linhas>{pick(profile.goals)}</p>
      </div>
    </section>
  )
}
