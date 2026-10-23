import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider.jsx'
import { evidenceSources, interests, skillGroups } from '../data/skills.js'

const LEVELS = ['work', 'project', 'learning']

// Lista plana de habilidades com um id estável.
const SKILLS = skillGroups.flatMap((group) =>
  group.items.map((item, i) => ({ ...item, id: `${group.id}-${i}`, group: group.id })),
)

// Calcula as curvas que ligam cada tecnologia às fontes que comprovam o uso.
function useConnectorPaths(mapRef, colRef, skillEls, sourceEls, deps) {
  const [geometry, setGeometry] = useState({ paths: [], width: 0, height: 0 })

  const measure = useCallback(() => {
    const map = mapRef.current
    const col = colRef.current
    if (!map || !col || getComputedStyle(map).getPropertyValue('--map-lines').trim() !== '1') {
      setGeometry({ paths: [], width: 0, height: 0 })
      return
    }
    const m = map.getBoundingClientRect()
    const x1 = col.getBoundingClientRect().right - m.left
    const paths = []
    for (const skill of SKILLS) {
      const row = skillEls.current.get(skill.id)
      if (!row) continue
      const r = row.getBoundingClientRect()
      const y1 = r.top + r.height / 2 - m.top
      if (skill.sources.length === 0) {
        paths.push({ key: `${skill.id}-stub`, skill: skill.id, source: null, level: skill.level, d: `M ${x1} ${y1} h 56` })
        continue
      }
      for (const sourceId of skill.sources) {
        const node = sourceEls.current.get(sourceId)
        if (!node) continue
        const n = node.getBoundingClientRect()
        const x2 = n.left - m.left
        const y2 = n.top + n.height / 2 - m.top
        const bend = (x2 - x1) * 0.55
        paths.push({
          key: `${skill.id}-${sourceId}`,
          skill: skill.id,
          source: sourceId,
          level: skill.level,
          d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
        })
      }
    }
    setGeometry({ paths, width: m.width, height: m.height })
  }, [mapRef, colRef, skillEls, sourceEls])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (mapRef.current) ro.observe(mapRef.current)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps])

  return geometry
}

export default function Skills() {
  const { t, pick, lang } = useLanguage()
  const [hover, setHover] = useState(null) // { type: 'skill' | 'source', id }
  const [pinned, setPinned] = useState(null)
  const focus = hover ?? pinned

  const mapRef = useRef(null)
  const colRef = useRef(null)
  const skillEls = useRef(new Map())
  const sourceEls = useRef(new Map())
  const { paths, width, height } = useConnectorPaths(mapRef, colRef, skillEls, sourceEls, [lang])

  const sourceName = useMemo(() => Object.fromEntries(evidenceSources.map((s) => [s.id, s.name])), [])
  const countBySource = useMemo(() => {
    const counts = {}
    for (const s of SKILLS) for (const id of s.sources) counts[id] = (counts[id] ?? 0) + 1
    return counts
  }, [])

  // O que está aceso no momento.
  const isLitSkill = (skill) =>
    !focus ||
    (focus.type === 'skill' && focus.id === skill.id) ||
    (focus.type === 'source' && skill.sources.includes(focus.id))
  const isLitSource = (id) =>
    !focus ||
    (focus.type === 'source' && focus.id === id) ||
    (focus.type === 'skill' && SKILLS.find((s) => s.id === focus.id)?.sources.includes(id))
  const isLitPath = (p) =>
    focus && ((focus.type === 'skill' && p.skill === focus.id) || (focus.type === 'source' && p.source === focus.id))

  const togglePin = (next) =>
    setPinned((cur) => (cur && cur.type === next.type && cur.id === next.id ? null : next))

  const describe = (skill) =>
    skill.sources.length ? skill.sources.map((id) => sourceName[id]).join(', ') : t('skills.noSource')

  const pinnedSkill = pinned?.type === 'skill' ? SKILLS.find((s) => s.id === pinned.id) : null
  const pinnedSource = pinned?.type === 'source' ? evidenceSources.find((s) => s.id === pinned.id) : null
  const announcement = pinnedSkill
    ? t('skills.announce', { skill: pick(pinnedSkill.name), sources: describe(pinnedSkill) })
    : pinnedSource
      ? t('skills.announce', {
          skill: pinnedSource.name,
          sources: SKILLS.filter((s) => s.sources.includes(pinnedSource.id))
            .map((s) => pick(s.name))
            .join(', '),
        })
      : ''

  return (
    <section className="section skills" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <header className="section__head skills__head">
          <h2 id="skills-title" className="section__title" data-reveal>
            {t('skills.title')}
          </h2>
          <div className="skills__meta" data-reveal style={{ '--d': 1 }}>
            <p className="section__intro">{t('skills.intro')}</p>
            <ul className="legend">
              {LEVELS.map((level) => (
                <li key={level}>
                  <span className={`legend__line legend__line--${level}`} aria-hidden="true" />
                  {t(`skills.levels.${level}`)}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <p className="skills__hint">{t('skills.hint')}</p>

        <div
          className={`evidence ${focus ? 'has-focus' : ''}`}
          ref={mapRef}
          onPointerLeave={() => setHover(null)}
          data-reveal
        >
          <svg className="evidence__wires" width={width} height={height} aria-hidden="true">
            {paths.map((p, i) => (
              <path
                key={p.key}
                d={p.d}
                className={`wire wire--${p.level} ${isLitPath(p) ? 'is-lit' : ''}`}
                pathLength="1"
                style={{ '--w': i }}
              />
            ))}
          </svg>

          <div className="evidence__skills" ref={colRef}>
            {skillGroups.map((group) => (
              <div className="evidence__group" key={group.id}>
                <h3>{pick(group.title)}</h3>
                <ul>
                  {SKILLS.filter((s) => s.group === group.id).map((skill) => {
                    const lit = isLitSkill(skill)
                    const pressed = pinned?.type === 'skill' && pinned.id === skill.id
                    return (
                      <li key={skill.id}>
                        <button
                          type="button"
                          ref={(el) => (el ? skillEls.current.set(skill.id, el) : skillEls.current.delete(skill.id))}
                          className={`skill skill--${skill.level} ${lit ? 'is-lit' : 'is-dim'}`}
                          aria-pressed={pressed}
                          onPointerEnter={() => setHover({ type: 'skill', id: skill.id })}
                          onFocus={() => setHover({ type: 'skill', id: skill.id })}
                          onBlur={() => setHover(null)}
                          onClick={() => togglePin({ type: 'skill', id: skill.id })}
                        >
                          <span className="skill__name">{pick(skill.name)}</span>
                          <span className="skill__level">
                            {t(`skills.levels.${skill.level}`)}
                            {skill.note && <span className="skill__note">, {pick(skill.note)}</span>}
                          </span>
                          <span className="skill__sources">
                            <span className="visually-hidden">{t('skills.usedIn')}: </span>
                            {skill.sources.length ? (
                              skill.sources.map((id) => (
                                <span className="chip" key={id}>
                                  {sourceName[id]}
                                </span>
                              ))
                            ) : (
                              <span className="chip chip--empty">{t('skills.noSource')}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="evidence__sources">
            <h3 className="visually-hidden">{t('skills.sourcesTitle')}</h3>
            {evidenceSources.map((source) => {
              const pressed = pinned?.type === 'source' && pinned.id === source.id
              return (
                <button
                  type="button"
                  key={source.id}
                  ref={(el) => (el ? sourceEls.current.set(source.id, el) : sourceEls.current.delete(source.id))}
                  className={`source source--${source.id} ${isLitSource(source.id) ? 'is-lit' : 'is-dim'}`}
                  aria-pressed={pressed}
                  onPointerEnter={() => setHover({ type: 'source', id: source.id })}
                  onFocus={() => setHover({ type: 'source', id: source.id })}
                  onBlur={() => setHover(null)}
                  onClick={() => togglePin({ type: 'source', id: source.id })}
                >
                  <span className="source__kind">{pick(source.kind)}</span>
                  <span className="source__name">{source.name}</span>
                  <span className="source__count">{t('skills.count', { n: countBySource[source.id] ?? 0 })}</span>
                </button>
              )
            })}
          </div>
        </div>

        <p className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </p>

        <div className="interests" data-reveal>
          <h3>{t('skills.interests')}</h3>
          <ul>
            {pick(interests).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
