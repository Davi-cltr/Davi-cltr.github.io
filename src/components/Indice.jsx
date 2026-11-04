import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { rolarPara } from '../core/motion.js'
import { SECOES, useSecaoAtiva } from './Header.jsx'

const CHAVE = { inicio: 'skip', sobre: 'about', habilidades: 'skills', projetos: 'projects', trajetoria: 'journey', contato: 'contact' }

/** índice lateral: os seis capítulos, com o atual aceso */
export default function Indice() {
  const { t } = useLanguage()
  const ativa = useSecaoAtiva()
  const todas = ['inicio', ...SECOES]
  const idx = todas.indexOf(ativa)
  return (
    <nav className={`indice ${idx === 0 ? 'is-inicio' : ''}`} aria-label={t('chapters')}>
      <span className="indice__trilho" aria-hidden="true">
        <span style={{ transform: `scaleY(${idx / (todas.length - 1)})` }} />
      </span>
      <ol>
        {todas.map((id, i) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={i === idx ? 'is-ativo' : i < idx ? 'is-passado' : ''}
              aria-current={i === idx ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                rolarPara(`#${id}`)
              }}
            >
              <span className="indice__num">0{i}</span>
              <span className="indice__nome">{id === 'inicio' ? 'Davi Motta' : t(`nav.${CHAVE[id]}`)}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
