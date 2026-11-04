import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { estado, mudar } from '../core/store.js'
import { gsap, pausarRolagem, ScrollTrigger } from '../core/motion.js'

/**
 * A abertura: uma contagem real do carregamento e um filamento de sódio que esquenta.
 * No fim, o filamento vira a linha do horizonte e a página sobe por trás dele.
 */
export default function Preloader() {
  const { t } = useLanguage()
  const raiz = useRef(null)
  const [fim, setFim] = useState(false)
  const numero = useRef(null)

  useEffect(() => {
    document.documentElement.classList.add('carregando')
    pausarRolagem(true)
    window.scrollTo(0, 0)
    let visto = false
    try {
      visto = !!sessionStorage.getItem('abertura-vista')
      sessionStorage.setItem('abertura-vista', '1')
    } catch {
      /* sem armazenamento */
    }
    const rapido = visto || estado.reduzido
    const contador = { v: 0 }
    let saindo = false
    const el = raiz.current

    const sair = () => {
      if (saindo) return
      saindo = true
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove('carregando')
          pausarRolagem(false)
          setFim(true)
          ScrollTrigger.refresh()
        },
      })
      if (estado.reduzido) {
        tl.to(el, { opacity: 0, duration: 0.3 })
        tl.call(() => mudar({ pronto: true }), null, 0)
        return
      }
      tl.to(el.querySelector('.pre__num'), { yPercent: -110, duration: 0.6, ease: 'power3.in' })
        .to(el.querySelector('.pre__rotulo'), { opacity: 0, duration: 0.3 }, '<')
        .to(el.querySelector('.pre__fio'), { scaleX: 1, duration: 0.7, ease: 'expo.inOut' }, '<0.1')
        .to(el.querySelector('.pre__fio'), { scaleY: 40, opacity: 0, duration: 0.5, ease: 'power2.in' })
        .call(() => mudar({ pronto: true }), null, '<')
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '<0.1')
    }

    let alvo = 0
    const tick = () => {
      const meta = Math.max(alvo, estado.carregado)
      alvo = meta
      const vel = rapido ? 0.3 : 0.06
      contador.v += (meta * 100 - contador.v) * vel + (meta >= 1 ? 0.6 : 0)
      contador.v = Math.min(contador.v, meta * 100)
      if (numero.current) numero.current.textContent = String(Math.floor(contador.v)).padStart(3, '0')
      el.style.setProperty('--carga', (contador.v / 100).toFixed(3))
      if (meta >= 1 && contador.v >= 99.5) {
        gsap.ticker.remove(tick)
        sair()
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  if (fim) return null
  return (
    <div className="pre" ref={raiz} role="status" aria-live="polite">
      <div className="pre__centro">
        <span className="pre__marca" aria-hidden="true">
          DM
        </span>
        <div className="pre__fio" aria-hidden="true" />
        <div className="pre__linha">
          <span className="pre__rotulo">{t('preload.label')}</span>
          <span className="pre__num-caixa" aria-hidden="true">
            <span className="pre__num" ref={numero}>
              000
            </span>
          </span>
        </div>
      </div>
      <span className="visually-hidden">{t('preload.label')}</span>
    </div>
  )
}
