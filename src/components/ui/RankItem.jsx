export default function RankItem({ posizione, nome, punti, isUser, ultimoTurno }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: isUser ? 'rgba(0, 230, 118, 0.08)' : 'transparent',
      border: isUser ? '1px solid rgba(0, 230, 118, 0.2)' : '1px solid transparent',
      marginBottom: 4,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: posizione <= 3 ? 'var(--accent-amber)' : 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
        color: posizione <= 3 ? '#000' : 'var(--text-muted)',
        flexShrink: 0,
      }}>
        {posizione}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isUser ? 'var(--accent-green)' : 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {nome}
          {isUser && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--text-muted)' }}>TU</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {punti}
        </div>
        {ultimoTurno !== undefined && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{ultimoTurno}</div>
        )}
      </div>
    </div>
  );
}
