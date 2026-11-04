// Estado compartilhado entre o DOM (React) e a cena WebGL, fora do React para não re-renderizar a cada quadro.

const media = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

function qualidadeInicial() {
  try {
    const salva = localStorage.getItem('portfolio-qualidade')
    if (salva === 'alta' || salva === 'baixa') return salva
  } catch {
    /* sem armazenamento */
  }
  const toque = media('(pointer: coarse)')
  const nucleos = navigator.hardwareConcurrency || 4
  const memoria = navigator.deviceMemory || 8
  return toque || nucleos < 6 || memoria < 6 ? 'baixa' : 'alta'
}

function movimentoInicial() {
  try {
    const salvo = localStorage.getItem('portfolio-movimento')
    if (salvo === 'reduzido') return true
    if (salvo === 'normal') return false
  } catch {
    /* sem armazenamento */
  }
  return media('(prefers-reduced-motion: reduce)')
}

export const estado = {
  /** ponteiro em coordenadas normalizadas (-1..1, y para cima) e em pixels */
  mouse: { x: 0, y: 0, px: 0, py: 0, ativo: false },
  /** rolagem: posição, velocidade (px/s) e progresso global */
  rolagem: { y: 0, vel: 0, progresso: 0 },
  /** progresso local (0..1) de cada seção, preenchido pelos ScrollTriggers */
  secoes: {},
  /** tecnologia acesa no mapa de habilidades (índice) ou -1 */
  habilidade: -1,
  /** imagem atual de cada projeto */
  capturas: {},
  qualidade: qualidadeInicial(),
  reduzido: movimentoInicial(),
  toque: media('(pointer: coarse)'),
  som: false,
  /** a abertura terminou */
  pronto: false,
  /** progresso do carregamento (0..1) */
  carregado: 0,
  gl: false,
}

const ouvintes = new Set()

export function mudar(parcial) {
  Object.assign(estado, parcial)
  ouvintes.forEach((f) => f(estado))
}

export function ouvir(f) {
  ouvintes.add(f)
  return () => ouvintes.delete(f)
}

export function salvarQualidade(q) {
  try {
    localStorage.setItem('portfolio-qualidade', q)
  } catch {
    /* sem armazenamento */
  }
  mudar({ qualidade: q })
}

export function salvarMovimento(reduzido) {
  try {
    localStorage.setItem('portfolio-movimento', reduzido ? 'reduzido' : 'normal')
  } catch {
    /* sem armazenamento */
  }
  mudar({ reduzido })
}
