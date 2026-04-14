export default function KpiCard({ label, value, sub, color = 'var(--accent-green)', trend }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {sub}
        </div>
      )}
      {trend !== undefined && (
        <div style={{
          fontSize: 12, marginTop: 4,
          color: trend >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
        }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
