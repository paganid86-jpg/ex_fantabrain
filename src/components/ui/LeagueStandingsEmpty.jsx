// src/components/ui/LeagueStandingsEmpty.jsx
export default function LeagueStandingsEmpty({ league }) {
  const partecipanti = league?.participants || [];
  const max = league?.maxParticipants || '?';

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, marginBottom: 12 }}>🏆</div>
      <div style={{
        fontFamily: 'Barlow Condensed',
        fontWeight: 700,
        fontSize: 16,
        color: 'var(--text-primary)',
        marginBottom: 6,
      }}>
        La classifica sarà disponibile dopo la prima giornata
      </div>
      <div style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        marginBottom: 16,
      }}>
        Partecipanti iscritti: <strong style={{ color: 'var(--text-secondary)' }}>{partecipanti.length} / {max}</strong>
      </div>

      {partecipanti.length > 0 && (
        <div style={{ textAlign: 'left' }}>
          {partecipanti.map((p) => (
            <div key={p.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              borderRadius: 6,
              background: p.isCurrentUser ? 'rgba(0, 230, 118, 0.06)' : 'transparent',
              borderLeft: p.isCurrentUser ? '2px solid rgba(0, 230, 118, 0.4)' : '2px solid transparent',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 13, color: p.isCurrentUser ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                {p.teamName}
                {p.isCurrentUser && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--text-muted)' }}>TU</span>}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Iscritto il {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
