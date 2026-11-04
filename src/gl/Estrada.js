// A trajetória como uma avenida à noite: cada poste é um mês. Os postes do passado acendem
// quando a câmera chega neles; o de hoje é o mais forte; depois dele, a rua ainda não foi feita.
import * as THREE from 'three'
import { timelineRange } from '../data/career.js'
import { GLSL_NEVOA, globais } from './comum.js'

export const ESTRADA = { z0: -262, z1: -382, y: -1.5, largura: 9, passo: 5 }

const meses = (s) => {
  const [a, m] = s.split('-').map(Number)
  return a * 12 + (m - 1)
}
const INI = meses(timelineRange.start)
const FIM = meses(timelineRange.end)

/** z da estrada para uma data 'AAAA-MM' */
export function zDaData(s) {
  const t = (meses(s) - INI) / (FIM - INI)
  return ESTRADA.z0 - 10 - t * (ESTRADA.z0 - ESTRADA.z1 - 20)
}

export function hojeZ() {
  const d = new Date()
  return zDaData(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}

const uEstrada = {
  uCamZ: { value: ESTRADA.z0 },
  uHojeZ: { value: hojeZ() },
  uEntrada: { value: 0 },
}

const GLSL_ACESO = /* glsl */ `
uniform float uCamZ;
uniform float uHojeZ;
uniform float uEntrada;
// um poste acende quando está no passado e a câmera já chegou perto dele
float acesoEm(float z) {
  float passado = step(uHojeZ - 0.01, z);
  float chegou = smoothstep(uCamZ - 34.0, uCamZ - 16.0, z);
  return passado * chegou * uEntrada;
}
`

export function criarEstrada() {
  const grupo = new THREE.Group()
  const comp = ESTRADA.z0 - ESTRADA.z1 + 60
  const zc = (ESTRADA.z0 + ESTRADA.z1) / 2 - 10

  // o asfalto molhado, com as faixas e os reflexos dos postes
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(80, comp, 1, 1),
    new THREE.ShaderMaterial({
      uniforms: { ...globais, ...uEstrada, uLargura: { value: ESTRADA.largura }, uPasso: { value: ESTRADA.passo } },
      vertexShader: /* glsl */ `
        varying vec3 vMundo;
        varying float vDist;
        void main() {
          vec4 m = modelMatrix * vec4(position, 1.0);
          vMundo = m.xyz;
          vec4 mv = viewMatrix * m;
          vDist = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uLargura;
        uniform float uPasso;
        uniform float uTempo;
        uniform vec3 uLuz;
        varying vec3 vMundo;
        varying float vDist;
        ${GLSL_ACESO}
        ${GLSL_NEVOA}
        float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec2 p = vMundo.xz;
          float meia = uLargura * 0.5;
          float naRua = step(abs(p.x), meia);
          vec3 cor = mix(vec3(0.035, 0.045, 0.07), vec3(0.055, 0.065, 0.095), naRua);
          cor += (h(floor(p * 18.0)) - 0.5) * 0.012;
          float futuro = 1.0 - step(uHojeZ, p.y);
          // faixas: bordas contínuas e o meio tracejado (no futuro, tudo tracejado e apagado)
          float borda = smoothstep(0.06, 0.0, abs(abs(p.x) - meia + 0.3));
          float tracejo = step(0.5, fract(p.y / 3.0));
          float meio = smoothstep(0.07, 0.0, abs(p.x)) * tracejo;
          float bordaF = borda * mix(1.0, step(0.5, fract(p.y / 1.4)), futuro);
          vec3 faixa = mix(vec3(0.85, 0.83, 0.78), vec3(0.3, 0.42, 0.85), futuro);
          cor += faixa * (bordaF + meio) * mix(0.35, 0.18, futuro) * smoothstep(-0.2, 0.2, uEntrada);
          // poças de luz e reflexos dos postes dos dois lados
          for (int lado = 0; lado < 2; lado++) {
            float desl = lado == 0 ? 0.0 : uPasso * 0.5;
            float zl = floor((p.y - desl) / uPasso) * uPasso + desl;
            float aceso = acesoEm(zl);
            float acesoN = acesoEm(zl + uPasso);
            float lx = (lado == 0 ? -1.0 : 1.0) * (meia + 0.8);
            float dx = p.x - lx * 0.82;
            float dz = p.y - zl;
            float poca = exp(-(dx * dx * 0.18 + dz * dz * 0.12)) * aceso;
            float dzN = p.y - (zl + uPasso);
            float pocaN = exp(-(dx * dx * 0.18 + dzN * dzN * 0.12)) * acesoN;
            // reflexo esticado em direção a quem olha
            float refl = exp(-dx * dx * 1.6) * exp(-max(dz, 0.0) * 0.55) * aceso * naRua;
            cor += vec3(1.0, 0.62, 0.2) * (poca + pocaN) * 0.55 + vec3(1.0, 0.7, 0.3) * refl * 0.35;
          }
          // a linha de hoje atravessa a rua
          float hoje = smoothstep(0.25, 0.0, abs(p.y - uHojeZ)) * naRua;
          cor += vec3(1.0, 0.72, 0.3) * hoje * (1.4 + 0.4 * sin(uTempo * 3.0)) * uEntrada;
          // o cursor também acende o chão
          float dl = distance(vMundo, uLuz);
          cor += vec3(1.0, 0.7, 0.3) * exp(-dl * dl * 0.06) * 0.25;
          gl_FragColor = vec4(nevoa(cor, vDist), 1.0);
        }`,
    }),
  )
  chao.rotation.x = -Math.PI / 2
  chao.position.set(0, ESTRADA.y, zc)
  grupo.add(chao)

  // postes: dos dois lados, um a cada passo
  const zs = []
  for (let z = Math.ceil((ESTRADA.z0 + 10) / ESTRADA.passo) * ESTRADA.passo; z > ESTRADA.z1 - 20; z -= ESTRADA.passo) zs.push(z)
  const n = zs.length * 2
  const matPoste = new THREE.ShaderMaterial({
    uniforms: { ...globais, ...uEstrada },
    vertexShader: /* glsl */ `
      varying float vDist;
      varying float vY;
      varying float vZ;
      void main() {
        vec4 m = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vY = position.y;
        vZ = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
        vec4 mv = viewMatrix * m;
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vDist;
      varying float vY;
      varying float vZ;
      ${GLSL_ACESO}
      ${GLSL_NEVOA}
      void main() {
        float a = acesoEm(vZ);
        vec3 cor = vec3(0.06, 0.07, 0.1) + vec3(1.0, 0.65, 0.25) * a * smoothstep(-0.5, 0.5, vY) * 0.12;
        gl_FragColor = vec4(nevoa(cor, vDist), 1.0);
      }`,
  })
  const geoPoste = new THREE.BoxGeometry(0.12, 5.2, 0.12)
  geoPoste.translate(0, 2.6, 0)
  const postes = new THREE.InstancedMesh(geoPoste, matPoste, n)
  const geoBraco = new THREE.BoxGeometry(1.4, 0.08, 0.08)
  geoBraco.translate(0.6, 5.15, 0)
  const bracos = new THREE.InstancedMesh(geoBraco, matPoste, n)

  // a lâmpada e o cone de luz
  const matLampada = new THREE.ShaderMaterial({
    uniforms: { ...globais, ...uEstrada },
    vertexShader: /* glsl */ `
      varying float vDist;
      varying float vZ;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vZ = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
        vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTempo;
      varying float vDist;
      varying float vZ;
      ${GLSL_ACESO}
      ${GLSL_NEVOA}
      void main() {
        float a = acesoEm(vZ);
        // no futuro, a lâmpada ainda não existe: só um fio frio que pisca
        float futuro = 1.0 - step(uHojeZ - 0.01, vZ);
        float pisca = step(0.92, fract(sin(floor(uTempo * 6.0) + vZ) * 43758.5)) * futuro;
        vec3 cor = vec3(1.0, 0.7, 0.28) * (0.08 + a * 3.2) + vec3(0.3, 0.45, 1.0) * futuro * (0.12 + pisca * 0.5);
        gl_FragColor = vec4(nevoa(cor, vDist * 0.6), 1.0);
      }`,
  })
  const geoLampada = new THREE.BoxGeometry(0.55, 0.12, 0.28)
  geoLampada.translate(1.15, 5.06, 0)
  const lampadas = new THREE.InstancedMesh(geoLampada, matLampada, n)

  const matCone = new THREE.ShaderMaterial({
    uniforms: { ...globais, ...uEstrada },
    vertexShader: /* glsl */ `
      varying float vZ;
      varying vec2 vUv;
      varying float vDist;
      void main() {
        vUv = uv;
        vZ = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
        vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vZ;
      varying vec2 vUv;
      varying float vDist;
      ${GLSL_ACESO}
      uniform float uNevoa;
      void main() {
        float a = acesoEm(vZ);
        float alfa = a * pow(vUv.y, 1.6) * 0.11 * exp(-vDist * uNevoa * 0.7);
        gl_FragColor = vec4(vec3(1.0, 0.68, 0.26) * alfa, alfa);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const geoCone = new THREE.ConeGeometry(2.6, 5.0, 24, 1, true)
  geoCone.translate(1.15, 2.55, 0)
  const cones = new THREE.InstancedMesh(geoCone, matCone, n)

  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const um = new THREE.Vector3(1, 1, 1)
  const p = new THREE.Vector3()
  let k = 0
  for (const z of zs)
    for (const lado of [-1, 1]) {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), lado < 0 ? 0 : Math.PI)
      p.set(lado * (ESTRADA.largura / 2 + 1.2), ESTRADA.y, z + (lado > 0 ? ESTRADA.passo / 2 : 0))
      m.compose(p, q, um)
      postes.setMatrixAt(k, m)
      bracos.setMatrixAt(k, m)
      lampadas.setMatrixAt(k, m)
      cones.setMatrixAt(k, m)
      k++
    }
  for (const o of [postes, bracos, lampadas, cones]) {
    o.frustumCulled = false
    grupo.add(o)
  }
  return { grupo, uniformes: uEstrada }
}
