import { useEffect, useState } from 'react'

const query = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const prefersReducedMotion = () => query('(prefers-reduced-motion: reduce)')
export const hasFinePointer = () => query('(hover: hover) and (pointer: fine)')

// Acompanha uma media query e re-renderiza quando ela muda.
export function useMediaQuery(q) {
  const [matches, setMatches] = useState(() => query(q))
  useEffect(() => {
    const mql = window.matchMedia(q)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [q])
  return matches
}

// Revela elementos [data-reveal] uma única vez quando entram na tela.
// Usa um atributo (data-revealed) e não uma classe, porque o React reescreve className.
// Sem JavaScript, ou com movimento reduzido, tudo já aparece visível (ver base.css).
export function useRevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
    root.classList.add('can-reveal')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.dataset.revealed = ''
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    )

    const watch = () =>
      document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => observer.observe(el))
    watch()

    // Conteúdo que muda de idioma é re-renderizado; observa novos nós também.
    const mutations = new MutationObserver(watch)
    mutations.observe(document.getElementById('root'), { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [])
}

// Seção visível no momento, para o indicador da navegação.
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const visible = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting)
        const current = ids.find((id) => visible.get(id))
        setActive(current ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])
  return active
}
