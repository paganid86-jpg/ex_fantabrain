import { NavLink } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

const navItems = [
  { path: '/app',             label: 'Dashboard',     icon: '📊', group: null },
  { path: '/app/ai-analisi',  label: 'AI Analisi',    icon: '🤖', group: 'AI' },
  { path: '/app/war-room',    label: 'War Room',       icon: '⚔️', group: 'AI' },
  { path: '/app/la-rosa',     label: 'La Rosa',        icon: '👥', group: 'Squadra' },
  { path: '/app/schieramento',label: 'Schieramento',   icon: '🏟️', group: 'Squadra' },
  { path: '/app/mercato',     label: 'Mercato',        icon: '💰', group: 'Squadra' },
  { path: '/app/scouting',    label: 'Scouting',       icon: '🔍', group: 'Squadra' },
  { path: '/app/classifica',  label: 'Classifica',     icon: '🏆', group: 'Lega' },
  { path: '/app/calendario',  label: 'Calendario',     icon: '📅', group: 'Lega' },
  { path: '/app/statistiche', label: 'Statistiche',    icon: '📈', group: 'Lega' },
];

const groups = [null, 'AI', 'Squadra', 'Lega'];

export default function Sidebar({ mobileOpen, onClose }) {
  const user      = useAppStore((s) => s.user);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="mobile-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 3, 15, 0.72)',
            zIndex: 39,
          }}
        />
      )}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>

        {/* ── Logo ── */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #a855f7 0%, #f5c842 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 16,
              color: '#07030f',
              letterSpacing: '0.02em',
              flexShrink: 0,
              boxShadow: '0 0 18px rgba(168, 85, 247, 0.40)',
            }}>
              FB
            </div>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 17,
                color: '#f0e8ff',
                letterSpacing: '0.07em',
                lineHeight: 1.1,
              }}>
                FANTABRAIN
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: 10,
                color: '#f5c842',
                letterSpacing: '0.14em',
                marginTop: 2,
              }}>
                AI POWERED
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigazione ── */}
        <nav className="sidebar-nav">
          {groups.map((group) => {
            const items = navItems.filter((n) => n.group === group);
            return (
              <div key={group ?? 'root'}>
                {group && (
                  <div className="nav-group-label">{group}</div>
                )}
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/app'}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* ── Footer crediti + utente ── */}
        <div style={{
          padding: '14px 12px 18px',
          borderTop: '1px solid rgba(245, 200, 66, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {/* Crediti AI */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(245, 200, 66, 0.12)',
          }}>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#4d3870',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
                CREDITI AI
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1,
                color: aiCrediti < 3 ? '#f87171' : '#f5c842',
                textShadow: aiCrediti < 3
                  ? '0 0 12px rgba(248, 113, 113, 0.40)'
                  : '0 0 12px rgba(245, 200, 66, 0.35)',
              }}>
                {aiCrediti}
              </div>
            </div>
            <span
              className={`badge ${aiCrediti < 3 ? 'badge-red' : 'badge-gold'}`}
              style={{ fontSize: 10 }}
            >
              {aiCrediti < 3 ? 'BASSO' : 'OK'}
            </span>
          </div>

          {/* Info utente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #f5c842 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              color: '#07030f',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.30)',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#f0e8ff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.name}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.08em',
                color: '#4d3870',
                textTransform: 'uppercase',
              }}>
                {user.plan}
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
