import { useLocation } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import useSerieAStore from '../../stores/useSerieAStore';

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
  const location         = useLocation();
  const user             = useAppStore((s) => s.user);
  const currentMatchday  = useSerieAStore((s) => s.currentMatchday);

  const title = pageTitles[location.pathname] ?? 'FantaAI';

  return (
    <header
      className="topbar"
      style={{
        background: 'rgba(5, 10, 20, 0.78)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >

      {/* ── Sinistra: hamburger + titolo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Apri menu"
        >
          ☰
        </button>

        <span
          className="section-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text-primary)',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </span>
      </div>

      {/* ── Destra: giornata + lega ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Badge giornata — glass con accent cyan */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(0, 212, 255, 0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 12px',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.08)',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            GIORNATA
          </span>
          {currentMatchday != null ? (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 18,
              lineHeight: 1,
              color: 'var(--accent-primary)',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.40)',
            }}>
              {currentMatchday}
            </span>
          ) : (
            <span
              style={{
                display: 'inline-block',
                width: '1.5rem',
                height: '0.75rem',
                background: 'var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                opacity: 0.5,
              }}
            />
          )}
        </div>

        {/* Nome lega */}
        <div style={{
          fontSize: 12,
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
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
