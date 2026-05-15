import { useEffect, useRef, useState } from 'react'

function OrbitalIcon({ name }) {
  switch (name) {
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      )
    case 'market':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 18V8l7-4 7 4v10l-7 4-7-4Z" />
          <path d="M8.5 12h7M12 8.5v7" />
        </svg>
      )
    case 'scouting':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4M11 8v6M8 11h6" />
        </svg>
      )
    case 'war':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19V5l7 3 7-3v14l-7-3-7 3Z" />
          <path d="M11 8v8M18 5v14" />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="7" cy="12" r="3" />
          <circle cx="17" cy="6" r="3" />
          <circle cx="17" cy="18" r="3" />
          <path d="m9.7 10.6 4.6-3.2M9.7 13.4l4.6 3.2" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3 1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3Z" />
          <path d="M18.5 15.5 19.4 18l2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9Z" />
        </svg>
      )
  }
}

export default function RadialOrbitalTimeline({ items, onClose, onSelect }) {
  const [activeId, setActiveId] = useState(null)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [orbitRadius, setOrbitRadius] = useState(224)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    function updateOrbitRadius() {
      const shortestSide = Math.min(window.innerWidth, window.innerHeight)
      setOrbitRadius(shortestSide < 680 ? 118 : 224)
    }

    updateOrbitRadius()
    window.addEventListener('resize', updateOrbitRadius)
    return () => window.removeEventListener('resize', updateOrbitRadius)
  }, [])

  useEffect(() => {
    if (!autoRotate) return undefined

    const timer = window.setInterval(() => {
      setRotationAngle((current) => (current + 0.25) % 360)
    }, 40)

    return () => window.clearInterval(timer)
  }, [autoRotate])

  const activeItem = items.find((item) => item.id === activeId) || null

  function handleNodeClick(item, index) {
    setActiveId(item.id)
    setAutoRotate(false)
    setRotationAngle(270 - (index / items.length) * 360)
  }

  function calculateNodePosition(index) {
    const angle = ((index / items.length) * 360 + rotationAngle) % 360
    const radian = (angle * Math.PI) / 180

    return {
      x: orbitRadius * Math.cos(radian),
      y: orbitRadius * Math.sin(radian),
      opacity: Math.max(0.48, Math.min(1, 0.55 + 0.45 * ((1 + Math.sin(radian)) / 2))),
      zIndex: Math.round(70 + 30 * Math.cos(radian)),
    }
  }

  return (
    <div
      className="ai-orbital-backdrop"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu AI orbitale"
      onClick={(event) => {
        if (event.target === containerRef.current) onClose()
      }}
    >
      <section className="ai-orbital-shell">
        <div className="ai-orbital-stage" aria-label="Timeline orbitale AI">
          <div className="ai-orbital-ring ai-orbital-ring--outer" aria-hidden="true" />
          <div className="ai-orbital-ring ai-orbital-ring--inner" aria-hidden="true" />

          <button
            type="button"
            className="ai-orbital-core"
            onClick={() => onSelect('/')}
            aria-label="Chiudi menu AI e torna alla Home"
          >
            <span className="ai-orbital-core__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          {items.map((item, index) => {
            const position = calculateNodePosition(index)
            const isActive = item.id === activeItem?.id
            const isRelated = activeItem?.relatedIds.includes(item.id)

            return (
              <button
                type="button"
                key={item.id}
                className={`ai-orbital-node ai-orbital-node--${item.category}${isActive ? ' is-active' : ''}${isRelated ? ' is-related' : ''}`}
                style={{
                  '--node-x': `${position.x}px`,
                  '--node-y': `${position.y}px`,
                  '--node-glow': `${42 + item.energy * 0.28}px`,
                  opacity: isActive ? 1 : position.opacity,
                  zIndex: isActive ? 120 : position.zIndex,
                }}
                onClick={() => handleNodeClick(item, index)}
              >
                <span className="ai-orbital-node__halo" aria-hidden="true" />
                <span className="ai-orbital-node__icon">
                  <OrbitalIcon name={item.icon} />
                </span>
                <span className="ai-orbital-node__label">{item.title}</span>
              </button>
            )
          })}

          {activeItem && (
            <article className="ai-orbital-card">
              <button
                type="button"
                className="ai-orbital-card__close"
                onClick={() => {
                  setActiveId(null)
                  setAutoRotate(true)
                }}
                aria-label="Chiudi pannello azione"
              >
                ×
              </button>
              <span className={`ai-orbital-status ai-orbital-status--${activeItem.status}`}>
                {activeItem.statusLabel}
              </span>
              <span className="ai-orbital-card__date">{activeItem.date}</span>
              <h2>{activeItem.title}</h2>
              <p>{activeItem.content}</p>

              <div className="ai-orbital-energy" aria-label={`Priorità ${activeItem.energy}%`}>
                <div>
                  <span>Priorità</span>
                  <strong>{activeItem.energy}%</strong>
                </div>
                <span className="ai-orbital-energy__track">
                  <span style={{ width: `${activeItem.energy}%` }} />
                </span>
              </div>

              <div className="ai-orbital-links">
                <span>Connessioni</span>
                <div>
                  {activeItem.relatedIds.map((relatedId) => {
                    const relatedItem = items.find((item) => item.id === relatedId)
                    if (!relatedItem) return null

                    return (
                      <button
                        type="button"
                        key={relatedId}
                        onClick={() => {
                          const relatedIndex = items.findIndex((item) => item.id === relatedId)
                          handleNodeClick(relatedItem, relatedIndex)
                        }}
                      >
                        {relatedItem.title}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="button"
                className="ai-orbital-open"
                onClick={() => onSelect(activeItem.path)}
              >
                Apri modulo
              </button>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
