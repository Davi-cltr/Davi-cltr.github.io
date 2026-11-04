// As capturas de tela dos projetos em WebGL, sobre a moldura de navegador do DOM:
// a troca de aba vira uma dissolução de luz e o cursor ondula a imagem.
import * as THREE from 'three'
import { GLSL_RUIDO, globais } from './comum.js'

export function criarCaptura() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      ...globais,
      tA: { value: null },
      tB: { value: null },
      uAspA: { value: 1.6 },
      uAspB: { value: 1.6 },
      uAspPlano: { value: 1.6 },
      uMistura: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSobre: { value: 0 },
      uVel: { value: 0 },
      uEntrada: { value: 0 },
      uFundo2: { value: new THREE.Color('#0a0f1c') },
    },
    vertexShader: /* glsl */ `
      uniform float uVel;
      uniform float uSobre;
      uniform vec2 uMouse;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        // a rolagem rápida curva o plano; o cursor afunda um pouco a superfície
        p.z += sin(uv.y * 3.14159) * clamp(uVel, -1.0, 1.0) * 0.18;
        float d = distance(uv, uMouse);
        p.z -= exp(-d * d * 30.0) * uSobre * 0.06;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tA;
      uniform sampler2D tB;
      uniform float uAspA;
      uniform float uAspB;
      uniform float uAspPlano;
      uniform float uMistura;
      uniform vec2 uMouse;
      uniform float uSobre;
      uniform float uTempo;
      uniform float uEntrada;
      uniform vec3 uFundo2;
      varying vec2 vUv;
      ${GLSL_RUIDO}
      // encaixe "contain": a imagem inteira cabe no quadro
      vec2 encaixe(vec2 uv, float aspImg, out float dentro) {
        vec2 s = aspImg > uAspPlano ? vec2(1.0, uAspPlano / aspImg) : vec2(aspImg / uAspPlano, 1.0);
        vec2 r = (uv - 0.5) / s + 0.5;
        dentro = step(0.0, r.x) * step(r.x, 1.0) * step(0.0, r.y) * step(r.y, 1.0);
        return r;
      }
      vec3 amostra(sampler2D t, vec2 uv, float asp) {
        float dentro;
        vec2 r = encaixe(uv, asp, dentro);
        return mix(uFundo2, texture2D(t, r).rgb, dentro);
      }
      void main() {
        vec2 uv = vUv;
        // ondulação em volta do cursor
        float d = distance(uv, uMouse);
        uv += normalize(uv - uMouse + 1e-4) * sin(d * 40.0 - uTempo * 6.0) * exp(-d * 9.0) * 0.004 * uSobre;
        float n = ruido(uv * vec2(8.0, 5.0) + 3.0) * 0.7 + ruido(uv * 30.0) * 0.3;
        float corte = uMistura * 1.25 - 0.12;
        float m = smoothstep(corte - 0.08, corte, n);
        vec3 a = amostra(tA, uv + vec2(0.0, (1.0 - m) * 0.01), uAspA);
        vec3 b = amostra(tB, uv, uAspB);
        vec3 cor = mix(b, a, m);
        // a borda da dissolução queima em sódio
        float borda = smoothstep(0.08, 0.0, abs(n - corte)) * step(0.001, uMistura) * step(uMistura, 0.999);
        cor += vec3(1.0, 0.62, 0.2) * borda * 1.6;
        // reflexo de luz do cursor sobre o vidro
        cor += vec3(1.0, 0.78, 0.5) * exp(-d * d * 14.0) * 0.08 * uSobre;
        // entrada: a imagem se revela de cima para baixo
        float e = smoothstep(uEntrada * 1.2 - 0.2, uEntrada * 1.2, 1.0 - vUv.y);
        cor = mix(cor, uFundo2, e);
        cor += vec3(1.0, 0.65, 0.25) * smoothstep(0.03, 0.0, abs((1.0 - vUv.y) - (uEntrada * 1.2 - 0.1))) * step(uEntrada, 0.99) * 0.8;
        gl_FragColor = vec4(cor, 1.0);
      }`,
  })
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 24, 24), mat)
  malha.renderOrder = 6
  return malha
}
