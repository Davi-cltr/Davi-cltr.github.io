// Objetos presos à câmera e sincronizados com um elemento do DOM, e o retrato em partículas da seção Sobre.
import * as THREE from 'three'
import { globais, sorteio } from './comum.js'

export const DISTANCIA = 8

/** posiciona um objeto preso à câmera sobre o retângulo de um elemento */
export function sobreElemento(obj, el, camera, { escalaAltura = true } = {}) {
  const r = el.getBoundingClientRect()
  const meiaAltura = DISTANCIA * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const meiaLargura = meiaAltura * camera.aspect
  const cx = ((r.left + r.width / 2) / innerWidth) * 2 - 1
  const cy = -(((r.top + r.height / 2) / innerHeight) * 2 - 1)
  obj.position.set(cx * meiaLargura, cy * meiaAltura, -DISTANCIA)
  const h = (r.height / innerHeight) * 2 * meiaAltura
  const w = (r.width / innerWidth) * 2 * meiaLargura
  if (escalaAltura) obj.scale.set(w, h, 1)
  const visivel = r.bottom > -innerHeight * 0.15 && r.top < innerHeight * 1.05 && r.width > 0
  return { r, w, h, visivel }
}

/** o retrato em partículas: espalhado como poeira de luz, se monta com a rolagem */
export function criarRetratoParticulas(imagem, { passo = 4 } = {}) {
  const c = document.createElement('canvas')
  c.width = imagem.width
  c.height = imagem.height
  const g = c.getContext('2d', { willReadFrequently: true })
  g.drawImage(imagem, 0, 0)
  const dados = g.getImageData(0, 0, c.width, c.height).data
  const r = sorteio(21)
  const alvos = []
  const cores = []
  const caos = []
  const sementes = []
  const aspecto = c.width / c.height
  for (let y = 0; y < c.height; y += passo)
    for (let x = 0; x < c.width; x += passo) {
      const i = (y * c.width + x) * 4
      if (dados[i + 3] < 140) continue
      const jx = x + (r() - 0.5) * passo
      const jy = y + (r() - 0.5) * passo
      alvos.push((jx / c.width - 0.5) * aspecto, -(jy / c.height - 0.5), (r() - 0.5) * 0.02)
      cores.push(dados[i] / 255, dados[i + 1] / 255, dados[i + 2] / 255)
      const a = r() * Math.PI * 2
      const raio = 0.4 + r() * 0.9
      caos.push(Math.cos(a) * raio, (r() - 0.5) * 2.4, Math.sin(a) * raio * 0.8)
      sementes.push(r())
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(alvos, 3))
  geo.setAttribute('aCor', new THREE.Float32BufferAttribute(cores, 3))
  geo.setAttribute('aCaos', new THREE.Float32BufferAttribute(caos, 3))
  geo.setAttribute('aSemente', new THREE.Float32BufferAttribute(sementes, 1))
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      ...globais,
      uMonta: { value: 0 },
      uMouse: { value: new THREE.Vector3(9, 9, 0) },
      uTamanho: { value: passo * 0.9 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aCor;
      attribute vec3 aCaos;
      attribute float aSemente;
      uniform float uMonta;
      uniform float uTempo;
      uniform vec3 uMouse;
      uniform float uTamanho;
      uniform float uPixel;
      uniform float uAltura;
      varying vec3 vCor;
      varying float vMonta;
      void main() {
        // cada partícula chega no seu tempo
        float k = smoothstep(aSemente * 0.45, aSemente * 0.45 + 0.55, uMonta);
        vMonta = k;
        vec3 solto = aCaos + vec3(sin(uTempo * 0.4 + aSemente * 30.0), cos(uTempo * 0.3 + aSemente * 20.0), sin(uTempo * 0.2 + aSemente * 9.0)) * 0.15;
        // espiral no caminho
        float a = (1.0 - k) * 3.0 * (aSemente - 0.5);
        mat2 gira = mat2(cos(a), -sin(a), sin(a), cos(a));
        vec3 p = mix(solto, position, k);
        p.xz = gira * p.xz;
        // o cursor empurra as partículas, que voltam devagar
        vec3 d = p - uMouse;
        float f = exp(-dot(d.xy, d.xy) * 18.0) * k;
        p.xy += normalize(d.xy + 1e-4) * f * 0.12;
        p.z += f * 0.25;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uTamanho * uPixel * (uAltura / 900.0) * (1.0 + (1.0 - k) * 0.6) * (8.0 / -mv.z);
        vCor = aCor;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vCor;
      varying float vMonta;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        vec3 sodio = vec3(1.0, 0.7, 0.28);
        vec3 cor = mix(sodio * 0.9, vCor * 1.08 + sodio * 0.06, vMonta);
        float alfa = smoothstep(0.5, 0.2, d) * mix(0.3, 1.0, vMonta);
        gl_FragColor = vec4(cor, alfa);
      }`,
    transparent: true,
    depthWrite: false,
  })
  const pontos = new THREE.Points(geo, mat)
  pontos.frustumCulled = false
  pontos.renderOrder = 4
  return { pontos, aspecto }
}

