// O palco: um único canvas WebGL atrás da página. A câmera viaja por uma cidade de código
// conforme a rolagem: abertura → sobre → habilidades → projetos → a avenida da trajetória → o horizonte.
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { estado } from '../core/store.js'
import { asset } from '../lib/asset.js'
import { projects } from '../data/projects.js'
import { COR, globais, suave } from './comum.js'
import { atlasDeCodigo, criarCampoDeCodigo } from './Codigo.js'
import { criarRetratoParticulas, sobreElemento } from './Retrato.js'
import { criarConstelacao, habilidades } from './Constelacao.js'
import { criarEstrada, ESTRADA } from './Estrada.js'
import { criarHorizonte, criarPoeira, criarPredios, criarRastros } from './Cidade.js'
import { criarCaptura } from './Capturas.js'

const ORDEM = ['inicio', 'sobre', 'habilidades', 'projetos', 'trajetoria', 'contato']
const V = (x, y, z) => new THREE.Vector3(x, y, z)

/** onde a câmera fica em cada capítulo (p = progresso local, usado na avenida) */
function ancora(id, p, out) {
  switch (id) {
    case 'inicio':
      return out.set(V(0, 0, 9 - p * 2), V(0, 0, -2 - p * 2), 0.04)
    case 'sobre':
      return out.set(V(0, 0, -62 - p * 3), V(0, 0, -72 - p * 3), 0.05)
    case 'habilidades':
      return out.set(V(0, 0, -132), V(0, 0, -142), 0.05)
    case 'projetos':
      return out.set(V(0, 0, -202 - p * 6), V(0, 0, -212 - p * 6), 0.045)
    case 'trajetoria': {
      const z = ESTRADA.z0 + 4 - p * (ESTRADA.z0 - ESTRADA.z1 - 6)
      return out.set(V(0, 0.35, z), V(0, -0.1, z - 12), 0.02)
    }
    default:
      return out.set(V(0, 1.2, -420 + p * 6), V(0, 7, -470), 0.0045)
  }
}

class Pose {
  constructor() {
    this.pos = new THREE.Vector3()
    this.alvo = new THREE.Vector3()
    this.nevoa = 0.04
  }
  set(p, a, n) {
    this.pos.copy(p)
    this.alvo.copy(a)
    this.nevoa = n
    return this
  }
  lerp(b, t) {
    this.pos.lerp(b.pos, t)
    this.alvo.lerp(b.alvo, t)
    this.nevoa += (b.nevoa - this.nevoa) * t
    return this
  }
}

export class Palco {
  constructor(canvas) {
    this.canvas = canvas
    this.relogio = new THREE.Clock()
    this.secoes = []
    this.elementos = new Map()
    this.poseA = new Pose()
    this.poseB = new Pose()
    this.alvoCam = new THREE.Vector3()
    this.camPosSuave = new THREE.Vector3(0, 0, 9)
    this.alvoSuave = new THREE.Vector3(0, 0, -2)
    this.velCam = 0
    this.avanco = 0
    this.rot = { x: 0, y: 0, alvoX: 0, alvoY: 0, arrastando: false }
    this.flash = 0
    this.revela = 0
    this.capturas = new Map()
    this.texturas = new Map()
    this.loader = new THREE.TextureLoader()
  }

  /** cria tudo e carrega o que a abertura precisa; informa o progresso (0..1) */
  async iniciar(aoProgresso = () => {}) {
    const alta = estado.qualidade === 'alta'
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    r.outputColorSpace = THREE.LinearSRGBColorSpace
    r.toneMapping = THREE.NoToneMapping
    r.setClearColor(COR.noite, 1)
    this.renderer = r
    this.cena = new THREE.Scene()
    this.cena.background = COR.noite.clone()
    this.camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 1200)
    this.camera.position.set(0, 0, 9)
    this.cena.add(this.camera)
    this.redimensionar()

    let feitos = 0
    const total = 3 + projects.length
    const passo = () => aoProgresso(++feitos / total)

    // fontes primeiro (o atlas de código usa a fonte mono)
    try {
      await Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 2500))])
      await document.fonts.load('500 26px "JetBrains Mono"')
    } catch {
      /* segue com a fonte de reserva */
    }
    passo()
    const atlas = atlasDeCodigo()
    this.codigo = criarCampoDeCodigo(atlas, { quantidade: alta ? 620 : 340 })
    this.cena.add(this.codigo)
    passo()

    const pequena = await this.carregar(asset('images/davi-545.webp'))
    const part = criarRetratoParticulas(pequena.image, { passo: alta ? 4 : 6 })
    this.particulas = part.pontos
    this.particulas.visible = false
    this.camera.add(this.particulas)
    passo()

    // a primeira captura de cada projeto já vem pronta
    await Promise.all(
      projects.map((p) =>
        this.textura(p.images[0].src).then(() => {
          passo()
        }),
      ),
    )
    for (const p of projects) {
      const m = criarCaptura()
      m.visible = false
      this.camera.add(m)
      const t = this.texturas.get(p.images[0].src)
      m.material.uniforms.tA.value = t
      m.material.uniforms.tB.value = t
      m.material.uniforms.uAspA.value = p.images[0].width / p.images[0].height
      this.capturas.set(p.id, { malha: m, indice: 0, transicao: null, entrada: 0, sobre: 0, mouse: new THREE.Vector2(0.5, 0.5) })
    }

    this.const = criarConstelacao()
    this.const.grupo.visible = false
    this.camera.add(this.const.grupo)

    const estrada = criarEstrada()
    this.estrada = estrada
    this.cena.add(estrada.grupo)
    this.prediosRua = criarPredios({
      quantidade: alta ? 160 : 80,
      area: { x0: -70, x1: 70, z0: ESTRADA.z0 + 20, z1: ESTRADA.z1 - 60, y: ESTRADA.y },
      foraDe: 14,
      semente: 8,
      alturaMax: 34,
    })
    this.cena.add(this.prediosRua)
    this.skyline = criarPredios({
      quantidade: alta ? 420 : 200,
      area: { x0: -340, x1: 340, z0: -560, z1: -760, y: -46 },
      semente: 12,
      alturaMin: 10,
      alturaMax: 80,
    })
    this.cena.add(this.skyline)
    this.horizonte = criarHorizonte()
    this.horizonte.position.set(0, 40, -820)
    this.cena.add(this.horizonte)

    this.poeira = criarPoeira(alta ? 1400 : estado.toque ? 350 : 600)
    this.cena.add(this.poeira)
    this.rastros = criarRastros(alta ? 260 : 120)
    this.camera.add(this.rastros)

    if (alta) {
      this.composer = new EffectComposer(r)
      this.composer.addPass(new RenderPass(this.cena, this.camera))
      this.bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.75, 0.55, 0.62)
      this.composer.addPass(this.bloom)
      this.composer.addPass(new OutputPass())
    }
    this.redimensionar()
    this.ligarArrasto()
    // compila tudo antes da abertura terminar (evita travadas na primeira rolagem)
    this.visivelTudo(true)
    try {
      await r.compileAsync(this.cena, this.camera)
    } catch {
      /* compila na primeira vez que aparecer */
    }
    this.visivelTudo(false)
    estado.gl = true
  }

  visivelTudo(v) {
    for (const o of [this.particulas, this.const.grupo, ...[...this.capturas.values()].map((c) => c.malha)]) o.visible = v
  }

  carregar(url) {
    return new Promise((ok, falha) =>
      this.loader.load(
        url,
        (t) => {
          t.colorSpace = THREE.NoColorSpace
          t.minFilter = THREE.LinearFilter
          t.generateMipmaps = false
          ok(t)
        },
        undefined,
        falha,
      ),
    )
  }

  textura(src) {
    if (this.texturas.has(src)) return Promise.resolve(this.texturas.get(src))
    const largura = estado.qualidade === 'alta' && devicePixelRatio > 1 ? 1280 : 1280
    return this.carregar(asset(`images/projects/${src}-${largura}.webp`)).then((t) => {
      this.texturas.set(src, t)
      return t
    })
  }

  /** mede onde cada capítulo começa e termina (chamado quando a página muda de tamanho) */
  medir() {
    this.secoes = ORDEM.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const caixa = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
      const r = caixa.getBoundingClientRect()
      const topo = r.top + scrollY
      return { id, topo, fim: topo + r.height }
    }).filter(Boolean)
  }

  redimensionar() {
    if (!this.renderer) return
    const dpr = Math.min(devicePixelRatio, estado.qualidade === 'alta' ? 1.75 : 1.25)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(innerWidth, innerHeight, false)
    this.composer?.setPixelRatio(dpr)
    this.composer?.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
    globais.uPixel.value = dpr
    globais.uAltura.value = innerHeight
    this.medir()
  }

  el(chave, seletor) {
    let e = this.elementos.get(chave)
    if (!e || !e.isConnected) {
      e = document.querySelector(seletor)
      if (e) this.elementos.set(chave, e)
    }
    return e
  }

  ligarArrasto() {
    const baixo = (e) => {
      const alvo = e.target.closest?.('[data-gl="constelacao"]')
      if (!alvo || e.target.closest('button')) return
      this.rot.arrastando = true
      this.rot.ult = { x: e.clientX, y: e.clientY }
    }
    const mover = (e) => {
      if (!this.rot.arrastando) return
      this.rot.alvoY += (e.clientX - this.rot.ult.x) * 0.006
      this.rot.alvoX += (e.clientY - this.rot.ult.y) * 0.004
      this.rot.alvoX = THREE.MathUtils.clamp(this.rot.alvoX, -0.7, 0.7)
      this.rot.ult = { x: e.clientX, y: e.clientY }
    }
    const cima = () => (this.rot.arrastando = false)
    addEventListener('pointerdown', baixo)
    addEventListener('pointermove', mover)
    addEventListener('pointerup', cima)
    this.soltarArrasto = () => {
      removeEventListener('pointerdown', baixo)
      removeEventListener('pointermove', mover)
      removeEventListener('pointerup', cima)
    }
  }

  /** um clarão na luz (cliques, e-mail copiado) */
  clarao() {
    this.flash = 1
  }

  quadro() {
    const dt = Math.min(this.relogio.getDelta(), 0.1)
    const t = this.relogio.elapsedTime
    globais.uTempo.value = t
    const reduzido = estado.reduzido
    const vh = innerHeight

    // ——— câmera: qual capítulo está no centro da tela
    const s = scrollY + vh * 0.5
    const T = vh * 0.6
    const lista = this.secoes
    let i = lista.findIndex((x) => s < x.fim)
    if (i < 0) i = lista.length - 1
    const local = (k) => {
      const x = lista[k]
      if (x.id === 'trajetoria') return estado.secoes['trajetoria-pin'] ?? 0
      return THREE.MathUtils.clamp((s - x.topo) / Math.max(1, x.fim - x.topo), 0, 1)
    }
    if (lista.length) {
      const atual = lista[i]
      ancora(atual.id, local(i), this.poseA)
      const ateFim = atual.fim - s
      const desdeInicio = s - atual.topo
      if (i < lista.length - 1 && ateFim < T) {
        ancora(lista[i + 1].id, 0, this.poseB)
        this.poseA.lerp(this.poseB, suave(T, -T, ateFim) * 1.0)
      } else if (i > 0 && desdeInicio < T) {
        ancora(lista[i - 1].id, 1, this.poseB)
        this.poseB.lerp(this.poseA, suave(-T, T, desdeInicio))
        this.poseA.pos.copy(this.poseB.pos)
        this.poseA.alvo.copy(this.poseB.alvo)
        this.poseA.nevoa = this.poseB.nevoa
      }
    }
    const m = estado.mouse
    const par = reduzido ? 0 : 1
    this.alvoCam.copy(this.poseA.pos).add(new THREE.Vector3(m.x * 0.35 * par, m.y * 0.22 * par, 0))
    const k = reduzido ? 1 : 1 - Math.exp(-dt * 5)
    const antes = this.camPosSuave.z
    this.camPosSuave.lerp(this.alvoCam, k)
    this.alvoSuave.lerp(this.poseA.alvo, k)
    this.camera.position.copy(this.camPosSuave)
    this.camera.lookAt(this.alvoSuave)
    const vel = (this.camPosSuave.z - antes) / Math.max(dt, 1e-3)
    this.velCam += (vel - this.velCam) * 0.15
    this.avanco += -vel * dt
    globais.uNevoa.value += (this.poseA.nevoa - globais.uNevoa.value) * k
    this.camera.updateMatrixWorld()
    const z = this.camera.position.z

    // ——— a luz de sódio: o cursor projetado no espaço, ou passeando sozinha no toque
    const ativo = m.ativo && !estado.toque
    const nx = ativo ? m.x : Math.sin(t * 0.35) * 0.55
    const ny = ativo ? m.y : Math.sin(t * 0.47 + 1) * 0.35
    const luz = new THREE.Vector3(nx, ny, 0.5).unproject(this.camera).sub(this.camera.position).normalize()
    globais.uLuz.value.copy(this.camera.position).addScaledVector(luz, 11)
    this.flash *= Math.exp(-dt * 3)
    globais.uLuzForca.value = 1 + this.flash * 1.5

    // ——— abertura
    this.revela = Math.min(1, this.revela + dt * (estado.pronto ? 0.45 : 0))
    const viajando = Math.min(1, Math.abs(this.velCam) / 60)
    this.codigo.visible = z > -110
    this.codigo.material.uniforms.uRevela.value = reduzido && estado.pronto ? 1 : this.revela
    this.codigo.material.uniforms.uDobra.value = reduzido ? 0 : viajando * 3
    this.rastros.material.uniforms.uVel.value = reduzido ? 0 : viajando
    this.rastros.material.uniforms.uAvanco.value = this.avanco
    this.poeira.material.uniforms.uDeslocamento.value.copy(this.camera.position)

    // ——— retrato em partículas (sobre)
    const ePart = this.el('particulas', '[data-gl="particulas"]')
    if (ePart) {
      const { visivel, h } = sobreElemento(this.particulas, ePart, this.camera, { escalaAltura: false })
      this.particulas.scale.setScalar(h)
      this.particulas.visible = visivel
      const pm = estado.secoes['sobre-retrato'] ?? 0
      this.particulas.material.uniforms.uMonta.value = reduzido ? 1 : suave(0.05, 0.5, pm)
      const r = ePart.getBoundingClientRect()
      const lx = ((m.px - r.left) / Math.max(1, r.height) - r.width / r.height / 2) * 1
      const ly = -((m.py - r.top) / Math.max(1, r.height) - 0.5)
      this.particulas.material.uniforms.uMouse.value.set(ativo ? lx : 9, ativo ? ly : 9, 0)
      this.particulas.rotation.y = reduzido ? 0 : (pm - 0.5) * 0.5 + m.x * 0.12
    }

    // ——— constelação (habilidades)
    const eConst = this.el('constelacao', '[data-gl="constelacao"]')
    if (eConst) {
      const { visivel, r, h } = sobreElemento(this.const.grupo, eConst, this.camera, { escalaAltura: false })
      const tam = Math.min(h, (r.width / Math.max(1, r.height)) * h)
      this.const.grupo.scale.setScalar(tam * 0.95)
      this.const.grupo.visible = visivel
      const entrada = reduzido ? 1 : suave(0.15, 0.55, estado.secoes.habilidades ?? 0)
      this.const.matFios.uniforms.uEntrada.value = entrada
      this.const.matNos.uniforms.uEntrada.value = entrada
      this.const.matNos.uniforms.uEscala.value = Math.min(1.4, Math.max(0.7, r.height / 640))
      if (!this.rot.arrastando && !reduzido) this.rot.alvoY += dt * 0.06
      this.rot.x += (this.rot.alvoX + m.y * -0.15 * par - this.rot.x) * 0.08
      this.rot.y += (this.rot.alvoY + m.x * 0.2 * par - this.rot.y) * 0.08
      this.const.grupo.rotation.set(this.rot.x, this.rot.y, 0)
      const ativoH = estado.habilidade
      this.const.matFios.uniforms.uAtivo.value = ativoH
      this.const.matNos.uniforms.uAtivo.value = ativoH
      const fontesH = ativoH >= 0 ? habilidades[ativoH].sources : []
      this.const.matNos.uniforms.uFontesAtivas.value.set(
        ...this.const.fontes.map((f) => (fontesH.includes(f.id) ? 1 : 0)),
      )
      if (visivel) this.rotulos(entrada, r)
    }

    // ——— capturas dos projetos
    for (const [id, c] of this.capturas) {
      const e = this.el(`cap-${id}`, `[data-gl-captura="${id}"]`)
      if (!e) {
        c.malha.visible = false
        continue
      }
      const { visivel, r, w, h } = sobreElemento(c.malha, e, this.camera)
      c.malha.visible = visivel && r.height > 10
      const u = c.malha.material.uniforms
      u.uAspPlano.value = w / Math.max(1e-3, h)
      const alvoIdx = estado.capturas[id] ?? 0
      const proj = projects.find((p) => p.id === id)
      if (alvoIdx !== c.indice && !c.transicao) {
        const img = proj.images[alvoIdx]
        c.transicao = { de: c.indice, para: alvoIdx, t: 0, pronta: false }
        this.textura(img.src).then((tx) => {
          u.tB.value = tx
          u.uAspB.value = img.width / img.height
          if (c.transicao) c.transicao.pronta = true
        })
      }
      if (c.transicao?.pronta) {
        c.transicao.t = Math.min(1, c.transicao.t + dt * (reduzido ? 10 : 1.4))
        u.uMistura.value = c.transicao.t
        if (c.transicao.t >= 1) {
          u.tA.value = u.tB.value
          u.uAspA.value = u.uAspB.value
          u.uMistura.value = 0
          c.indice = c.transicao.para
          c.transicao = null
        }
      }
      const dentro = m.px >= r.left && m.px <= r.right && m.py >= r.top && m.py <= r.bottom && ativo
      c.sobre += ((dentro ? 1 : 0) - c.sobre) * 0.08
      u.uSobre.value = c.sobre
      if (dentro) u.uMouse.value.set((m.px - r.left) / r.width, 1 - (m.py - r.top) / r.height)
      // entra uma vez, quando a moldura chega na tela, e termina sozinha
      if (r.top < innerHeight * 0.75) c.entrou = true
      if (c.entrou) c.entrada = Math.min(1, c.entrada + dt * 0.9)
      u.uEntrada.value = reduzido ? 1 : c.entrada
      u.uVel.value = reduzido ? 0 : THREE.MathUtils.clamp(estado.rolagem.vel / 4000, -1, 1)
    }

    // ——— avenida e cidade
    this.estrada.uniformes.uCamZ.value = z
    const pj = estado.secoes['trajetoria-pin'] ?? 0
    this.estrada.uniformes.uEntrada.value = suave(-0.02, 0.06, pj) + (z < ESTRADA.z1 ? 1 : 0)
    this.estrada.grupo.visible = z < -215 && z > ESTRADA.z1 - 120
    this.prediosRua.visible = this.estrada.grupo.visible
    this.skyline.visible = z < -330
    this.horizonte.visible = this.skyline.visible
    this.horizonte.material.uniforms.uForca.value = suave(-360, -415, z)
    this.horizonte.material.uniforms.uCentro.value += ((ativo ? m.x : Math.sin(t * 0.2)) - this.horizonte.material.uniforms.uCentro.value) * 0.05
    this.skyline.material.uniforms.uAcende.value = suave(-380, -418, z)

    if (this.composer) {
      this.bloom.strength = 0.7 + this.flash * 0.6 + viajando * 0.4
      this.composer.render(dt)
    } else this.renderer.render(this.cena, this.camera)
  }

  /** coloca os rótulos (botões do DOM) sobre os pontos da constelação */
  rotulos(entrada, caixa) {
    const v = new THREE.Vector3()
    const centro = new THREE.Vector3().setFromMatrixPosition(this.const.grupo.matrixWorld)
    const dc = centro.distanceTo(this.camera.position)
    const escala = this.const.grupo.scale.x || 1
    const pos = (no, el) => {
      v.copy(no).applyMatrix4(this.const.grupo.matrixWorld)
      // profundidade: 1 = mais perto que o centro, 0 = atrás
      const prof = THREE.MathUtils.clamp(0.5 + (dc - v.distanceTo(this.camera.position)) / escala, 0, 1)
      v.project(this.camera)
      const x = (v.x * 0.5 + 0.5) * innerWidth - caixa.left
      const y = (-v.y * 0.5 + 0.5) * innerHeight - caixa.top
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
      el.style.setProperty('--prof', prof.toFixed(3))
      el.style.opacity = String(entrada)
    }
    this.const.nos.forEach((n) => {
      const el = this.el(`rot-h-${n.i}`, `[data-gl-rotulo="h-${n.i}"]`)
      if (el) pos(n.pos, el)
    })
    this.const.fontes.forEach((f) => {
      const el = this.el(`rot-f-${f.id}`, `[data-gl-rotulo="f-${f.id}"]`)
      if (el) pos(f.pos, el)
    })
  }

  destruir() {
    this.soltarArrasto?.()
    this.renderer?.dispose()
    this.composer?.dispose?.()
  }
}
