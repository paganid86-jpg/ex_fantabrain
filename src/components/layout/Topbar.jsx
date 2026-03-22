import { useLocation } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import useLeagueStore from '../../store/useLeagueStore';

const pageTitles = {
  '/': 'Dashboard',
  '/ai-analisi': 'AI Analisi',
  '/la-rosa': 'La Rosa',
  '/schieramento': 'Schieramento',
  '/classifica': 'Classifica',
  '/calendario': 'Calendario',
  '/mercato': 'Mercato',
  '/scouting': 'Scouting',
  '/war-room': 'War Room',
  '/statistiche': 'Statistiche',
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const user = useAppStore((s) => s.user);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const currentLeague = useLeagueStore((s) => s.currentLeague);
  const leagueName = currentLeague?.name || 'Nessuna lega';
  const title = pageTitles[location.pathname] || 'FantaBrain AI';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 20, padding: 4,
            display: 'none',
          }}
          className="hamburger-btn"
          aria-label="Menu"
        >
          ☰
        </button>
        <div>
          <span className="section-title" style={{ fontSize: 18 }}>{title}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-elevated)', borderRadius: 8,
          padding: '6px 12px', border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em' }}>GIORNATA</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--accent-amber)' }}>
            {giornataCorrente}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-muted)',
          maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {leagueName}
        </div>
      </div>
    </header>
  );
}
