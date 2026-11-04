import { useEffect, useRef, useState } from 'react'
import { useLanguage, LANGUAGES } from '../i18n/LanguageProvider.jsx'
import { useEstado } from '../core/useEstado.js'
import { mudar } from '../core/store.js'
import { gsap, rolarPara, ScrollTrigger } from '../core/motion.js'
import { ligarSom, tique } from '../core/som.js'
import { Embaralha, useMagnetico } from './efeitos.jsx'

export const SECOES = ['sobre', 'habilidades', 'projetos', 'trajetoria', 'contato']
const CHAVE = { sobre: 'about', habilidades: 'skills', projetos: 'projects', trajetoria: 'journey', contato: 'contact' }

/** qual capítulo está no meio da tela */
export function useSecaoAtiva() {
  const [ativa, setAtiva] = useState('inicio')
  useEffect(() => {
    const sts = ['inicio', ...SECOES].map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (st) => st.isActive && setAtiva(id),
      }),
    )
    return () => sts.forEach((s) => s.kill())
  }, [])
  return ativa
}

function BotaoSom() {
  const { t } = useLanguage()
  const som = useEstado((s) => s.som)
  const ref = useMagnetico(0.3)
  return (
    <button
      ref={ref}
      type="button"
      className={`som ${som ? 'is-ligado' : ''}`}
      aria-pressed={som}
      aria-label={som ? t('sound.off') : t('sound.on')}
      onClick={() => {
        const ok = ligarSom(!som)
        if (ok) mudar({ som: !som })
        tique(true)
      }}
    >
      <span className="som__barras" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="som__texto">{t('sound.label')}</span>
    </button>
  )
}

export default function Header() {
  const { t, lang, setLang } = useLanguage()
  const ativa = useSecaoAtiva()
  const [aberto, setAberto] = useState(false)
  const barra = useRef(null)
  const marca = useMagnetico(0.25)
  const menu = useRef(null)

  // barra de progresso da leitura
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => barra.current && (barra.current.style.transform = `scaleX(${s.progress})`),
    })
    return () => st.kill()
  }, [])

  // menu do celular: os links entram em cascata
  useEffect(() => {
    if (!aberto || !menu.current) return
    const ctx = gsap.context(() => {
      gsap.from('.menu-movel a, .menu-movel .linguas', { yPercent: 120, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out' })
    }, menu)
    const esc = (e) => e.key === 'Escape' && setAberto(false)
    addEventListener('keydown', esc)
    return () => {
      ctx.revert()
      removeEventListener('keydown', esc)
    }
  }, [aberto])

  const ir = (e, id) => {
    e.preventDefault()
    setAberto(false)
    rolarPara(`#${id}`)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <header className={`topo ${aberto ? 'is-aberto' : ''}`}>
      <div className="topo__progresso" aria-hidden="true">
        <span ref={barra} />
      </div>
      <a ref={marca} className="topo__marca" href="#inicio" onClick={(e) => ir(e, 'inicio')} aria-label="Davi Motta">
        <span aria-hidden="true">DM</span>
        <i aria-hidden="true" />
      </a>
      <nav className="topo__nav" aria-label={t('nav.label')}>
        <ul>
          {SECOES.map((id) => (
            <li key={id}>
              <a href={`#${id}`} onClick={(e) => ir(e, id)} aria-current={ativa === id ? 'true' : undefined} className={ativa === id ? 'is-ativo' : ''}>
                <Embaralha>{t(`nav.${CHAVE[id]}`)}</Embaralha>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="topo__acoes">
        <div className="linguas" role="group" aria-label={t('lang.label')}>
          {LANGUAGES.map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} lang={l === 'pt' ? 'pt-BR' : 'en'} aria-label={t(`lang.${l}`)} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <BotaoSom />
        <button type="button" className="topo__menu" aria-expanded={aberto} aria-controls="menu-movel" onClick={() => setAberto((a) => !a)}>
          <span className="visually-hidden">{aberto ? t('nav.close') : t('nav.open')}</span>
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </button>
      </div>
      {aberto && (
        <div className="menu-movel" id="menu-movel" ref={menu}>
          <nav aria-label={t('nav.label')}>
            <ul>
              {SECOES.map((id, i) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={(e) => ir(e, id)}>
                    <small>0{i + 1}</small>
                    {t(`nav.${CHAVE[id]}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="linguas" role="group" aria-label={t('lang.label')}>
            {LANGUAGES.map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {t(`lang.${l}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
