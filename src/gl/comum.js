// Peças comuns da cena: cores, uniformes globais e trechos de GLSL.
import * as THREE from 'three'

export const COR = {
  noite: new THREE.Color('#0b1020'),
  sodio: new THREE.Color('#ffb23e'),
  sodioClaro: new THREE.Color('#ffd59a'),
  cobalto: new THREE.Color('#4c7dff'),
  giz: new THREE.Color('#e8ebf2'),
}

/** uniformes que toda a cena compartilha (a luz de sódio, o tempo, a névoa) */
export const globais = {
  uTempo: { value: 0 },
  uLuz: { value: new THREE.Vector3(0, 0, 0) },
  uLuzForca: { value: 1 },
  uFundo: { value: COR.noite.clone() },
  uNevoa: { value: 0.035 },
  uPixel: { value: 1 },
  uAltura: { value: 800 },
}

export const GLSL_NEVOA = /* glsl */ `
uniform vec3 uFundo;
uniform float uNevoa;
vec3 nevoa(vec3 cor, float dist) {
  float f = 1.0 - exp(-dist * uNevoa);
  return mix(cor, uFundo, clamp(f, 0.0, 1.0));
}
`

export const GLSL_RUIDO = /* glsl */ `
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
`

/** gerador com semente: a cena é sempre a mesma */
export function sorteio(semente = 1) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const suave = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}
