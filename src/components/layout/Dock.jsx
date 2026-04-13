import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'

const DOCK_ITEMS = [
  { path: '/', icon: '⊞', label: 'Dashboard' },
  { path: '/la-rosa', icon: '⚽', label: 'Rosa' },
  { path: '/schieramento', icon: '⊟', label: 'Schieramento' },
  { path: '/classifica', icon: '📊', label: 'Classifica' },
  { path: '/calendario', icon: '📅', label: 'Calendario' },
  { path: '/ai-analisi', icon: '🤖', label: 'AI Coach' },
]

const MORE_ITEMS = [
  { path: '/mercato', icon: '💰', label: 'Mercato' },
  { path: '/scouting', icon: '🔍', label: 'Scouting' },
  { path: '/war-room', icon: '⚔️', label: 'War Room' },
  { path: '/statistiche', icon: '📈', label: 'Statistiche' },
  { path: '/crea-lega', icon: '🏆', label: 'Crea Lega' },
  { path: '/impostazioni-lega', icon: '⚙️', label: 'Impostazioni' },
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

  // Close menu on route change
  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  return (
    <nav className={`dock chrome-line${isScrollingDown ? ' hidden' : ''}`}>
      {DOCK_ITEMS.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}
        >
          <span>{icon}</span>
          <span className="dock-tooltip">{label}</span>
        </NavLink>
      ))}
      <div ref={moreRef} style={{ position: 'relative' }}>
        <div
          className={`dock-item${isMoreActive ? ' active' : ''}`}
          onClick={() => setMoreOpen(prev => !prev)}
        >
          <span>•••</span>
          <span className="dock-tooltip">Altro</span>
        </div>
        {moreOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            right: 0,
            background: 'var(--bg-panel)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid var(--border-panel)',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            minWidth: '180px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
            animation: 'slideUp 0.2s var(--ease-out-expo)',
          }}>
            {MORE_ITEMS.map(({ path, icon, label }) => (
              <div
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: location.pathname === path ? 600 : 500,
                  color: location.pathname === path ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: location.pathname === path ? 'rgba(126, 173, 212, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 150ms var(--ease-out-expo)',
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== path) {
                    e.currentTarget.style.background = 'rgba(200, 220, 240, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== path) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
