import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'
import RadialOrbitalTimeline from '../ui/RadialOrbitalTimeline'

const TABS = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/schieramento', icon: 'pitch', label: 'Schiera' },
  { path: '/classifica', icon: 'table', label: 'Classif.' },
  { path: '/news', icon: 'pulse', label: 'News' },
  { action: 'ai-orbital', icon: 'spark', label: 'AI' },
]

const ORBITAL_ITEMS = [
  {
    id: 'analizza',
    category: 'analizzaGiornata',
    icon: 'calendar',
    title: 'Analizza',
    content: 'Legge giornata, calendario e contesto partita prima delle decisioni.',
    status: 'ready',
    statusLabel: 'Pronto',
    date: 'Matchday',
    energy: 82,
    relatedIds: ['war-room', 'ai-coach'],
    path: '/calendario',
  },
  {
    id: 'valuta-offerta',
    category: 'valutaOfferta',
    icon: 'market',
    title: 'Valuta offerta',
    content: 'Porta uno scambio nel desk mercato e lo fa pesare al coach.',
    status: 'ready',
    statusLabel: 'Pronto',
    date: 'Mercato',
    energy: 68,
    relatedIds: ['scouting', 'ai-coach'],
    path: '/mercato',
  },
  {
    id: 'scouting',
    category: 'reportScouting',
    icon: 'scouting',
    title: 'Scouting',
    content: 'Cerca target Serie A, confronta profili e prepara un report mirato.',
    status: 'ready',
    statusLabel: 'Pronto',
    date: 'Radar',
    energy: 74,
    relatedIds: ['valuta-offerta', 'war-room'],
    path: '/scouting',
  },
  {
    id: 'war-room',
    category: 'warRoomAnalisi',
    icon: 'war',
    title: 'War Room',
    content: 'Costruisce il piano partita contro il prossimo avversario.',
    status: 'ready',
    statusLabel: 'Pronto',
    date: 'Tattica',
    energy: 88,
    relatedIds: ['analizza', 'condividi'],
    path: '/war-room',
  },
  {
    id: 'condividi',
    category: 'warRoomShare',
    icon: 'share',
    title: 'Condividi',
    content: 'Apre la zona War Room per salvare e condividere l’analisi.',
    status: 'todo',
    statusLabel: 'Dopo analisi',
    date: 'Share',
    energy: 56,
    relatedIds: ['war-room', 'ai-coach'],
    path: '/war-room',
  },
  {
    id: 'ai-coach',
    category: 'aiCoach',
    icon: 'spark',
    title: 'AI Coach',
    content: 'Entra nella chat privata con il coach e fai una domanda diretta.',
    status: 'ready',
    statusLabel: 'Pronto',
    date: 'Coach',
    energy: 92,
    relatedIds: ['analizza', 'scouting'],
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
    case 'team':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M4.5 19c.6-3.1 2.2-5 4.5-5s3.9 1.9 4.5 5" />
          <path d="M14.5 10.5a2.6 2.6 0 1 0 0-5" />
          <path d="M15.5 14.5c2 .4 3.3 1.9 4 4.5" />
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
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" />
          <path d="M8 6H5.5v2.5A3.5 3.5 0 0 0 9 12" />
          <path d="M16 6h2.5v2.5A3.5 3.5 0 0 1 15 12" />
          <path d="M12 12.5V17" />
          <path d="M8.5 20h7" />
          <path d="M10 17h4l1 3H9l1-3Z" />
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
  const location = useLocation()
  const navigate = useNavigate()
  const [orbitalOpen, setOrbitalOpen] = useState(false)

  function isTabActive(path) {
    if (path === '/') {
      return location.pathname === '/'
    }

    if (path === '/schieramento') {
      return location.pathname === '/schieramento' || location.pathname === '/la-rosa'
    }

    return location.pathname === path
  }

  return (
    <nav
      className={`bottom-nav${isScrollingDown ? ' hidden' : ''}`}
      aria-label="Navigazione principale"
    >
      {TABS.map(({ path, action, icon, label }) => {
        const active = action === 'ai-orbital'
          ? orbitalOpen || location.pathname === '/ai-analisi'
          : isTabActive(path)

        if (action === 'ai-orbital') {
          return (
            <button
              key={action}
              type="button"
              className={`bottom-nav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
              aria-label="Apri menu AI"
              aria-expanded={orbitalOpen}
              onClick={() => setOrbitalOpen(true)}
            >
              <span className="bottom-nav-item-icon-wrap">
                <span className="bottom-nav-item-icon" aria-hidden="true">
                  <NavIcon name={icon} />
                </span>
              </span>
              <span className="bottom-nav-item-label">{label}</span>
            </button>
          )
        }

        return (
          <Link
            key={path}
            to={path}
            className={`bottom-nav-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            <span className="bottom-nav-item-icon-wrap">
              <span className="bottom-nav-item-icon" aria-hidden="true">
                <NavIcon name={icon} />
              </span>
            </span>
            <span className="bottom-nav-item-label">{label}</span>
          </Link>
        )
      })}
      {orbitalOpen && (
        <RadialOrbitalTimeline
          items={ORBITAL_ITEMS}
          onClose={() => setOrbitalOpen(false)}
          onSelect={(path) => {
            setOrbitalOpen(false)
            navigate(path)
          }}
        />
      )}
    </nav>
  )
}
