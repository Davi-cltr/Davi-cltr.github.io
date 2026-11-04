// Planos presos à câmera e sincronizados com um elemento do DOM: o WebGL ocupa exatamente
// o lugar da imagem da página (que continua lá para leitores de tela e para quem não tem WebGL).
import * as THREE from 'three'
import { GLSL_RUIDO, globais, sorteio } from './comum.js'
import { estado } from '../core/store.js'

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

/** o retrato da abertura: recortado, iluminado pela luz de sódio do cursor */
export function criarRetrato(textura) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      ...globais,
      tFoto: { value: textura },
      uRevela: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVel: { value: 0 },
      uSaida: { value: 0 },
      uTexel: { value: new THREE.Vector2(1 / 545, 1 / 1090) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uSaida;
      uniform float uTempo;
      void main() {
        vUv = uv;
        vec3 p = position;
        // ao rolar para longe, o retrato se curva levemente, como papel
        p.z -= sin(uv.y * 3.14159) * uSaida * 0.25;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tFoto;
      uniform float uRevela;
      uniform vec2 uMouse;
      uniform float uVel;
      uniform float uTempo;
      uniform float uSaida;
      uniform vec2 uTexel;
      varying vec2 vUv;
      ${GLSL_RUIDO}
      void main() {
        vec2 uv = vUv;
        // varredura de entrada, de baixo para cima, com linhas que tremem
        float frente = uRevela * 1.25 - 0.1;
        float faixa = step(uv.y, frente);
        float borda = smoothstep(0.035, 0.0, abs(uv.y - frente)) * step(0.0, uRevela) * (1.0 - step(1.0, uRevela));
        float linha = step(0.5, fract(uv.y * 160.0));
        uv.x += (h21(vec2(floor(uv.y * 90.0), floor(uTempo * 12.0))) - 0.5) * borda * 0.04;
        // separação de cor quando o mouse corre
        float sep = uVel * 0.012 + uSaida * 0.01;
        vec4 c = texture2D(tFoto, uv);
        float rr = texture2D(tFoto, uv + vec2(sep, 0.0)).r;
        float bb = texture2D(tFoto, uv - vec2(sep, 0.0)).b;
        vec3 cor = vec3(rr, c.g, bb);
        float a = c.a;
        // normal falsa a partir do alfa: luz de recorte do lado do cursor
        float ax = texture2D(tFoto, uv + vec2(uTexel.x * 3.0, 0.0)).a - texture2D(tFoto, uv - vec2(uTexel.x * 3.0, 0.0)).a;
        float ay = texture2D(tFoto, uv + vec2(0.0, uTexel.y * 3.0)).a - texture2D(tFoto, uv - vec2(0.0, uTexel.y * 3.0)).a;
        vec2 n = -vec2(ax, ay);
        vec2 l = normalize(uMouse - uv + 1e-4);
        float recorte = max(dot(normalize(n + 1e-5), l), 0.0) * min(length(n), 0.6) * 1.6;
        float perto = exp(-distance(uMouse, uv) * 3.2);
        vec3 sodio = vec3(1.0, 0.70, 0.25);
        cor *= 0.72 + perto * 0.55;
        cor += sodio * recorte * (0.35 + perto * 0.8);
        cor = mix(cor, cor * vec3(1.05, 0.92, 0.78), perto * 0.5);
        // grão e linhas de varredura muito sutis
        cor += (h21(uv * 900.0 + uTempo) - 0.5) * 0.035;
        cor *= 0.97 + linha * 0.03;
        cor += sodio * borda * 1.6;
        float alfa = a * faixa + borda * a;
        alfa *= 1.0 - uSaida * 0.85;
        if (alfa < 0.01) discard;
        gl_FragColor = vec4(cor, alfa);
      }`,
    transparent: true,
    depthWrite: false,
  })
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 32), mat)
  malha.renderOrder = 5
  return malha
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

export { estado }
