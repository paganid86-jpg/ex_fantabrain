import { NavLink } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import useLeagueStore from '../../stores/useLeagueStore';

const navItems = [
  { path: '/',              label: 'Dashboard',     icon: '📊', group: null },
  { path: '/ai-analisi',   label: 'AI Analisi',    icon: '🤖', group: 'AI' },
  { path: '/war-room',     label: 'War Room',       icon: '⚔️', group: 'AI' },
  { path: '/la-rosa',      label: 'La Rosa',        icon: '👥', group: 'Squadra' },
  { path: '/schieramento', label: 'Schieramento',   icon: '🏟️', group: 'Squadra' },
  { path: '/mercato',      label: 'Mercato',        icon: '💰', group: 'Squadra' },
  { path: '/scouting',     label: 'Scouting',       icon: '🔍', group: 'Squadra' },
  { path: '/classifica',        label: 'Classifica',        icon: '🏆', group: 'Lega' },
  { path: '/calendario',        label: 'Calendario',        icon: '📅', group: 'Lega' },
  { path: '/statistiche',       label: 'Statistiche',       icon: '📈', group: 'Lega' },
  { path: '/impostazioni-lega', label: 'Impostazioni Lega', icon: '⚙️', group: 'Lega' },
];

const groups = [null, 'AI', 'Squadra', 'Lega'];

export default function Sidebar({ mobileOpen, onClose }) {
  const user      = useAppStore((s) => s.user);
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const hasLeague = useLeagueStore((s) => s.currentLeagueId != null);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="mobile-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 20, 0.72)',
            zIndex: 39,
          }}
        />
      )}

      <aside
        className={`sidebar${mobileOpen ? ' open' : ''}`}
        style={{
          background: 'rgba(5, 10, 20, 0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid var(--border-glass)',
        }}
      >

        {/* ── Logo ── */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #00D4FF, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 16,
              color: 'var(--bg-deep)',
              letterSpacing: '0.02em',
              flexShrink: 0,
              boxShadow: '0 0 18px rgba(0, 212, 255, 0.40)',
            }}>
              FA
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 17,
                color: 'var(--text-primary)',
                letterSpacing: '0.07em',
                lineHeight: 1.1,
              }}>
                FANTAAI
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 10,
                color: 'var(--accent-primary)',
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
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {item.label}
                      {item.path === '/ai-analisi' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                          color: '#000',
                          fontSize: '8px',
                          fontWeight: '900',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px',
                          marginLeft: '4px',
                        }}>
                          GOLD
                        </span>
                      )}
                    </span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* ── Crea Lega CTA (solo se non ha ancora una lega) ── */}
        {!hasLeague && (
          <div style={{ padding: '0 var(--space-sm) var(--space-sm)' }}>
            <NavLink
              to="/crea-lega"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(6,182,212,0.08))',
                border: '1px solid rgba(0,212,255,0.35)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⚽</span>
              <span>Crea una Lega</span>
            </NavLink>
          </div>
        )}

        {/* ── Footer crediti + utente ── */}
        <div style={{
          padding: 'var(--space-sm) var(--space-sm) var(--space-md)',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}>
          {/* Crediti AI */}
          <div style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-glass)',
            boxShadow: aiCrediti < 3
              ? '0 0 12px rgba(239, 68, 68, 0.12)'
              : '0 0 12px rgba(0, 212, 255, 0.10)',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
                CREDITI AI
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1,
                color: aiCrediti < 3 ? 'var(--danger)' : 'var(--accent-primary)',
                textShadow: aiCrediti < 3
                  ? '0 0 12px rgba(239, 68, 68, 0.40)'
                  : '0 0 12px rgba(0, 212, 255, 0.35)',
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
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #00D4FF, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 14,
              color: 'var(--bg-deep)',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(0, 212, 255, 0.30)',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.name}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
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
