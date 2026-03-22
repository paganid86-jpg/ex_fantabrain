// src/components/ui/PointsChartEmpty.jsx
export default function PointsChartEmpty() {
  const skeletonBars = [
    { height: '60%' },
    { height: '80%' },
    { height: '45%' },
    { height: '70%' },
    { height: '55%' },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 4,
        height: 50,
        marginBottom: 4,
      }}>
        {skeletonBars.map((bar, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: bar.height,
              background: 'var(--bg-elevated)',
              borderRadius: '2px 2px 0 0',
              opacity: 0.35,
              border: '1px solid var(--border)',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {skeletonBars.map((_, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center',
            fontSize: 10, color: 'var(--text-muted)',
            fontFamily: 'Barlow Condensed',
          }}>
            G{i + 1}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 10,
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        I tuoi punti appariranno qui dopo la prima giornata di campionato
      </div>
    </div>
  );
}
