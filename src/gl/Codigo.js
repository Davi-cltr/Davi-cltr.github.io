// O campo de código: linhas reais do StudentOS e do Conferente suspensas no escuro.
// Quase invisíveis; a luz de sódio (o cursor) revela as que estão perto dela.
import * as THREE from 'three'
import { heroCode } from '../data/heroCode.js'
import { GLSL_NEVOA, globais, sorteio } from './comum.js'

const ALTURA_LINHA = 40
const LARGURA = 2048

/** textura com uma linha de código por faixa */
export function atlasDeCodigo() {
  const linhas = heroCode.filter((l) => l.trim().length > 3).slice(0, 96)
  const c = document.createElement('canvas')
  c.width = LARGURA
  c.height = linhas.length * ALTURA_LINHA
  const g = c.getContext('2d')
  g.font = `500 26px "JetBrains Mono", ui-monospace, monospace`
  g.textBaseline = 'middle'
  const larguras = linhas.map((l, i) => {
    const texto = l.replace(/\t/g, '  ')
    g.fillStyle = '#fff'
    g.fillText(texto, 8, i * ALTURA_LINHA + ALTURA_LINHA / 2)
    return Math.min(1, (g.measureText(texto).width + 16) / LARGURA)
  })
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.NoColorSpace
  tex.anisotropy = 4
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  return { tex, n: linhas.length, larguras, linhas }
}

export function criarCampoDeCodigo(atlas, { quantidade = 520 } = {}) {
  const r = sorteio(7)
  const geo = new THREE.PlaneGeometry(1, 1)
  const aLinha = new Float32Array(quantidade)
  const aLargura = new Float32Array(quantidade)
  const aSemente = new Float32Array(quantidade)
  const aCor = new Float32Array(quantidade)
  const malha = new THREE.InstancedMesh(geo, null, quantidade)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const p = new THREE.Vector3()
  const altura = 0.2
  for (let i = 0; i < quantidade; i++) {
    const linha = Math.floor(r() * atlas.n)
    aLinha[i] = linha
    aLargura[i] = atlas.larguras[linha]
    aSemente[i] = r()
    aCor[i] = r()
    const w = (atlas.larguras[linha] * LARGURA) / ALTURA_LINHA * altura
    // a maior parte atrás da abertura; o resto ao longo do caminho até "Sobre"
    const z = i < quantidade * 0.55 ? -1 - r() * 16 : -17 - r() * 44
    const espalha = 1 + Math.max(0, -z - 10) * 0.02
    p.set((r() - 0.5) * 26 * espalha, (r() - 0.5) * 15 * espalha, z)
    // alinhadas pela esquerda, como num editor
    p.x += w / 2
    s.set(w, altura, 1)
    m.compose(p, q, s)
    malha.setMatrixAt(i, m)
  }
  geo.setAttribute('aLinha', new THREE.InstancedBufferAttribute(aLinha, 1))
  geo.setAttribute('aLargura', new THREE.InstancedBufferAttribute(aLargura, 1))
  geo.setAttribute('aSemente', new THREE.InstancedBufferAttribute(aSemente, 1))
  geo.setAttribute('aCor', new THREE.InstancedBufferAttribute(aCor, 1))

  malha.material = new THREE.ShaderMaterial({
    uniforms: {
      ...globais,
      tAtlas: { value: atlas.tex },
      uLinhas: { value: atlas.n },
      uRevela: { value: 0 },
      uDobra: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aLinha;
      attribute float aLargura;
      attribute float aSemente;
      attribute float aCor;
      uniform float uTempo;
      uniform float uDobra;
      varying vec2 vUv;
      varying vec3 vMundo;
      varying float vSemente;
      varying float vCor;
      varying float vLinha;
      varying float vLargura;
      varying float vDist;
      void main() {
        vUv = uv;
        vSemente = aSemente;
        vCor = aCor;
        vLinha = aLinha;
        vLargura = aLargura;
        vec4 mundo = modelMatrix * instanceMatrix * vec4(position, 1.0);
        // deriva lenta, cada linha no seu ritmo
        mundo.y += sin(uTempo * 0.25 + aSemente * 40.0) * 0.08;
        mundo.x += sin(uTempo * 0.12 + aSemente * 17.0) * 0.12;
        // ao viajar, as linhas se esticam na direção do movimento (rastro)
        mundo.z += (uv.x - 0.5) * uDobra * (2.0 + aSemente * 6.0);
        vMundo = mundo.xyz;
        vec4 mv = viewMatrix * mundo;
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tAtlas;
      uniform float uLinhas;
      uniform vec3 uLuz;
      uniform float uLuzForca;
      uniform float uTempo;
      uniform float uRevela;
      uniform float uDobra;
      varying vec2 vUv;
      varying vec3 vMundo;
      varying float vSemente;
      varying float vCor;
      varying float vLinha;
      varying float vLargura;
      varying float vDist;
      ${GLSL_NEVOA}
      void main() {
        vec2 uv = vec2(vUv.x * vLargura, (vLinha + (1.0 - vUv.y)) / uLinhas);
        uv.y = 1.0 - uv.y;
        float a = texture2D(tAtlas, uv).r;
        // a luz de sódio revela o código perto dela
        float d = distance(vMundo, uLuz);
        float luz = exp(-d * d * 0.09) * uLuzForca;
        float halo = exp(-d * 0.38) * 0.26 * uLuzForca;
        // a abertura acende as linhas da esquerda para a direita
        float revela = smoothstep(vSemente * 0.6, vSemente * 0.6 + 0.4, uRevela);
        float base = 0.035 + 0.03 * sin(uTempo * 0.7 + vSemente * 50.0);
        vec3 fria = mix(vec3(0.30, 0.42, 0.85), vec3(0.62, 0.68, 0.80), step(0.55, vCor));
        vec3 quente = mix(vec3(1.0, 0.70, 0.24), vec3(1.0, 0.84, 0.60), vCor);
        vec3 cor = fria * base + quente * (luz * 1.7 + halo);
        cor += vec3(1.0, 0.7, 0.3) * uDobra * 0.25;
        float alfa = a * revela * clamp(base * 2.0 + luz * 1.8 + halo + uDobra * 0.4, 0.0, 1.0);
        if (alfa < 0.01) discard;
        gl_FragColor = vec4(nevoa(cor, vDist), alfa);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  malha.frustumCulled = false
  return malha
}
