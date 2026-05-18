import { useLocation } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

const PAGE_META = {
  '/': { kicker: 'FANTABRAIN', title: 'Home' },
  '/la-rosa': { kicker: 'GESTIONE SQUADRA', title: 'La Rosa' },
  '/schieramento': { kicker: 'MATCH DAY', title: 'Schieramento' },
  '/classifica': { kicker: 'ANDAMENTO LEGA', title: 'Classifica' },
  '/calendario': { kicker: 'SERIE A', title: 'Calendario' },
  '/mercato': { kicker: 'OPERAZIONI', title: 'Mercato' },
  '/scouting': { kicker: 'ANALISI GIOCATORI', title: 'Scouting' },
  '/war-room': { kicker: 'STUDIO PARTITA', title: 'War Room' },
  '/statistiche': { kicker: 'DATI SQUADRA', title: 'Statistiche' },
  '/crea-lega': { kicker: 'SETUP LEGA', title: 'Crea Lega' },
  '/impostazioni-lega': { kicker: 'SETUP LEGA', title: 'Impostazioni' },
  '/ai-analisi': { kicker: 'COACH PERSONALE', title: 'AI Coach' },
  '/news': { kicker: 'ROSA WIRE', title: 'News' },
  '/hub/analisi': { kicker: 'ANALISI AVANZATA', title: 'Hub' },
}

export default function PanelHeader() {
  const location = useLocation()
  const user = useAppStore((state) => state.user)
  const aiCrediti = useAppStore((state) => state.aiCrediti)

  const meta = PAGE_META[location.pathname] || { kicker: 'FANTABRAIN', title: 'Console' }
  const initialsSource = user?.name || user?.username || 'FB'
  const initials = initialsSource.slice(0, 2).toUpperCase()

  return (
    <header className="panel-header panel-header--luxury">
      <div className="panel-brand">
        <div className="panel-brand__mark panel-brand-mark" aria-hidden="true">
          FB
        </div>
        <div className="panel-brand__copy panel-title-group">
          <span className="panel-eyebrow">{meta.kicker}</span>
          <strong className="panel-title">{meta.title}</strong>
        </div>
      </div>

      <div className="panel-status panel-header-actions">
        <span className="panel-status__pill panel-ai-credits" aria-label={`Crediti AI disponibili: ${aiCrediti ?? 0}`}>
          <span className="panel-ai-credits__full">Crediti AI:</span>
          <span className="panel-ai-credits__short">AI:</span>
          {' '}
          {aiCrediti ?? 0}
        </span>
        <span className="panel-status__pill panel-status__pill--live" aria-label="Applicazione live">
          Live app
        </span>
        <div className="panel-status__avatar panel-avatar" aria-label={`Profilo ${initials}`}>
          {initials}
        </div>
      </div>
    </header>
  )
}
