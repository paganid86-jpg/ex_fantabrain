import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useAppStore from '../../store/useAppStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⬛', group: null },
  { path: '/ai-analisi', label: 'AI Analisi', icon: '🤖', group: 'AI' },
  { path: '/war-room', label: 'War Room', icon: '⚔️', group: 'AI' },
  { path: '/la-rosa', label: 'La Rosa', icon: '👥', group: 'Squadra' },
  { path: '/schieramento', label: 'Schieramento', icon: '🏟️', group: 'Squadra' },
  { path: '/mercato', label: 'Mercato', icon: '💰', group: 'Squadra' },
  { path: '/scouting', label: 'Scouting', icon: '🔍', group: 'Squadra' },
  { path: '/classifica', label: 'Classifica', icon: '🏆', group: 'Lega' },
  { path: '/calendario', label: 'Calendario', icon: '📅', group: 'Lega' },
  { path: '/statistiche', label: 'Statistiche', icon: '📊', group: 'Lega' },
];

const groups = [null, 'AI', 'Squadra', 'Lega'];

export default function Sidebar({ mobileOpen, onClose }) {
  const user = useAppStore((s) => s.user);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 39, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #2979ff, #00e676)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 16, color: '#000',
            }}>FB</div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                FANTABRAIN
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent-green)', fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.08em' }}>
                AI POWERED
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {groups.map((group) => {
            const items = navItems.filter((n) => n.group === group);
            return (
              <div key={group || 'root'}>
                {group && <div className="nav-group-label">{group}</div>}
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.05em' }}>CREDITI AI</span>
            <span style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18,
              color: aiCrediti < 3 ? 'var(--accent-red)' : 'var(--accent-green)',
            }}>{aiCrediti}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2979ff, #00e676)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12, color: '#000',
              flexShrink: 0,
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.plan.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
