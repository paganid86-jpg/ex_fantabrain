// src/components/dashboard/CountdownCard.jsx
import { useState, useEffect, useMemo } from 'react';
import useSerieAStore from '../../stores/useSerieAStore';

const FOLLOWED_TEAM_KEY = 'fantabrain-followed-team';

function getCountdown(dateStr) {
  const diff = new Date(dateStr) - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function CountdownCard() {
  const matches   = useSerieAStore((s) => s.matches);
  const standings = useSerieAStore((s) => s.standings);

  const [followedTeamId, setFollowedTeamId] = useState(() => {
    const stored = localStorage.getItem(FOLLOWED_TEAM_KEY);
    return stored ? Number(stored) : null;
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Team list from standings (sorted by Serie A position)
  const teamOptions = useMemo(
    () => (standings || []).map((t) => ({ id: t.id, label: t.shortName || t.name })),
    [standings]
  );
  const currentTeamLabel = teamOptions.find((t) => t.id === followedTeamId)?.label || 'Scegli squadra';

  // Find the relevant next match
  const match = useMemo(() => {
    const upcoming = matches.filter((m) =>
      ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'].includes(m.status)
    );
    if (!upcoming.length) return null;
    if (followedTeamId) {
      return (
        upcoming.find(
          (m) => m.homeTeam.id === followedTeamId || m.awayTeam.id === followedTeamId
        ) || null
      );
    }
    return [...upcoming].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [matches, followedTeamId]);

  // Determine card state: 'hidden' | 'upcoming' | 'live'
  const cardState = useMemo(() => {
    if (!match) return 'hidden';
    if (['IN_PLAY', 'PAUSED'].includes(match.status)) return 'live';
    const msToKickoff = new Date(match.date) - Date.now();
    if (msToKickoff > 0 && msToKickoff < 24 * 60 * 60 * 1000) return 'upcoming';
    return 'hidden';
  }, [match]);

  // Countdown ticker — runs only in 'upcoming' state
  useEffect(() => {
    if (cardState !== 'upcoming' || !match) return;
    setCountdown(getCountdown(match.date));
    const id = setInterval(() => setCountdown(getCountdown(match.date)), 1000);
    return () => clearInterval(id);
  }, [cardState, match]);

  if (cardState === 'hidden') return null;

  function selectTeam(id) {
    setFollowedTeamId(id);
    localStorage.setItem(FOLLOWED_TEAM_KEY, String(id));
    setShowDropdown(false);
  }

  function clearTeam() {
    setFollowedTeamId(null);
    localStorage.removeItem(FOLLOWED_TEAM_KEY);
    setShowDropdown(false);
  }

  const home = match.homeTeam.shortName || match.homeTeam.name;
  const away = match.awayTeam.shortName || match.awayTeam.name;

  return (
    <div
      className="glass-card"
      style={{ padding: '14px 18px', borderTop: '3px solid var(--accent-primary)', position: 'relative' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
          color: cardState === 'live' ? 'var(--danger)' : 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {cardState === 'live' ? '● LIVE' : 'PROSSIMA PARTITA'}
        </span>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          style={{
            background: 'none', border: '1px solid var(--border-glass)',
            borderRadius: 6, padding: '3px 10px',
            color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
          }}
        >
          {currentTeamLabel} ⚙
        </button>
      </div>

      {/* Team selector dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: 44, right: 18,
          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
          borderRadius: 8, padding: '6px 0', zIndex: 50,
          minWidth: 180, maxHeight: 220, overflowY: 'auto',
          backdropFilter: 'blur(12px)',
        }}>
          <button
            onClick={clearTeam}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', padding: '6px 14px',
              color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
            }}
          >
            Tutte le squadre
          </button>
          {teamOptions.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTeam(t.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: t.id === followedTeamId ? 'rgba(0,212,255,0.08)' : 'none',
                border: 'none', padding: '6px 14px',
                color: t.id === followedTeamId ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontSize: 12, cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Match display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          {home}
        </span>
        <div style={{ textAlign: 'center' }}>
          {cardState === 'live' ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, color: 'var(--danger)' }}>
                {match.score.home ?? '–'} – {match.score.away ?? '–'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700 }}>● LIVE</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--accent-primary)' }}>
                {countdown}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>al fischio</div>
            </>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          {away}
        </span>
      </div>
    </div>
  );
}
