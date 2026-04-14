import { useLocation } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/la-rosa': 'La Rosa',
  '/schieramento': 'Schieramento',
  '/classifica': 'Classifica',
  '/calendario': 'Calendario',
  '/mercato': 'Mercato',
  '/scouting': 'Scouting',
  '/war-room': 'War Room',
  '/statistiche': 'Statistiche',
  '/crea-lega': 'Crea Lega',
  '/impostazioni-lega': 'Impostazioni Lega',
  '/ai-analisi': 'AI Coach',
}

export default function PanelHeader() {
  const location = useLocation()
  const user = useAppStore(state => state.user)

  const title = PAGE_TITLES[location.pathname] || 'FantaBrain'
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'FB'

  return (
    <header className="panel-header chrome-line">
      <span className="panel-logo y2k-glitch-hover">FANTABRAIN</span>
      <span className="panel-title">{title}</span>
      <div className="panel-avatar">{initials}</div>
    </header>
  )
}
