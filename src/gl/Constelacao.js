// Mapa de evidências em 3D: cada tecnologia é um ponto ligado por fios de luz
// aos lugares onde foi usada (trabalho e projetos). Escolher uma acende os fios dela.
import * as THREE from 'three'
import { evidenceSources, skillGroups } from '../data/skills.js'
import { globais, sorteio } from './comum.js'

export const habilidades = skillGroups.flatMap((g, gi) => g.items.map((item) => ({ ...item, grupo: g.id, gi })))

export function criarConstelacao() {
  const r = sorteio(3)
  const grupo = new THREE.Group()

  // fontes no centro, num triângulo inclinado
  const fontes = evidenceSources.map((s, i) => {
    const a = (i / evidenceSources.length) * Math.PI * 2 + 0.4
    return { id: s.id, pos: new THREE.Vector3(Math.cos(a) * 0.2, Math.sin(a) * 0.17, (r() - 0.5) * 0.2) }
  })
  // tecnologias em volta, agrupadas por área (um arco para cada grupo)
  const nos = habilidades.map((h, i) => {
    const grupoItens = habilidades.filter((x) => x.gi === h.gi)
    const k = grupoItens.indexOf(h)
    const base = (h.gi / skillGroups.length) * Math.PI * 2 + 0.2
    const a = base + (k - (grupoItens.length - 1) / 2) * 0.32
    const raio = 0.5 + (r() - 0.5) * 0.06
    return { i, pos: new THREE.Vector3(Math.cos(a) * raio, Math.sin(a) * raio * 0.82, (r() - 0.5) * 0.45), h }
  })

  // fios: curvas de cada tecnologia até cada lugar onde foi usada
  const pos = []
  const aT = []
  const aDono = []
  const aFio = []
  let fio = 0
  const SEG = 40
  const curva = new THREE.QuadraticBezierCurve3()
  nos.forEach((n) => {
    for (const fid of n.h.sources) {
      const f = fontes.find((x) => x.id === fid)
      if (!f) continue
      const meio = n.pos.clone().lerp(f.pos, 0.5)
      meio.z += 0.18 + r() * 0.12
      meio.multiplyScalar(1.12)
      curva.v0.copy(n.pos)
      curva.v1.copy(meio)
      curva.v2.copy(f.pos)
      const pts = curva.getPoints(SEG)
      for (let s = 0; s < SEG; s++) {
        pos.push(pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z)
        aT.push(s / SEG, (s + 1) / SEG)
        aDono.push(n.i, n.i)
        aFio.push(fio, fio)
      }
      fio++
    }
  })
  const geoFios = new THREE.BufferGeometry()
  geoFios.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geoFios.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1))
  geoFios.setAttribute('aDono', new THREE.Float32BufferAttribute(aDono, 1))
  geoFios.setAttribute('aFio', new THREE.Float32BufferAttribute(aFio, 1))
  const matFios = new THREE.ShaderMaterial({
    uniforms: { ...globais, uAtivo: { value: -1 }, uEntrada: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aDono;
      attribute float aFio;
      varying float vT;
      varying float vAtivo;
      varying float vFio;
      uniform float uAtivo;
      void main() {
        vT = aT;
        vFio = aFio;
        vAtivo = abs(aDono - uAtivo) < 0.5 ? 1.0 : 0.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTempo;
      uniform float uAtivo;
      uniform float uEntrada;
      varying float vT;
      varying float vAtivo;
      varying float vFio;
      void main() {
        // o fio se desenha da tecnologia até a fonte quando a seção entra
        if (vT > uEntrada * 1.4 - fract(vFio * 0.37) * 0.4) discard;
        float algumAtivo = step(-0.5, uAtivo);
        // pulsos de luz viajando da tecnologia até onde ela foi usada
        float pulso = smoothstep(0.92, 1.0, fract(vT * 2.0 - uTempo * (0.35 + vAtivo * 0.6) + vFio * 0.13));
        vec3 frio = vec3(0.30, 0.45, 1.0);
        vec3 sodio = vec3(1.0, 0.70, 0.24);
        vec3 cor = mix(frio * 0.55, sodio, vAtivo);
        float forca = mix(mix(0.6, 0.18, algumAtivo), 1.2, vAtivo);
        cor = cor * forca + mix(frio, sodio, vAtivo) * pulso * (0.4 + vAtivo * 1.4);
        gl_FragColor = vec4(cor, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const fios = new THREE.LineSegments(geoFios, matFios)
  grupo.add(fios)

  // pontos: tecnologias e fontes
  const pp = []
  const aTipo = []
  const aIdx = []
  const aNivel = []
  nos.forEach((n) => {
    pp.push(n.pos.x, n.pos.y, n.pos.z)
    aTipo.push(0)
    aIdx.push(n.i)
    aNivel.push(n.h.level === 'work' ? 2 : n.h.level === 'project' ? 1 : 0)
  })
  fontes.forEach((f, i) => {
    pp.push(f.pos.x, f.pos.y, f.pos.z)
    aTipo.push(1)
    aIdx.push(100 + i)
    aNivel.push(2)
  })
  const geoNos = new THREE.BufferGeometry()
  geoNos.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3))
  geoNos.setAttribute('aTipo', new THREE.Float32BufferAttribute(aTipo, 1))
  geoNos.setAttribute('aIdx', new THREE.Float32BufferAttribute(aIdx, 1))
  geoNos.setAttribute('aNivel', new THREE.Float32BufferAttribute(aNivel, 1))
  const matNos = new THREE.ShaderMaterial({
    uniforms: { ...globais, uAtivo: { value: -1 }, uFontesAtivas: { value: new THREE.Vector3() }, uEntrada: { value: 0 }, uEscala: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aTipo;
      attribute float aIdx;
      attribute float aNivel;
      uniform float uAtivo;
      uniform vec3 uFontesAtivas;
      uniform float uTempo;
      uniform float uPixel;
      uniform float uEntrada;
      uniform float uEscala;
      varying float vTipo;
      varying float vAceso;
      varying float vNivel;
      void main() {
        vTipo = aTipo;
        vNivel = aNivel;
        float ativo = abs(aIdx - uAtivo) < 0.5 ? 1.0 : 0.0;
        float fonte = aTipo > 0.5 ? (aIdx < 100.5 ? uFontesAtivas.x : aIdx < 101.5 ? uFontesAtivas.y : uFontesAtivas.z) : 0.0;
        vAceso = max(ativo, fonte);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float base = aTipo > 0.5 ? 46.0 : 20.0;
        float pulsa = 1.0 + sin(uTempo * 2.0 + aIdx) * 0.08;
        gl_PointSize = base * uPixel * uEscala * pulsa * (1.0 + vAceso * 0.6) * smoothstep(0.0, 0.6, uEntrada) * (8.0 / -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vTipo;
      varying float vAceso;
      varying float vNivel;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        vec3 sodio = vec3(1.0, 0.72, 0.28);
        vec3 frio = vec3(0.45, 0.6, 1.0);
        float nucleo = smoothstep(0.22, 0.0, d);
        float halo = smoothstep(0.5, 0.1, d) * 0.5;
        // "estudando" fica como um anel vazio
        float anel = smoothstep(0.06, 0.0, abs(d - 0.32));
        float forma = vNivel < 0.5 && vTipo < 0.5 ? anel + halo * 0.3 : nucleo + halo;
        vec3 cor = mix(mix(frio, sodio, vTipo * 0.6), sodio * 1.4, vAceso);
        gl_FragColor = vec4(cor * forma * (0.7 + vAceso * 0.8), forma);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const pontos = new THREE.Points(geoNos, matNos)
  pontos.frustumCulled = false
  grupo.add(pontos)

  return { grupo, nos, fontes, matFios, matNos }
}
