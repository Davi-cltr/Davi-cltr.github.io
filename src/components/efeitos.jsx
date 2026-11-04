// Efeitos reutilizáveis: magnetismo, texto embaralhado, revelação por linhas e o contexto do GSAP.
import { useEffect, useLayoutEffect, useRef } from 'react'
import { estado } from '../core/store.js'
import { gsap, SplitText } from '../core/motion.js'

const SIMBOLOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}=#*+'

/** troca o texto de um elemento passando por caracteres aleatórios, da esquerda para a direita */
export function embaralhar(el, texto, { duracao = 0.6 } = {}) {
  if (!el) return
  if (estado.reduzido) {
    el.textContent = texto
    return
  }
  const obj = { p: 0 }
  gsap.killTweensOf(el.__emb ?? {})
  el.__emb = obj
  gsap.to(obj, {
    p: 1,
    duration: duracao,
    ease: 'power2.out',
    onUpdate: () => {
      const n = Math.floor(obj.p * texto.length)
      let s = texto.slice(0, n)
      for (let i = n; i < texto.length; i++) s += texto[i] === ' ' ? ' ' : SIMBOLOS[(Math.random() * SIMBOLOS.length) | 0]
      el.textContent = s
    },
    onComplete: () => {
      el.textContent = texto
    },
  })
}

/** texto que se embaralha ao passar o mouse (mantém o texto real para leitores de tela) */
export function Embaralha({ children, as: Tag = 'span', className = '' }) {
  const ref = useRef(null)
  const texto = typeof children === 'string' ? children : ''
  return (
    <Tag className={`embaralha ${className}`} onPointerEnter={() => embaralhar(ref.current, texto, { duracao: 0.45 })}>
      <span className="visually-hidden">{texto}</span>
      <span aria-hidden="true" ref={ref}>
        {texto}
      </span>
    </Tag>
  )
}

/** o elemento é puxado pelo cursor quando ele chega perto (só com mouse) */
export function useMagnetico(forca = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || estado.toque) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const mover = (e) => {
      if (estado.reduzido) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const alcance = Math.max(r.width, r.height) * 0.9 + 30
      if (Math.hypot(dx, dy) < alcance) {
        xTo(dx * forca)
        yTo(dy * forca)
      } else {
        xTo(0)
        yTo(0)
      }
    }
    addEventListener('pointermove', mover, { passive: true })
    return () => removeEventListener('pointermove', mover)
  }, [forca])
  return ref
}

/** animações de uma seção dentro de um contexto do GSAP (desfeitas ao desmontar ou trocar idioma) */
export function useCena(fn, deps = []) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => fn(ref.current, estado.reduzido), ref)
    return () => ctx.revert()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return ref
}

/** revela por linhas (máscara) todos os elementos [data-linhas] dentro de raiz */
export function revelarLinhas(raiz, reduzido, opcoes = {}) {
  if (reduzido) return
  raiz.querySelectorAll('[data-linhas]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'linha' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', ...opcoes },
    })
  })
  raiz.querySelectorAll('[data-surge]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      delay: Number(el.dataset.surge) || 0,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
}
