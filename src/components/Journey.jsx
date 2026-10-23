import { useMemo, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { certificates, milestones, timelineRange, tracks } from '../data/career.js'
import { ExternalLink } from './ui.jsx'

const toMonths = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + (m - 1)
}

export default function Journey() {
  const { t, pick } = useLanguage()
  const [focus, setFocus] = useState(null)

  const scale = useMemo(() => {
    const now = new Date()
    const start = toMonths(timelineRange.start)
    const end = toMonths(timelineRange.end)
    const today = now.getFullYear() * 12 + now.getMonth() + now.getDate() / 31
    const pct = (months) => ((months - start) / (end - start)) * 100
    const years = []
    for (let y = Number(timelineRange.start.slice(0, 4)); y < Number(timelineRange.end.slice(0, 4)); y++) {
      years.push({ year: y, left: pct(y * 12) })
    }
    return { pct, today, todayPct: pct(today), years }
  }, [])

  const bars = milestones.map((m) => {
    const from = toMonths(m.start)
    const to = m.end ? toMonths(m.end) + 1 : scale.today
    return { ...m, left: scale.pct(from), width: scale.pct(to) - scale.pct(from), ongoing: !m.end }
  })

  const hoverProps = (id) => ({
    onPointerEnter: () => setFocus(id),
    onPointerLeave: () => setFocus(null),
  })

  return (
    <section className="section journey" id="journey" aria-labelledby="journey-title">
      <div className="container">
        <header className="section__head">
          <h2 id="journey-title" className="section__title" data-reveal>
            {t('journey.title')}
          </h2>
          <p className="section__intro" data-reveal style={{ '--d': 1 }}>
            {t('journey.intro')}
          </p>
        </header>

        <div className={`timeline ${focus ? 'has-focus' : ''}`} aria-hidden="true" data-reveal>
          <div className="timeline__plot">
            {scale.years.map((y) => (
              <span className="timeline__year" key={y.year} style={{ left: `${y.left}%` }}>
                {y.year}
              </span>
            ))}
            <div className="timeline__future" style={{ left: `${scale.todayPct}%` }} />
            {tracks.map((track) => (
              <div className="timeline__track" key={track.id}>
                <span className="timeline__track-name">{pick(track.title)}</span>
                {bars
                  .filter((b) => b.track === track.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className={`bar ${b.planned ? 'bar--planned' : ''} ${b.ongoing ? 'bar--ongoing' : ''} ${focus === b.id ? 'is-focus' : ''}`}
                      style={{ left: `${b.left}%`, width: `${b.width}%` }}
                      {...hoverProps(b.id)}
                    >
                      <span className="bar__label">{pick(b.short)}</span>
                    </div>
                  ))}
              </div>
            ))}
            <div className="timeline__today" style={{ left: `${scale.todayPct}%` }}>
              <span>{t('journey.today')}</span>
            </div>
          </div>
        </div>

        <div className="journey__lists">
          {tracks.map((track) => (
            <div key={track.id} className="journey__col" data-reveal>
              <h3>{pick(track.title)}</h3>
              <ol className="milestones">
                {milestones
                  .filter((m) => m.track === track.id)
                  .map((m) => (
                    <li
                      key={m.id}
                      className={`milestone ${m.planned ? 'is-planned' : ''} ${!m.end ? 'is-ongoing' : ''} ${focus === m.id ? 'is-focus' : ''}`}
                      {...hoverProps(m.id)}
                    >
                      <p className="milestone__period">{pick(m.period)}</p>
                      <p className="milestone__org">{pick(m.org)}</p>
                      <p className="milestone__title">{pick(m.title)}</p>
                      <p className="milestone__detail">{pick(m.detail)}</p>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>

        {certificates.length > 0 && (
          <div className="certificates" data-reveal>
            <h3>{t('journey.certificates')}</h3>
            <ul className="plainlist">
              {certificates.map((cert) => (
                <li key={cert.name}>
                  {cert.url ? <ExternalLink href={cert.url}>{cert.name}</ExternalLink> : cert.name}, {cert.issuer}
                  {cert.year && ` (${cert.year})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
