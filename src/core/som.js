// Som opcional (desligado por padrão): o zumbido de uma cidade à noite, o hum das lâmpadas de sódio,
// um sopro que acompanha a velocidade da rolagem e cliques discretos na interface.
import { estado } from './store.js'

let ctx = null
let mestre = null
let sopro = null
let ligado = false

function criar() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  mestre = ctx.createGain()
  mestre.gain.value = 0
  const comp = ctx.createDynamicsCompressor()
  mestre.connect(comp).connect(ctx.destination)

  // ruído marrom: base de tudo
  const n = ctx.sampleRate * 3
  const buf = ctx.createBuffer(1, n, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let ultimo = 0
  for (let i = 0; i < n; i++) {
    const b = Math.random() * 2 - 1
    ultimo = (ultimo + 0.02 * b) / 1.02
    d[i] = ultimo * 3.2
  }
  const ruido = () => {
    const s = ctx.createBufferSource()
    s.buffer = buf
    s.loop = true
    s.start()
    return s
  }

  // a cidade distante
  const cidade = ruido()
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 320
  const gCidade = ctx.createGain()
  gCidade.gain.value = 0.22
  cidade.connect(lp).connect(gCidade).connect(mestre)

  // dois tons graves, quase parados
  for (const [f, g] of [
    [55, 0.05],
    [82.4, 0.03],
    [110.2, 0.012],
  ]) {
    const o = ctx.createOscillator()
    o.frequency.value = f
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.05 + Math.random() * 0.08
    const lg = ctx.createGain()
    lg.gain.value = g * 0.6
    const og = ctx.createGain()
    og.gain.value = g
    lfo.connect(lg).connect(og.gain)
    o.connect(og).connect(mestre)
    o.start()
    lfo.start()
  }

  // o hum da lâmpada de sódio (120 Hz e harmônicos, bem baixo)
  const hum = ctx.createOscillator()
  hum.type = 'sawtooth'
  hum.frequency.value = 120
  const hf = ctx.createBiquadFilter()
  hf.type = 'bandpass'
  hf.frequency.value = 480
  hf.Q.value = 4
  const hg = ctx.createGain()
  hg.gain.value = 0.006
  hum.connect(hf).connect(hg).connect(mestre)
  hum.start()

  // o sopro da rolagem
  const s = ruido()
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 0.7
  sopro = ctx.createGain()
  sopro.gain.value = 0
  s.connect(bp).connect(sopro).connect(mestre)
  sopro.filtro = bp

  const loop = () => {
    if (!ctx) return
    const v = Math.min(1, Math.abs(estado.rolagem.vel) / 3500)
    const t = ctx.currentTime
    sopro.gain.setTargetAtTime(ligado ? v * 0.22 : 0, t, 0.12)
    sopro.filtro.frequency.setTargetAtTime(600 + v * 1800, t, 0.15)
    requestAnimationFrame(loop)
  }
  loop()
  return true
}

export function ligarSom(sim) {
  if (sim && !ctx && !criar()) return false
  if (!ctx) return false
  ligado = sim
  if (sim) ctx.resume()
  mestre.gain.setTargetAtTime(sim ? 0.9 : 0, ctx.currentTime, 0.4)
  return true
}

/** um clique curto e afinado (passar por cima, escolher) */
export function tique(forte = false) {
  if (!ligado || !ctx) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(forte ? 660 : 1320, t)
  o.frequency.exponentialRampToValueAtTime(forte ? 440 : 990, t + 0.08)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(forte ? 0.06 : 0.018, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + (forte ? 0.35 : 0.09))
  o.connect(g).connect(mestre)
  o.start(t)
  o.stop(t + 0.4)
}

/** um acorde que acende (copiar e-mail, descobrir algo) */
export function acender() {
  if (!ligado || !ctx) return
  const t = ctx.currentTime
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const o = ctx.createOscillator()
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t + i * 0.05)
    g.gain.linearRampToValueAtTime(0.035, t + i * 0.05 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 1.4)
    o.connect(g).connect(mestre)
    o.start(t + i * 0.05)
    o.stop(t + 1.6)
  })
}
