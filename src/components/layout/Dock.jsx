import { NavLink, useLocation } from 'react-router-dom'
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
  { path: '/mercato', label: 'Mercato' },
  { path: '/scouting', label: 'Scouting' },
  { path: '/war-room', label: 'War Room' },
  { path: '/statistiche', label: 'Statistiche' },
  { path: '/crea-lega', label: 'Crea Lega' },
  { path: '/impostazioni-lega', label: 'Impostazioni' },
]

export default function Dock() {
  const isScrollingDown = useScrollDirection()
  const location = useLocation()

  const isMoreActive = MORE_ITEMS.some(item => item.path === location.pathname)

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
      <div className={`dock-item${isMoreActive ? ' active' : ''}`} style={{ position: 'relative' }}>
        <span>•••</span>
        <span className="dock-tooltip">Altro</span>
      </div>
    </nav>
  )
}
