import { useEffect, useRef } from 'react'
import { estado, mudar, ouvir } from '../core/store.js'
import { ScrollTrigger } from '../core/motion.js'
import { Palco as Cena } from '../gl/Palco.js'

function temWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

/** o canvas fixo atrás da página; avisa o progresso do carregamento para a abertura */
export default function Palco({ aoFalhar }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!temWebGL()) {
      document.documentElement.classList.add('sem-gl')
      mudar({ carregado: 1 })
      aoFalhar()
      return
    }
    let vivo = true
    let raf = 0
    const cena = new Cena(ref.current)
    if (/[?&]debug/.test(location.search)) window.__palco = cena
    const quadro = () => {
      if (!vivo) return
      try {
        cena.quadro()
      } catch (e) {
        console.error(e)
        vivo = false
        document.documentElement.classList.add('sem-gl')
        aoFalhar()
        return
      }
      raf = requestAnimationFrame(quadro)
    }
    cena
      .iniciar((p) => mudar({ carregado: p }))
      .then(() => {
        if (!vivo) return
        document.documentElement.classList.add('com-gl')
        mudar({ carregado: 1 })
        cena.medir()
        quadro()
      })
      .catch((e) => {
        console.error(e)
        document.documentElement.classList.add('sem-gl')
        mudar({ carregado: 1 })
        aoFalhar()
      })
    const medir = () => cena.medir()
    const redim = () => cena.redimensionar()
    ScrollTrigger.addEventListener('refresh', medir)
    addEventListener('resize', redim)
    let qualidade = estado.qualidade
    const fora = ouvir((s) => {
      if (s.qualidade !== qualidade) {
        qualidade = s.qualidade
        location.reload()
      }
    })
    const clarao = () => cena.clarao()
    addEventListener('portfolio-clarao', clarao)
    return () => {
      vivo = false
      cancelAnimationFrame(raf)
      ScrollTrigger.removeEventListener('refresh', medir)
      removeEventListener('resize', redim)
      removeEventListener('portfolio-clarao', clarao)
      fora()
      cena.destruir()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={ref} className="palco" aria-hidden="true" />
}
