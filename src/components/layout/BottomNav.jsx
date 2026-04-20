import { NavLink } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'

const TABS = [
  { path: '/',            icon: '⌂', label: 'Home' },
  { path: '/schieramento', icon: '⚽', label: 'Schiera' },
  { path: '/classifica',  icon: '≡', label: 'Classif.' },
  { path: '/news',        icon: '✦', label: 'News' },
  { path: '/ai-analisi',  icon: '◉', label: 'AI' },
]

export default function BottomNav() {
  const isScrollingDown = useScrollDirection()

  return (
    <nav
      className={`bottom-nav${isScrollingDown ? ' hidden' : ''}`}
      aria-label="Navigazione principale"
    >
      {TABS.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          <span className="bottom-nav-item-icon" aria-hidden="true">{icon}</span>
          <span className="bottom-nav-item-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
