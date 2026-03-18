import { useLocation } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

const pageTitles = {
  '/':             'Dashboard',
  '/ai-analisi':   'AI Analisi',
  '/war-room':     'War Room',
  '/la-rosa':      'La Rosa',
  '/schieramento': 'Schieramento',
  '/mercato':      'Mercato',
  '/scouting':     'Scouting',
  '/classifica':   'Classifica',
  '/calendario':   'Calendario',
  '/statistiche':  'Statistiche',
};

export default function Topbar({ onMenuClick }) {
  const location        = useLocation();
  const user            = useAppStore((s) => s.user);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);

  const title = pageTitles[location.pathname] ?? 'FantaBrain AI';

  return (
    <header className="topbar">

      {/* ── Sinistra: hamburger + titolo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Apri menu"
        >
          ☰
        </button>

        <div>
          <span className="section-title" style={{ fontSize: 18 }}>
            {title}
          </span>
        </div>
      </div>

      {/* ── Destra: giornata + lega ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Badge giornata gold glass */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(245, 200, 66, 0.07)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8,
          padding: '5px 12px',
          border: '1px solid rgba(245, 200, 66, 0.22)',
          boxShadow: '0 0 10px rgba(245, 200, 66, 0.06)',
        }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#4d3870',
            textTransform: 'uppercase',
          }}>
            GIORNATA
          </span>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            lineHeight: 1,
            color: '#f5c842',
            textShadow: '0 0 10px rgba(245, 200, 66, 0.40)',
          }}>
            {giornataCorrente}
          </span>
        </div>

        {/* Nome lega muted */}
        <div style={{
          fontSize: 12,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.05em',
          color: '#4d3870',
          maxWidth: 160,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <span style={{ fontSize: 11, opacity: 0.6 }}>🏆</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.league}
          </span>
        </div>

      </div>
    </header>
  );
}
