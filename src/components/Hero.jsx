import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { asset } from '../lib/asset.js'
import { estado, ouvir } from '../core/store.js'
import { gsap, rolarPara } from '../core/motion.js'
import { embaralhar, useCena, useMagnetico } from './efeitos.jsx'
import { ArrowIcon } from './ui.jsx'

function Letras({ texto, className }) {
  return (
    <span className={className} aria-hidden="true">
      {[...texto].map((c, i) => (
        <span className="letra" key={i}>
          <span className="letra__in">{c}</span>
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const { t, pick, lang } = useLanguage()
  const ola = useRef(null)
  const papel = useRef(null)
  const btn1 = useMagnetico(0.35)
  const btn2 = useMagnetico(0.35)

  const raiz = useCena(
    (el, reduzido) => {
      const letras = el.querySelectorAll('.letra__in')
      const resto = el.querySelectorAll('[data-hero-surge]')
      const comecar = () => {
        if (reduzido) return
        const tl = gsap.timeline({ delay: 0.15 })
        tl.fromTo(letras, { yPercent: 115, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: 0.045 })
          .from(resto, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.5)
          .call(() => {
            embaralhar(ola.current, t('hero.hello'), { duracao: 0.7 })
            embaralhar(papel.current, pick(profile.role), { duracao: 1.2 })
          }, null, 0.4)
      }
      if (!reduzido) gsap.set(letras, { yPercent: 115 })
      if (estado.pronto) comecar()
      const fora = ouvir((s) => {
        if (s.pronto) {
          fora()
          comecar()
        }
      })

      if (!reduzido) {
        // ao rolar, o nome se abre e some, como luz que se espalha
        gsap.to(el.querySelectorAll('.hero__nome .letra'), {
          xPercent: (i) => (i - 4) * 18,
          opacity: 0,
          filter: 'blur(6px)',
          ease: 'none',
          stagger: 0.01,
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom 20%', scrub: true },
        })
        gsap.to(el.querySelector('.hero__texto'), {
          y: -120,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: '20% top', end: 'bottom top', scrub: true },
        })
        gsap.to(el.querySelector('.hero__foto'), {
          y: 80,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      // o peso de cada letra responde à distância do cursor
      const todas = [...el.querySelectorAll('.hero__nome .letra__in')]
      const peso = (e) => {
        if (estado.reduzido || e.pointerType !== 'mouse') return
        for (const l of todas) {
          const r = l.getBoundingClientRect()
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
          const w = 300 + 500 * Math.exp(-(d * d) / 40000)
          l.style.fontVariationSettings = `'wght' ${w.toFixed(0)}`
        }
      }
      addEventListener('pointermove', peso, { passive: true })
      return () => {
        fora()
        removeEventListener('pointermove', peso)
      }
    },
    [lang],
  )

  return (
    <section className="hero" id="inicio" ref={raiz} aria-labelledby="hero-titulo">
      <div className="hero__grade">
        <div className="hero__texto">
          <p className="hero__disponivel" data-hero-surge>
            <span className="pulso" aria-hidden="true" />
            {t('hero.available')}
          </p>
          <p className="hero__ola" ref={ola}>
            {t('hero.hello')}
          </p>
          <h1 className="hero__nome" id="hero-titulo">
            <span className="visually-hidden">{profile.name}</span>
            <Letras texto="Davi" className="hero__linha" />
            <Letras texto="Motta" className="hero__linha hero__linha--2" />
          </h1>
          <p className="hero__papel" data-hero-surge>
            <span ref={papel}>{pick(profile.role)}</span>
            <span className="caret" aria-hidden="true" />
          </p>
          <p className="hero__frase" data-hero-surge>
            {pick(profile.tagline)}
          </p>
          <p className="hero__intro" data-hero-surge>
            {pick(profile.intro)}
          </p>
          <div className="hero__acoes" data-hero-surge>
            <a
              ref={btn1}
              className="botao botao--luz"
              href="#projetos"
              onClick={(e) => {
                e.preventDefault()
                rolarPara('#projetos')
              }}
            >
              <span>{t('hero.projects')}</span>
              <ArrowIcon />
            </a>
            <a
              ref={btn2}
              className="botao"
              href="#contato"
              onClick={(e) => {
                e.preventDefault()
                rolarPara('#contato')
              }}
            >
              <span>{t('hero.contact')}</span>
            </a>
          </div>
        </div>
        <figure className="hero__foto">
          <img
            data-gl="retrato"
            src={asset('images/davi-1090.webp')}
            srcSet={`${asset('images/davi-545.webp')} 545w, ${asset('images/davi-1090.webp')} 1090w`}
            sizes="(min-width: 900px) 34vw, 70vw"
            width="1090"
            height="2180"
            alt={t('photo.alt')}
            fetchPriority="high"
          />
        </figure>
      </div>
      <a
        className="hero__rolar"
        href="#sobre"
        onClick={(e) => {
          e.preventDefault()
          rolarPara('#sobre')
        }}
      >
        <span className="hero__rolar-linha" aria-hidden="true">
          <i />
        </span>
        {t('hero.scroll')}
      </a>
    </section>
  )
}
