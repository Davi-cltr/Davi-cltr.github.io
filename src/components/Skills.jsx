import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { evidenceSources, interests, skillGroups } from '../data/skills.js'
import { mudar } from '../core/store.js'
import { useEstado } from '../core/useEstado.js'
import { tique } from '../core/som.js'
import { gsap, progressoDaSecao, ScrollTrigger } from '../core/motion.js'
import { revelarLinhas, useCena } from './efeitos.jsx'

const habilidades = skillGroups.flatMap((g) => g.items.map((item) => ({ ...item, grupo: g.id })))

export default function Skills() {
  const { t, pick, lang } = useLanguage()
  const ativa = useEstado((s) => s.habilidade)
  const [anuncio, setAnuncio] = useState('')

  const raiz = useCena(
    (el, reduzido) => {
      revelarLinhas(el, reduzido)
      progressoDaSecao('habilidades', el, { start: 'top 80%', end: 'bottom 20%' })
      if (!reduzido) {
        // a faixa de interesses corre com a rolagem (e acelera com ela)
        const faixa = el.querySelector('.faixa__trilho')
        const tween = gsap.to(faixa, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 })
        let volta = null
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (st) => {
            const v = Math.min(6, Math.abs(st.getVelocity()) / 400)
            gsap.to(tween, { timeScale: (1 + v) * st.direction, duration: 0.3, overwrite: true })
            volta?.kill()
            volta = gsap.to(tween, { timeScale: st.direction, duration: 1.2, delay: 0.35 })
          },
        })
      }
    },
    [lang],
  )

  const escolher = (i) => {
    const novo = ativa === i ? -1 : i
    mudar({ habilidade: novo })
    tique(true)
    if (novo < 0) return setAnuncio('')
    const h = habilidades[novo]
    const fontes = h.sources.map((id) => evidenceSources.find((s) => s.id === id)?.name).filter(Boolean)
    setAnuncio(t('skills.announce', { skill: pick(h.name), sources: fontes.length ? fontes.join(', ') : t('skills.noSource') }))
  }

  const contagem = habilidades.filter((h) => h.sources.length).length
  const atual = ativa >= 0 ? habilidades[ativa] : null

  return (
    <section className="secao habilidades" id="habilidades" ref={raiz} aria-labelledby="hab-titulo">
      <header className="cabeca">
        <p className="rotulo" data-surge>
          <span>02</span> {t('nav.skills')}
        </p>
        <h2 id="hab-titulo" className="titulo" data-linhas>
          {t('skills.title')}
        </h2>
        <p className="intro" data-linhas>
          {t('skills.intro')} {t('skills.hint')}
        </p>
      </header>

      <div className="mapa">
        <div className="mapa__palco" data-gl="constelacao" data-cursor="drag">
          <ul className="mapa__rotulos" aria-label={t('skills.title')}>
            {habilidades.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  data-gl-rotulo={`h-${i}`}
                  className={`no no--${h.level} ${ativa === i ? 'is-ativo' : ''}`}
                  aria-pressed={ativa === i}
                  data-cursor="pick"
                  onClick={() => escolher(i)}
                  onPointerEnter={() => ativa < 0 && mudar({ habilidade: i })}
                  onPointerLeave={() => ativa === i && !anuncio && mudar({ habilidade: -1 })}
                >
                  {pick(h.name)}
                </button>
              </li>
            ))}
          </ul>
          <ul className="mapa__fontes" aria-hidden="true">
            {evidenceSources.map((s) => (
              <li key={s.id} data-gl-rotulo={`f-${s.id}`} className={`fonte ${atual?.sources.includes(s.id) ? 'is-ativa' : ''}`}>
                <strong>{s.name}</strong>
                <small>{pick(s.kind)}</small>
              </li>
            ))}
          </ul>
          <p className="mapa__dica" aria-hidden="true">
            {t('drag')}
          </p>
        </div>

        <aside className="mapa__painel" aria-live="polite">
          <p className="mapa__contagem" data-surge>
            {t('skills.count', { n: contagem })}
          </p>
          <ul className="legenda" data-surge>
            {['work', 'project', 'learning'].map((n) => (
              <li key={n}>
                <span className={`legenda__ponto legenda__ponto--${n}`} aria-hidden="true" />
                {t(`skills.levels.${n}`)}
              </li>
            ))}
          </ul>
          <div className="mapa__detalhe">
            {atual ? (
              <>
                <h3>{pick(atual.name)}</h3>
                <p className="mapa__nivel">{t(`skills.levels.${atual.level}`)}</p>
                {atual.note && <p className="mapa__nota">{pick(atual.note)}</p>}
                <p className="mapa__usada">{t('skills.sourcesTitle')}</p>
                <ul>
                  {atual.sources.length ? (
                    atual.sources.map((id) => {
                      const s = evidenceSources.find((x) => x.id === id)
                      return (
                        <li key={id}>
                          <a href={s.href.replace('#journey', '#trajetoria').replace('#project-', '#projeto-')}>{s.name}</a> <small>{pick(s.kind)}</small>
                        </li>
                      )
                    })
                  ) : (
                    <li>{t('skills.noSource')}</li>
                  )}
                </ul>
              </>
            ) : (
              <p className="mapa__vazio">{t('skills.hint')}</p>
            )}
          </div>
          <span className="visually-hidden" role="status">
            {anuncio}
          </span>
        </aside>
      </div>

      <div className="faixa" aria-label={t('skills.interests')}>
        <p className="faixa__titulo">{t('skills.interests')}</p>
        <div className="faixa__janela">
          <ul className="faixa__trilho">
            {[...pick(interests), ...pick(interests)].map((x, i) => (
              <li key={i} aria-hidden={i >= pick(interests).length ? 'true' : undefined}>
                {x}
                <span aria-hidden="true">✦</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
