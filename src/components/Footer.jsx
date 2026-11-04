import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { profile } from '../data/profile.js'
import { useEstado } from '../core/useEstado.js'
import { salvarMovimento, salvarQualidade } from '../core/store.js'
import { rolarPara } from '../core/motion.js'
import { useMagnetico } from './efeitos.jsx'

export default function Footer() {
  const { t } = useLanguage()
  const reduzido = useEstado((s) => s.reduzido)
  const qualidade = useEstado((s) => s.qualidade)
  const topo = useMagnetico(0.4)
  return (
    <footer className="rodape">
      <div className="rodape__linha">
        <p>
          <strong>{profile.name}</strong> · {t('footer.role')} · © {new Date().getFullYear()}
        </p>
        <div className="ajustes">
          <label className="chave">
            <input type="checkbox" checked={reduzido} onChange={(e) => salvarMovimento(e.target.checked)} />
            <span className="chave__trilho" aria-hidden="true" />
            {t('settings.motion')}
          </label>
          <div className="segmento" role="group" aria-label={t('settings.quality')}>
            <span>{t('settings.quality')}</span>
            {['alta', 'baixa'].map((q) => (
              <button key={q} type="button" aria-pressed={qualidade === q} onClick={() => qualidade !== q && salvarQualidade(q)}>
                {t(`settings.${q === 'alta' ? 'high' : 'low'}`)}
              </button>
            ))}
          </div>
        </div>
        <a
          ref={topo}
          className="rodape__topo"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            rolarPara(0)
          }}
        >
          {t('footer.top')} ↑
        </a>
      </div>
    </footer>
  )
}
