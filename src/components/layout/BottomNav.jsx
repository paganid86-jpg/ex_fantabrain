import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'
import RadialOrbitalTimeline from '../ui/RadialOrbitalTimeline'

const TABS = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/schieramento', icon: 'pitch', label: 'Schiera' },
  { path: '/classifica', icon: 'table', label: 'Classif.' },
  { path: '/news', icon: 'pulse', label: 'News' },
  { path: '/ai-analisi', icon: 'spark', label: 'AI', orbital: true },
]

const AI_ORBITAL_ITEMS = [
  {
    id: 1,
    title: 'Analizza',
    date: 'Giornata',
    content: 'Match migliori e rischi per i titolari prima della deadline.',
    category: 'analizzaGiornata',
    icon: 'calendar',
    relatedIds: [3, 6],
    status: 'ready',
    statusLabel: 'FRONTEND',
    energy: 88,
    path: '/calendario',
  },
  {
    id: 2,
    title: 'Valuta offerta',
    date: 'Mercato',
    content: 'Verdetto ACCETTA, RIFIUTA o CONTROPROPONI sulle offerte ricevute.',
    category: 'valutaOfferta',
    icon: 'market',
    relatedIds: [4, 5],
    status: 'todo',
    statusLabel: 'BACKEND TODO',
    energy: 72,
    path: '/mercato',
  },
  {
    id: 3,
    title: 'Scouting',
    date: 'Report',
    content: 'Report giocatore con forze, debolezze e verdetto SI, NO o FORSE.',
    category: 'reportScouting',
    icon: 'scouting',
    relatedIds: [1, 2],
    status: 'todo',
    statusLabel: 'BACKEND TODO',
    energy: 76,
    path: '/scouting',
  },
  {
    id: 4,
    title: 'War Room',
    date: 'Pre-match',
    content: 'Analisi in 3 step: avversario, vantaggi e piano tattico.',
    category: 'warRoomAnalisi',
    icon: 'war',
    relatedIds: [2, 5, 6],
    status: 'todo',
    statusLabel: 'BACKEND TODO',
    energy: 94,
    path: '/war-room',
  },
  {
    id: 5,
    title: 'Condividi',
    date: 'Share',
    content: "Genera un link condivisibile dell'analisi War Room.",
    category: 'warRoomShare',
    icon: 'share',
    relatedIds: [4],
    status: 'todo',
    statusLabel: 'BACKEND TODO',
    energy: 58,
    path: '/war-room',
  },
  {
    id: 6,
    title: 'AI Coach',
    date: 'Console',
    content: 'Chat privata con lettura contestuale della rosa e prompt rapidi.',
    category: 'aiCoach',
    icon: 'spark',
    relatedIds: [1, 4],
    status: 'ready',
    statusLabel: 'LIVE',
    energy: 100,
    path: '/ai-analisi',
  },
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
        <span className="nav-ai-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )
    default:
      return null
  }
}

export default function BottomNav() {
  const isScrollingDown = useScrollDirection()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOrbitalOpen, setIsOrbitalOpen] = useState(false)

  function handleOrbitalSelect(path) {
    setIsOrbitalOpen(false)
    navigate(path)
  }

  return (
    <>
      {isOrbitalOpen && (
        <RadialOrbitalTimeline
          items={AI_ORBITAL_ITEMS}
          onClose={() => setIsOrbitalOpen(false)}
          onSelect={handleOrbitalSelect}
        />
      )}

      <nav
        className={`bottom-nav${isScrollingDown ? ' hidden' : ''}`}
        aria-label="Navigazione principale"
      >
        {TABS.map(({ path, icon, label, orbital }) => orbital ? (
          <button
            type="button"
            key={path}
            className={`bottom-nav-item${location.pathname === path || isOrbitalOpen ? ' active' : ''}`}
            aria-label="Apri menu AI"
            aria-expanded={isOrbitalOpen}
            onClick={() => setIsOrbitalOpen((current) => !current)}
          >
            <span className="bottom-nav-item-icon-wrap">
              <span className="bottom-nav-item-icon" aria-hidden="true">
                <NavIcon name={icon} />
              </span>
            </span>
            <span className="bottom-nav-item-label">{label}</span>
          </button>
        ) : (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label={label}
            onClick={() => setIsOrbitalOpen(false)}
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
    </>
  )
}
