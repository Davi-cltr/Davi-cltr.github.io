import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { gsap, ScrollTrigger } from '../core/motion.js'
import { acender, tique } from '../core/som.js'
import { estado } from '../core/store.js'
import { revelarLinhas, useCena, useMagnetico } from './efeitos.jsx'
import { ArrowIcon, BrandIcon, ExternalLink } from './ui.jsx'

function Relogio() {
  const { t, lang } = useLanguage()
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hora = agora.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <p className="relogio">
      <span className="pulso" aria-hidden="true" />
      {t('clock')} · <time>{hora}</time>
    </p>
  )
}

export default function Contact() {
  const { t, lang } = useLanguage()
  const [copiado, setCopiado] = useState('')
  const email = useMagnetico(0.18)
  const copiar = useMagnetico(0.35)
  const gh = useMagnetico(0.35)
  const li = useMagnetico(0.35)
  const titulo = useRef(null)

  const raiz = useCena(
    (el, reduzido) => {
      revelarLinhas(el, reduzido)
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom bottom', onUpdate: (st) => (estado.secoes.contato = st.progress) })
      if (reduzido) return
      gsap.from(el.querySelectorAll('.contato__base .letra__in, .contato__luz .letra__in'), {
        yPercent: 120,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 65%' },
      })
      gsap.to(el.querySelector('.contato__corrida'), { xPercent: -50, ease: 'none', duration: 24, repeat: -1 })
    },
    [lang],
  )

  // o título acende onde o cursor passa (máscara de luz)
  useEffect(() => {
    const el = titulo.current
    if (!el) return
    const mover = (e) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    addEventListener('pointermove', mover, { passive: true })
    return () => removeEventListener('pointermove', mover)
  }, [])

  const copiarEmail = async (e) => {
    try {
      await navigator.clipboard.writeText(profile.contact.email)
      setCopiado(t('contact.copied'))
      acender()
      dispatchEvent(new Event('portfolio-clarao'))
      const r = e.currentTarget.getBoundingClientRect()
      faiscas(r.left + r.width / 2, r.top + r.height / 2)
    } catch {
      setCopiado(t('contact.copyFailed'))
    }
    setTimeout(() => setCopiado(''), 3200)
  }

  const nome = t('contact.title')
  return (
    <section className="secao contato" id="contato" ref={raiz} aria-labelledby="contato-titulo">
      <p className="rotulo" data-surge>
        <span>05</span> {t('nav.contact')}
      </p>
      <h2 id="contato-titulo" className="contato__titulo" ref={titulo}>
        <span className="visually-hidden">{nome}</span>
        <span className="contato__base" aria-hidden="true">
          <Palavras texto={nome} />
        </span>
        <span className="contato__luz" aria-hidden="true">
          <Palavras texto={nome} />
        </span>
      </h2>
      <p className="contato__texto" data-linhas>
        {t('contact.text')}
      </p>
      <div className="contato__email" data-surge>
        <a ref={email} className="email" href={`mailto:${profile.contact.email}`} data-cursor="open" onPointerEnter={() => tique()}>
          <span className="email__rotulo">{t('contact.email')}</span>
          <span className="email__end" translate="no">
            {profile.contact.email}
          </span>
          <ArrowIcon size={22} />
        </a>
        <button ref={copiar} type="button" className="botao copiar" data-cursor="copy" onClick={copiarEmail}>
          <span>{t('contact.copy')}</span>
        </button>
        <p className="copiado" role="status">
          {copiado}
        </p>
      </div>
      <div className="contato__redes" data-surge>
        <ExternalLink ref={gh} className="botao" href={profile.contact.github}>
          <BrandIcon name="github" />
          <span>GitHub</span>
        </ExternalLink>
        <ExternalLink ref={li} className="botao" href={profile.contact.linkedin}>
          <BrandIcon name="linkedin" />
          <span>LinkedIn</span>
        </ExternalLink>
        {profile.resume && (
          <a className="botao botao--luz" href={profile.resume} download>
            <span>{t('contact.resume')}</span>
          </a>
        )}
      </div>
      <Relogio />
      <div className="contato__faixa" aria-hidden="true">
        <p className="contato__corrida">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i}>
              {t('marquee')} <i>✦</i>{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

function Palavras({ texto }) {
  return texto.split(' ').map((p, k) => (
    <span className="palavra-bloco" key={k}>
      {[...p].map((c, i) => (
        <span className="letra" key={i}>
          <span className="letra__in">{c}</span>
        </span>
      ))}
    </span>
  ))
}

/** faíscas de luz saindo do botão de copiar */
function faiscas(x, y) {
  if (estado.reduzido) return
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span')
    s.className = 'faisca'
    s.style.left = `${x}px`
    s.style.top = `${y}px`
    document.body.appendChild(s)
    const a = Math.random() * Math.PI * 2
    const d = 60 + Math.random() * 90
    gsap.to(s, {
      x: Math.cos(a) * d,
      y: Math.sin(a) * d - 30,
      opacity: 0,
      scale: 0.2,
      duration: 0.9 + Math.random() * 0.5,
      ease: 'expo.out',
      onComplete: () => s.remove(),
    })
  }
}
