import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { certificates, milestones, timelineRange, tracks } from '../data/career.js'
import { estado } from '../core/store.js'
import { ScrollTrigger } from '../core/motion.js'
import { tique } from '../core/som.js'
import { revelarLinhas, useCena } from './efeitos.jsx'

const meses = (s) => {
  const [a, m] = s.split('-').map(Number)
  return a * 12 + (m - 1)
}
const INI = meses(timelineRange.start)
const FIM = meses(timelineRange.end)
const hoje = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
/** posição (0..1) de uma data na linha do tempo */
const fracao = (s) => (meses(s) - INI) / (FIM - INI)
const anos = []
for (let a = Number(timelineRange.start.slice(0, 4)); a <= Number(timelineRange.end.slice(0, 4)); a++) anos.push(a)

/**
 * A trajetória: uma avenida à noite em 3D, presa à rolagem. A câmera anda pela rua;
 * cada etapa aparece quando a câmera chega no mês em que ela começou.
 */
export default function Journey() {
  const { t, pick, lang } = useLanguage()
  const [ativa, setAtiva] = useState(-1)
  const cursor = useRef(null)
  const ordem = [...milestones].sort((a, b) => meses(a.start) - meses(b.start))
  const fHoje = fracao(hoje())

  const raiz = useCena(
    (el, reduzido) => {
      revelarLinhas(el, reduzido)
      if (reduzido) {
        estado.secoes['trajetoria-pin'] = fHoje
        return
      }
      let ultima = -2
      ScrollTrigger.create({
        trigger: el.querySelector('.estrada'),
        start: 'top top',
        end: () => `+=${innerHeight * 3.2}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (st) => {
          const p = st.progress
          estado.secoes['trajetoria-pin'] = p
          if (cursor.current) cursor.current.style.left = `${(p * 100).toFixed(2)}%`
          // a etapa cujo começo a câmera acabou de passar
          let i = -1
          ordem.forEach((m, k) => {
            if (fracao(m.start) <= p + 0.02) i = k
          })
          if (i !== ultima) {
            ultima = i
            setAtiva(i)
            if (i >= 0) tique()
          }
        },
        onLeaveBack: () => (estado.secoes['trajetoria-pin'] = 0),
      })
    },
    [lang],
  )

  const atual = ativa >= 0 ? ordem[ativa] : null

  return (
    <section className="secao trajetoria" id="trajetoria" ref={raiz} aria-labelledby="traj-titulo">
      <div className="estrada">
        <header className="estrada__cabeca">
          <p className="rotulo">
            <span>04</span> {t('nav.journey')}
          </p>
          <h2 id="traj-titulo" className="titulo">
            {t('journey.title')}
          </h2>
          <p className="intro">{t('journey.intro')}</p>
          <p className="estrada__dica">{t('road')}</p>
        </header>

        <div className="estrada__cartao" aria-live="polite">
          {atual && (
            <article key={atual.id} className={`etapa etapa--${atual.track} ${atual.planned ? 'is-prevista' : ''}`}>
              <p className="etapa__periodo">
                {pick(atual.period)}
                {atual.planned && <span className="etapa__selo">{t('journey.planned')}</span>}
              </p>
              <h3>{pick(atual.title)}</h3>
              <p className="etapa__org">{pick(atual.org)}</p>
              <p className="etapa__detalhe">{pick(atual.detail)}</p>
              <p className="etapa__trilha">{pick(tracks.find((x) => x.id === atual.track).title)}</p>
            </article>
          )}
        </div>

        <div className="regua" aria-hidden="true">
          {tracks.map((tr) => (
            <div className="regua__trilha" key={tr.id}>
              <span className="regua__nome">{pick(tr.title)}</span>
              <div className="regua__faixa">
                {ordem
                  .filter((m) => m.track === tr.id)
                  .map((m) => {
                    const a = fracao(m.start)
                    const b = m.end ? fracao(m.end) : fHoje
                    return (
                      <span
                        key={m.id}
                        className={`regua__barra ${m.planned ? 'is-prevista' : ''} ${atual?.id === m.id ? 'is-ativa' : ''}`}
                        style={{ left: `${a * 100}%`, width: `${Math.max(1.5, (b - a) * 100)}%` }}
                      >
                        {pick(m.short)}
                      </span>
                    )
                  })}
              </div>
            </div>
          ))}
          <div className="regua__espaco" />
          <div className="regua__sobre">
            {anos.map((a) => (
              <span className="regua__ano" key={a} style={{ left: `${fracao(`${a}-01`) * 100}%` }}>
                {a}
              </span>
            ))}
            <span className="regua__hoje" style={{ left: `${fHoje * 100}%` }}>
              {t('journey.today')}
            </span>
            <span className="regua__cursor" ref={cursor} />
          </div>
        </div>

        {/* a lista completa, para leitores de tela e para quem prefere menos movimento */}
        <ol className="estrada__lista">
          {ordem.map((m) => (
            <li key={m.id} className={m.planned ? 'is-prevista' : ''}>
              <span className="estrada__periodo">{pick(m.period)}</span>
              <span className="estrada__titulo">{pick(m.title)}</span>
              <span className="estrada__org">
                {pick(m.org)} · {pick(m.detail)}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {certificates.length > 0 && (
        <div className="certificados">
          <h3>{t('journey.certificates')}</h3>
          <ul>
            {certificates.map((c) => (
              <li key={c.name}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.name}
                </a>{' '}
                · {c.issuer} · {c.year}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
