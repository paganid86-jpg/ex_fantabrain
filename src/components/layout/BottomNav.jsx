import { NavLink } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'

const TABS = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/schieramento', icon: 'pitch', label: 'Schiera' },
  { path: '/classifica', icon: 'table', label: 'Classif.' },
  { path: '/news', icon: 'pulse', label: 'News' },
  { path: '/ai-analisi', icon: 'spark', label: 'AI' },
]

function NavIcon({ name }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 10.5 12 4l7.5 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
        </svg>
      )
    case 'pitch':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
          <path d="M12 3.5v17" />
          <path d="M4.5 12h15" />
          <circle cx="12" cy="12" r="2.25" />
        </svg>
      )
    case 'table':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="3" />
          <path d="M4 10h16" />
          <path d="M9 10v9" />
          <path d="M15 10v9" />
        </svg>
      )
    case 'pulse':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12h3l2-4 4 9 2-5h5" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3 1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3Z" />
          <path d="M18.5 15.5 19.4 18l2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9Z" />
        </svg>
      )
    default:
      return null
  }
}

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
          <span className="bottom-nav-item-icon-wrap">
            <span className="bottom-nav-item-icon" aria-hidden="true">
              <NavIcon name={icon} />
            </span>
          </span>
          <span className="bottom-nav-item-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
