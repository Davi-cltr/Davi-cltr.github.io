import { useLanguage } from '../i18n/LanguageProvider.jsx'

// Link para fora do site: abre em nova aba e avisa leitores de tela.
export function ExternalLink({ href, children, className, ...rest }) {
  const { t } = useLanguage()
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <span className="visually-hidden"> {t('external')}</span>
    </a>
  )
}

export function StatusBadge({ status }) {
  const { t } = useLanguage()
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" aria-hidden="true" />
      {t(`projects.status.${status}`)}
    </span>
  )
}

const ICONS = {
  github:
    'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
  linkedin:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
}

export function BrandIcon({ name, size = 18 }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d={ICONS[name]} fill="currentColor" />
    </svg>
  )
}

export function ArrowIcon({ size = 16 }) {
  return (
    <svg className="icon icon--arrow" viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Realce de sintaxe mínimo para Ruby, Python, YAML e JSON.
const TOKEN =
  /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b(?:def|end|class|return|if|unless|else|do|try|except|for|in|raise|await|async|import|from|True|False|None|nil|self|null)\b)|(:\w+|\b[\w-]+(?=:\s|:$)|\b\w+(?==))|(\b\d[\d_.]*\b)/g

export function highlight(source) {
  const parts = []
  let last = 0
  for (const match of source.matchAll(TOKEN)) {
    if (match.index > last) parts.push(source.slice(last, match.index))
    const kind = match[1] ? 'comment' : match[2] ? 'string' : match[3] ? 'keyword' : match[4] ? 'name' : 'number'
    parts.push(
      <span key={match.index} className={`tok-${kind}`}>
        {match[0]}
      </span>,
    )
    last = match.index + match[0].length
  }
  parts.push(source.slice(last))
  return parts
}

// Rastreia a posição do ponteiro dentro de um elemento em --mx / --my,
// para o reflexo de luz das superfícies. Só em mouse; toque fica estático.
export function trackPointerLight(e) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

// Navegação por setas em um grupo de abas (padrão WAI-ARIA).
export function onTabsKeyDown(e, count, index, select, orientation = 'horizontal') {
  const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  let to = null
  if (e.key === prev) to = (index - 1 + count) % count
  else if (e.key === next) to = (index + 1) % count
  else if (e.key === 'Home') to = 0
  else if (e.key === 'End') to = count - 1
  if (to === null) return
  e.preventDefault()
  select(to)
  const tabs = e.currentTarget.parentElement.querySelectorAll('[role="tab"]')
  tabs[to]?.focus()
}
