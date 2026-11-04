// Rolagem suave (Lenis) sincronizada com o GSAP ScrollTrigger.
// Com movimento reduzido, a rolagem é a nativa e nenhuma cena fica presa à rolagem.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { estado, mudar } from './store.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

let lenis = null

export function iniciarRolagem() {
  pararRolagem()
  if (!estado.reduzido) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  }
  let ultimoY = window.scrollY
  let ultimoT = performance.now()
  const medir = () => {
    const agora = performance.now()
    const y = window.scrollY
    const dt = Math.max(1, agora - ultimoT)
    const vel = ((y - ultimoY) / dt) * 1000
    ultimoY = y
    ultimoT = agora
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
    estado.rolagem.y = y
    estado.rolagem.vel += (vel - estado.rolagem.vel) * 0.25
    estado.rolagem.progresso = y / max
  }
  gsap.ticker.add(medir)
  if (/[?&]debug/.test(location.search))
    window.__rolar = (y) => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y))
  return () => {
    gsap.ticker.remove(medir)
    pararRolagem()
  }
}

function tick(t) {
  lenis?.raf(t * 1000)
}

function pararRolagem() {
  if (!lenis) return
  gsap.ticker.remove(tick)
  lenis.destroy()
  lenis = null
}

/** rola até um alvo (seletor ou número), suave quando permitido */
export function rolarPara(alvo, opcoes = {}) {
  const el = typeof alvo === 'string' ? document.querySelector(alvo) : alvo
  if (lenis) lenis.scrollTo(el ?? alvo, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opcoes })
  else if (typeof alvo === 'number') window.scrollTo({ top: alvo })
  else el?.scrollIntoView({ block: 'start' })
}

export function pausarRolagem(pausa) {
  if (!lenis) return
  if (pausa) lenis.stop()
  else lenis.start()
}

/** registra o progresso local (0..1) de uma seção no estado compartilhado */
export function progressoDaSecao(id, el, opcoes = {}) {
  return ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    ...opcoes,
    onUpdate: (st) => {
      estado.secoes[id] = st.progress
    },
    onRefresh: (st) => {
      estado.secoes[id] = st.progress
    },
  })
}

export { gsap, ScrollTrigger, SplitText, mudar }
