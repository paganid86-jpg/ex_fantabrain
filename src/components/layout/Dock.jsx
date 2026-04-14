import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'

const DOCK_ITEMS = [
  { path: '/',              icon: '⊞', label: 'Dashboard' },
  { path: '/la-rosa',       icon: '⚽', label: 'Rosa' },
  { path: '/schieramento',  icon: '⊟', label: 'Schieramento' },
  { path: '/classifica',    icon: '≡',  label: 'Classifica' },
  { path: '/calendario',    icon: '◫',  label: 'Calendario' },
  { path: '/ai-analisi',    icon: '◈',  label: 'AI Coach' },
]

const MORE_ITEMS = [
  { path: '/mercato',           icon: '◎', label: 'Mercato' },
  { path: '/scouting',          icon: '◉', label: 'Scouting' },
  { path: '/war-room',          icon: '⚔', label: 'War Room' },
  { path: '/statistiche',       icon: '▲', label: 'Statistiche' },
  { path: '/crea-lega',         icon: '◆', label: 'Crea Lega' },
  { path: '/impostazioni-lega', icon: '⚙', label: 'Impostazioni' },
]

export default function Dock() {
  const isScrollingDown = useScrollDirection()
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  const isMoreActive = MORE_ITEMS.some(item => item.path === location.pathname)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moreOpen])

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  return (
    <nav className={`dock chrome-line${isScrollingDown ? ' hidden' : ''}`}>
      {/* System status indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 8px 0 4px',
        borderRight: '1px solid var(--y2k-border)',
        marginRight: '4px',
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--y2k-success)', display: 'inline-block', boxShadow: '0 0 4px var(--y2k-success)' }} />
        <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--y2k-chrome-dim)', letterSpacing: '1px' }}>ONLINE</span>
      </div>

      {DOCK_ITEMS.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{icon}</span>
          <span className="dock-tooltip">{label}</span>
        </NavLink>
      ))}

      {/* More overflow */}
      <div ref={moreRef} style={{ position: 'relative' }}>
        <div
          className={`dock-item${isMoreActive ? ' active' : ''}`}
          onClick={() => setMoreOpen(prev => !prev)}
          style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
        >
          <span>•••</span>
          <span className="dock-tooltip">Altro</span>
        </div>

        {moreOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            right: 0,
            background: 'var(--y2k-surface)',
            border: '1px solid var(--y2k-border)',
            borderRadius: 'var(--radius-md)',
            padding: '6px',
            minWidth: '180px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
            animation: 'slideUp 0.2s var(--ease-out-expo)',
          }}>
            {/* Overflow menu header */}
            <div style={{
              fontSize: '8px',
              fontFamily: 'var(--font-mono)',
              color: 'rgba(0,120,255,0.4)',
              letterSpacing: '2px',
              padding: '4px 10px 8px',
              borderBottom: '1px solid var(--y2k-border)',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}>
              // ALTRO
            </div>

            {MORE_ITEMS.map(({ path, icon, label }) => {
              const isActive = location.pathname === path
              return (
                <div
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--y2k-blue-glow)' : 'var(--y2k-chrome-dim)',
                    background: isActive ? 'var(--y2k-blue-deep)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--y2k-blue)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 150ms var(--ease-out-expo)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0,120,255,0.05)'
                      e.currentTarget.style.color = 'var(--y2k-chrome)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--y2k-chrome-dim)'
                    }
                  }}
                >
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>{icon}</span>
                  <span>{label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
