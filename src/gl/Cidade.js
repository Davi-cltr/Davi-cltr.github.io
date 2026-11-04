// A cidade: prédios com janelas acesas (geradas no shader), o horizonte de sódio,
// a poeira que flutua na luz e os rastros que aparecem quando a câmera viaja.
import * as THREE from 'three'
import { GLSL_NEVOA, GLSL_RUIDO, globais, sorteio } from './comum.js'

/** prédios instanciados; as janelas são desenhadas no fragment shader */
export function criarPredios({ quantidade, area, semente = 5, alturaMin = 6, alturaMax = 40, foraDe = null }) {
  const r = sorteio(semente)
  const geo = new THREE.BoxGeometry(1, 1, 1)
  geo.translate(0, 0.5, 0)
  const malha = new THREE.InstancedMesh(geo, null, quantidade)
  const aSemente = new Float32Array(quantidade)
  const aTam = new Float32Array(quantidade * 3)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const p = new THREE.Vector3()
  for (let i = 0; i < quantidade; i++) {
    let x = 0
    let z = 0
    for (let t = 0; t < 20; t++) {
      x = area.x0 + r() * (area.x1 - area.x0)
      z = area.z0 + r() * (area.z1 - area.z0)
      if (!foraDe || Math.abs(x) > foraDe) break
    }
    const h = alturaMin + Math.pow(r(), 2.2) * (alturaMax - alturaMin)
    const w = 3 + r() * 7
    const d = 3 + r() * 7
    s.set(w, h, d)
    p.set(x, area.y, z)
    m.compose(p, q, s)
    malha.setMatrixAt(i, m)
    aSemente[i] = r()
    aTam.set([w, h, d], i * 3)
  }
  geo.setAttribute('aSemente', new THREE.InstancedBufferAttribute(aSemente, 1))
  geo.setAttribute('aTam', new THREE.InstancedBufferAttribute(aTam, 3))
  malha.material = new THREE.ShaderMaterial({
    uniforms: { ...globais, uAcende: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSemente;
      attribute vec3 aTam;
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying float vSemente;
      varying vec3 vTam;
      varying float vDist;
      varying vec3 vMundo;
      void main() {
        vLocal = position;
        vNormal = normal;
        vSemente = aSemente;
        vTam = aTam;
        vec4 m = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vMundo = m.xyz;
        vec4 mv = viewMatrix * m;
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTempo;
      uniform float uAcende;
      uniform vec3 uLuz;
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying float vSemente;
      varying vec3 vTam;
      varying float vDist;
      varying vec3 vMundo;
      ${GLSL_RUIDO}
      ${GLSL_NEVOA}
      void main() {
        // coordenadas da fachada em metros
        vec2 f = abs(vNormal.x) > 0.5 ? vec2(vLocal.z * vTam.z, vLocal.y * vTam.y) : vec2(vLocal.x * vTam.x, vLocal.y * vTam.y);
        vec3 cor = vec3(0.03, 0.04, 0.065) + vec3(0.02, 0.03, 0.06) * vLocal.y;
        if (abs(vNormal.y) < 0.5) {
          vec2 cel = floor(f / vec2(1.6, 2.2));
          vec2 dentro = fract(f / vec2(1.6, 2.2));
          float janela = step(0.22, dentro.x) * step(dentro.x, 0.78) * step(0.3, dentro.y) * step(dentro.y, 0.78);
          float sorte = h21(cel + vSemente * 91.0);
          float acesa = step(0.7 - uAcende * 0.08, sorte);
          // algumas janelas mudam com o tempo
          acesa *= step(0.08, h21(cel + floor(uTempo * 0.15 + sorte * 7.0)));
          vec3 quente = mix(vec3(1.0, 0.66, 0.26), vec3(1.0, 0.85, 0.6), h21(cel * 1.7));
          vec3 fria = vec3(0.55, 0.65, 1.0);
          vec3 luzJanela = mix(quente, fria, step(0.86, h21(cel * 3.1)));
          cor += luzJanela * janela * acesa * (0.35 + 0.35 * sorte) * uAcende;
        }
        // o topo pisca de vermelho em alguns prédios altos
        float topo = step(0.985, vLocal.y) * step(0.8, vSemente) * step(0.5, sin(uTempo * 2.0 + vSemente * 20.0));
        cor += vec3(1.0, 0.15, 0.1) * topo * 2.0;
        float dl = distance(vMundo, uLuz);
        cor += vec3(1.0, 0.7, 0.3) * exp(-dl * 0.08) * 0.08;
        gl_FragColor = vec4(nevoa(cor, vDist), 1.0);
      }`,
  })
  malha.frustumCulled = false
  return malha
}

/** o céu do contato: uma faixa de sódio no horizonte que segue o cursor */
export function criarHorizonte() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...globais, uCentro: { value: 0 }, uForca: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uCentro;
      uniform float uForca;
      uniform float uTempo;
      varying vec2 vUv;
      ${GLSL_RUIDO}
      void main() {
        float y = vUv.y;
        float x = vUv.x - 0.5;
        vec3 ceu = mix(vec3(0.045, 0.06, 0.11), vec3(0.02, 0.025, 0.05), smoothstep(0.3, 1.0, y));
        float faixa = exp(-pow((y - 0.32) * 9.0, 2.0));
        float foco = exp(-pow((x - uCentro * 0.35) * 2.2, 2.0));
        vec3 sodio = vec3(1.0, 0.62, 0.22);
        ceu += sodio * faixa * (0.35 + foco * 0.9) * uForca;
        ceu += vec3(0.25, 0.35, 0.8) * exp(-pow((y - 0.55) * 4.0, 2.0)) * 0.08;
        // nuvens baixas iluminadas por baixo
        float n = ruido(vec2(vUv.x * 6.0 + uTempo * 0.01, y * 14.0));
        ceu += sodio * n * faixa * 0.15 * uForca;
        gl_FragColor = vec4(ceu, 1.0);
      }`,
    depthWrite: false,
  })
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(1400, 360), mat)
  return malha
}

/** poeira em suspensão em volta da câmera (dá volume à luz) */
export function criarPoeira(n = 1400) {
  const r = sorteio(11)
  const pos = new Float32Array(n * 3)
  const sem = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    pos.set([(r() - 0.5) * 30, (r() - 0.5) * 18, -r() * 30], i * 3)
    sem[i] = r()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSemente', new THREE.BufferAttribute(sem, 1))
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...globais, uDeslocamento: { value: new THREE.Vector3() } },
    vertexShader: /* glsl */ `
      attribute float aSemente;
      uniform float uTempo;
      uniform vec3 uDeslocamento;
      uniform vec3 uLuz;
      uniform float uPixel;
      varying float vBrilho;
      varying float vSemente;
      void main() {
        vec3 p = position;
        p.y += uTempo * (0.05 + aSemente * 0.1);
        p.x += sin(uTempo * 0.2 + aSemente * 40.0) * 0.5;
        // a caixa acompanha a câmera (repete ao sair)
        p = mod(p - uDeslocamento + vec3(15.0, 9.0, 30.0), vec3(30.0, 18.0, 30.0)) - vec3(15.0, 9.0, 30.0) + uDeslocamento;
        vec4 mundo = modelMatrix * vec4(p, 1.0);
        float d = distance(mundo.xyz, uLuz);
        vBrilho = exp(-d * d * 0.05);
        vSemente = aSemente;
        vec4 mv = viewMatrix * mundo;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min((1.0 + aSemente * 1.6) * uPixel * (7.0 / max(1.0, -mv.z)) * (1.0 + vBrilho * 1.2), 4.0 * uPixel);
      }`,
    fragmentShader: /* glsl */ `
      varying float vBrilho;
      varying float vSemente;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * (0.05 + vBrilho * 0.3);
        gl_FragColor = vec4(vec3(1.0, 0.75, 0.4) * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  return pts
}

/** rastros de luz que só aparecem quando a câmera viaja rápido */
export function criarRastros(n = 260) {
  const r = sorteio(17)
  const geo = new THREE.PlaneGeometry(1, 1)
  const malha = new THREE.InstancedMesh(geo, null, n)
  const aSemente = new Float32Array(n)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  const s = new THREE.Vector3()
  const p = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2
    const raio = 2.5 + r() * 9
    p.set(Math.cos(a) * raio, Math.sin(a) * raio * 0.6, -r() * 40)
    s.set(0.02 + r() * 0.03, 1, 1)
    m.compose(p, q, s)
    malha.setMatrixAt(i, m)
    aSemente[i] = r()
  }
  geo.setAttribute('aSemente', new THREE.InstancedBufferAttribute(aSemente, 1))
  malha.material = new THREE.ShaderMaterial({
    uniforms: { ...globais, uVel: { value: 0 }, uAvanco: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aSemente;
      uniform float uVel;
      uniform float uAvanco;
      varying vec2 vUv;
      varying float vSemente;
      void main() {
        vUv = uv;
        vSemente = aSemente;
        vec3 p = position;
        p.y *= 1.0 + abs(uVel) * (4.0 + aSemente * 10.0);
        vec4 m = instanceMatrix * vec4(p, 1.0);
        m.z = mod(m.z + uAvanco * (0.6 + aSemente), 40.0) - 40.0;
        gl_Position = projectionMatrix * modelViewMatrix * m;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uVel;
      varying vec2 vUv;
      varying float vSemente;
      void main() {
        float a = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y) * clamp(abs(uVel) * 1.4, 0.0, 1.0) * 0.6;
        vec3 cor = mix(vec3(1.0, 0.7, 0.3), vec3(0.45, 0.6, 1.0), step(0.7, vSemente));
        gl_FragColor = vec4(cor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  malha.frustumCulled = false
  return malha
}
