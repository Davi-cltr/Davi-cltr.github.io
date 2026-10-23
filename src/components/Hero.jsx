import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { heroCode } from '../data/heroCode.js'
import { asset } from '../lib/asset.js'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion.js'

export function Photo() {
  const { t } = useLanguage()
  if (profile.photo) {
    return (
      <img
        className="photo"
        src={asset(profile.photo)}
        alt={t('photo.alt')}
        width="480"
        height="600"
        fetchPriority="high"
      />
    )
  }
  // Sem foto ainda: monograma no mesmo formato, para o layout não mudar depois.
  return (
    <div className="photo photo--empty" aria-hidden="true">
      <span>DM</span>
    </div>
  )
}

// A luz de sódio: nasce no cursor âmbar do título e depois acompanha o mouse,
// revelando o código real que fica quase invisível no fundo.
// No toque, ela passeia devagar sozinha; com movimento reduzido, fica parada.
function useSodiumLight(stageRef, anchorRef) {
  useEffect(() => {
    const stage = stageRef.current
    const anchor = anchorRef.current
    if (!stage || !anchor) return

    const pos = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let following = false
    let visible = true
    let frame = 0
    let start = performance.now()

    const anchorPoint = () => {
      const s = stage.getBoundingClientRect()
      const a = anchor.getBoundingClientRect()
      return { x: a.left - s.left + a.width / 2, y: a.top - s.top + a.height / 2 }
    }
    const paint = () => {
      stage.style.setProperty('--lx', `${pos.x.toFixed(1)}px`)
      stage.style.setProperty('--ly', `${pos.y.toFixed(1)}px`)
    }
    const place = () => {
      const p = anchorPoint()
      Object.assign(pos, p)
      Object.assign(target, p)
      paint()
    }

    place()
    if (prefersReducedMotion()) {
      window.addEventListener('resize', place)
      return () => window.removeEventListener('resize', place)
    }

    const fine = hasFinePointer()
    const tick = (now) => {
      frame = 0
      if (!visible) return
      if (!fine) {
        // Deriva lenta em torno do cursor do título (curva de Lissajous).
        const a = anchorPoint()
        const w = stage.clientWidth
        const h = stage.clientHeight
        const t = (now - start) / 1000
        target.x = a.x + Math.sin(t * 0.35) * w * 0.28
        target.y = a.y + Math.sin(t * 0.22 + 1.2) * h * 0.18
      }
      pos.x += (target.x - pos.x) * 0.09
      pos.y += (target.y - pos.y) * 0.09
      paint()
      const settled = Math.abs(target.x - pos.x) < 0.3 && Math.abs(target.y - pos.y) < 0.3
      if (!fine || !settled) frame = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      const s = stage.getBoundingClientRect()
      following = true
      target.x = e.clientX - s.left
      target.y = e.clientY - s.top
      kick()
    }
    const onLeave = () => {
      following = false
      Object.assign(target, anchorPoint())
      kick()
    }
    const onResize = () => {
      if (!following) Object.assign(target, anchorPoint())
      kick()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        start = performance.now() - 2000
        kick()
      }
    })
    io.observe(stage)

    if (fine) {
      stage.addEventListener('pointermove', onMove)
      stage.addEventListener('pointerleave', onLeave)
    } else {
      kick()
    }
    window.addEventListener('resize', onResize)

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [stageRef, anchorRef])
}

// Três colunas de código, cada uma recortada no próprio limite.
const third = Math.ceil(heroCode.length / 3)
const codeColumns = [0, 1, 2].map((i) => heroCode.slice(i * third, (i + 1) * third).join('\n'))

function CodeLayer({ className }) {
  return (
    <div className={`hero__code-layer ${className}`}>
      {codeColumns.map((text, i) => (
        <pre key={i}>{text}</pre>
      ))}
    </div>
  )
}

export default function Hero() {
  const { t, pick } = useLanguage()
  const stage = useRef(null)
  const cursor = useRef(null)
  useSodiumLight(stage, cursor)

  const [first, ...rest] = profile.name.split(' ')

  return (
    <section className="hero" id="top" aria-labelledby="hero-name" ref={stage}>
      <div className="hero__code" aria-hidden="true" translate="no">
        <CodeLayer className="hero__code-dim" />
        <CodeLayer className="hero__code-lit" />
      </div>
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__grid">
        <div className="hero__text">
          <p className="hero__role" data-intro style={{ '--d': 0 }}>
            {pick(profile.role)}
          </p>
          <h1 id="hero-name" className="hero__name">
            <span className="hero__line">
              <span data-intro style={{ '--d': 1 }}>
                {first}
              </span>
            </span>
            <span className="hero__line">
              <span data-intro style={{ '--d': 2 }}>
                {rest.join(' ')}
              </span>
            </span>
          </h1>
          <p className="hero__tagline" data-intro style={{ '--d': 4 }}>
            {pick(profile.tagline)}
            <span className="cursor" ref={cursor} aria-hidden="true" />
          </p>
          <p className="hero__intro" data-intro style={{ '--d': 5 }}>
            {pick(profile.intro)}
          </p>
          <div className="hero__actions" data-intro style={{ '--d': 6 }}>
            <a className="button button--primary" href="#projects">
              {t('hero.projects')}
            </a>
            <a className="button" href="#contact">
              {t('hero.contact')}
            </a>
          </div>
        </div>
        <div className="hero__photo" data-intro style={{ '--d': 3 }}>
          <Photo />
        </div>
      </div>
    </section>
  )
}
