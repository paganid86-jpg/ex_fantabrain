export default function AlertItem({ tipo, messaggio, giocatore }) {
  const config = {
    infortunio: { color: 'var(--accent-red)', icon: '🤕', label: 'INFORTUNIO' },
    diffida: { color: 'var(--accent-amber)', icon: '⚠️', label: 'DIFFIDA' },
    forma: { color: 'var(--accent-green)', icon: '🔥', label: 'IN FORMA' },
    mercato: { color: 'var(--accent-blue)', icon: '💰', label: 'MERCATO' },
    info: { color: 'var(--text-secondary)', icon: 'ℹ️', label: 'INFO' },
  };
  const cfg = config[tipo] || config.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 0', borderBottom: '1px solid rgba(30,45,69,0.4)',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontFamily: 'Barlow Condensed', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em', color: cfg.color, textTransform: 'uppercase',
          }}>{cfg.label}</span>
          {giocatore && (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{giocatore}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{messaggio}</div>
      </div>
    </div>
  );
}
