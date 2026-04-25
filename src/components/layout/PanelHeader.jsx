import { useLocation } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

const PAGE_META = {
  '/': { eyebrow: 'FantaBrain', title: 'Home' },
  '/la-rosa': { eyebrow: 'Gestione squadra', title: 'La Rosa' },
  '/schieramento': { eyebrow: 'Match day', title: 'Schieramento' },
  '/classifica': { eyebrow: 'Andamento lega', title: 'Classifica' },
  '/calendario': { eyebrow: 'Serie A', title: 'Calendario' },
  '/mercato': { eyebrow: 'Operazioni', title: 'Mercato' },
  '/scouting': { eyebrow: 'Analisi giocatori', title: 'Scouting' },
  '/war-room': { eyebrow: 'Studio partita', title: 'War Room' },
  '/statistiche': { eyebrow: 'Dati squadra', title: 'Statistiche' },
  '/crea-lega': { eyebrow: 'Setup lega', title: 'Crea Lega' },
  '/impostazioni-lega': { eyebrow: 'Setup lega', title: 'Impostazioni' },
  '/ai-analisi': { eyebrow: 'Coach personale', title: 'AI Coach' },
  '/news': { eyebrow: 'Pulse', title: 'News' },
  '/hub/analisi': { eyebrow: 'Analisi avanzata', title: 'Hub' },
}

export default function PanelHeader() {
  const location = useLocation()
  const user = useAppStore((state) => state.user)
  const aiCrediti = useAppStore((state) => state.aiCrediti)

  const meta = PAGE_META[location.pathname] || { eyebrow: 'FantaBrain', title: 'Dashboard' }
  const initialsSource = user?.name || user?.username || 'FB'
  const initials = initialsSource.slice(0, 2).toUpperCase()

  return (
    <header className="panel-header">
      <div className="panel-brand">
        <div className="panel-brand-mark" aria-hidden="true">
          FB
        </div>
        <div className="panel-title-group">
          <span className="panel-eyebrow">{meta.eyebrow}</span>
          <span className="panel-title">{meta.title}</span>
        </div>
      </div>

      <div className="panel-header-actions">
        <span className="panel-ai-credits">Crediti AI: {aiCrediti ?? 0}</span>
        <span className="panel-status">Live app</span>
        <div className="panel-avatar" aria-label={`Profilo ${initials}`}>
          {initials}
        </div>
      </div>
    </header>
  )
}
