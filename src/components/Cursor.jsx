import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { estado } from '../core/store.js'
import { gsap } from '../core/motion.js'
import { tique } from '../core/som.js'

/**
 * O cursor: um ponto de sódio e um anel que segue com atraso. Sobre algo clicável o anel cresce;
 * elementos com data-cursor mostram uma palavra ("ver", "girar", "copiar").
 * Também alimenta a posição do mouse usada pela cena 3D. Em telas de toque, não aparece.
 */
export default function Cursor() {
  const { t } = useLanguage()
  const ponto = useRef(null)
  const anel = useRef(null)
  const rotulo = useRef(null)

  useEffect(() => {
    let ultimo = { x: 0, y: 0, t: performance.now() }
    let sobre = null
    const mover = (e) => {
      const m = estado.mouse
      const agora = performance.now()
      const dt = Math.max(1, agora - ultimo.t)
      m.vx = ((e.clientX - ultimo.x) / dt) * 1000
      m.vy = ((e.clientY - ultimo.y) / dt) * 1000
      ultimo = { x: e.clientX, y: e.clientY, t: agora }
      m.px = e.clientX
      m.py = e.clientY
      m.x = (e.clientX / innerWidth) * 2 - 1
      m.y = -((e.clientY / innerHeight) * 2 - 1)
      m.ativo = e.pointerType === 'mouse'
      if (e.pointerType !== 'mouse') return
      document.documentElement.classList.add('cursor-ativo')
      const alvo = e.target.closest?.('a, button, [data-cursor], input, label, [role="tab"]')
      if (alvo !== sobre) {
        sobre = alvo
        const palavra = alvo?.dataset?.cursor ? t(`cursor.${alvo.dataset.cursor}`) : ''
        if (rotulo.current) rotulo.current.textContent = palavra
        anel.current?.classList.toggle('is-sobre', !!alvo)
        anel.current?.classList.toggle('tem-rotulo', !!palavra)
        if (alvo) tique()
      }
    }
    const sair = () => {
      estado.mouse.ativo = false
      document.documentElement.classList.remove('cursor-ativo')
    }
    const baixo = () => {
      anel.current?.classList.add('is-clique')
      dispatchEvent(new Event('portfolio-clarao'))
    }
    const cima = () => anel.current?.classList.remove('is-clique')
    addEventListener('pointermove', mover, { passive: true })
    addEventListener('pointerdown', mover, { passive: true })
    addEventListener('pointerdown', baixo)
    addEventListener('pointerup', cima)
    document.addEventListener('pointerleave', sair)
    const pos = { x: innerWidth / 2, y: innerHeight / 2, ax: innerWidth / 2, ay: innerHeight / 2 }
    const tick = () => {
      const m = estado.mouse
      pos.x = m.px
      pos.y = m.py
      pos.ax += (m.px - pos.ax) * 0.18
      pos.ay += (m.py - pos.ay) * 0.18
      if (ponto.current) ponto.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (anel.current) anel.current.style.transform = `translate3d(${pos.ax}px, ${pos.ay}px, 0)`
    }
    gsap.ticker.add(tick)
    return () => {
      removeEventListener('pointermove', mover)
      removeEventListener('pointerdown', mover)
      removeEventListener('pointerdown', baixo)
      removeEventListener('pointerup', cima)
      document.removeEventListener('pointerleave', sair)
      gsap.ticker.remove(tick)
    }
  }, [t])

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__anel" ref={anel}>
        <span className="cursor__rotulo" ref={rotulo} />
      </div>
      <div className="cursor__ponto" ref={ponto} />
    </div>
  )
}
