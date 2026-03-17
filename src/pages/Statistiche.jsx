import useAppStore from '../store/useAppStore';
import { statisticheStagione } from '../data/mockData';

function BarChart({ data, max, height = 80, color = 'var(--accent-blue)', labels }) {
  const m = max || Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
        >
          <div
            title={`${labels ? labels[i] : `G${i + 1}`}: ${v}pt`}
            style={{
              width: '100%', background: color,
              borderRadius: '2px 2px 0 0',
              height: `${Math.max((v / m) * 100, 2)}%`,
              opacity: 0.7, transition: 'opacity 0.15s', cursor: 'default', minHeight: 3,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Statistiche() {
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);

  const userRow = classifica.find((c) => c.isUser);

  // Top performer: giocatori per media voti (proxy punteggio)
  const topPerformer = [...rosa]
    .filter((g) => !g.infortunato)
    .sort((a, b) => b.votoMedia - a.votoMedia)
    .slice(0, 8);

  // Media per ruolo
  const ruoliGruppo = {
    'Portieri': rosa.filter((g) => g.ruoloMantra === 'Por'),
    'Difensori': rosa.filter((g) => ['DD', 'DS', 'DC'].some((r) => g.ruoloMantra.startsWith(r))),
    'Centrocampisti': rosa.filter((g) => ['M/C', 'C'].some((r) => g.ruoloMantra.startsWith(r))),
    'Attaccanti': rosa.filter((g) => ['T/A', 'PC', 'T', 'A', 'W'].some((r) => g.ruoloMantra.startsWith(r))),
  };
  const mediaPerRuolo = Object.entries(ruoliGruppo).map(([nome, giocatori]) => ({
    nome,
    media: giocatori.length > 0
      ? (giocatori.reduce((s, g) => s + g.votoMedia, 0) / giocatori.length).toFixed(2)
      : '—',
    count: giocatori.length,
  }));

  // Forma: confronto ultimi 3 voti vs media
  const inForma = rosa.filter((g) => {
    const ultimi3 = g.votiUltimi5.slice(-3).filter((v) => v > 0);
    if (ultimi3.length === 0) return false;
    const mediaUltimi3 = ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length;
    return mediaUltimi3 > g.votoMedia + 0.3;
  });
  const inCalo = rosa.filter((g) => {
    const ultimi3 = g.votiUltimi5.slice(-3).filter((v) => v > 0);
    if (ultimi3.length === 0) return false;
    const mediaUltimi3 = ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length;
    return mediaUltimi3 < g.votoMedia - 0.3;
  });

  const andamentoPunti = statisticheStagione.andamentoPunti;
  const labelsGiornate = andamentoPunti.map((_, i) => `G${i + 1}`);

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Punti Totali Stagione', value: statisticheStagione.puntiTotali, color: 'var(--accent-green)' },
          { label: 'Media Punti/Giornata', value: statisticheStagione.media.toFixed(1), color: 'var(--accent-blue)' },
          { label: 'Migliore Giornata', value: `${statisticheStagione.miglioreGiornata.punti}pt`, sub: `G${statisticheStagione.miglioreGiornata.giornata}`, color: 'var(--accent-amber)' },
          { label: 'Peggior Giornata', value: `${statisticheStagione.peggiorGiornata.punti}pt`, sub: `G${statisticheStagione.peggiorGiornata.giornata}`, color: 'var(--accent-red)' },
          { label: 'V / P / S', value: `${statisticheStagione.vittorie}/${statisticheStagione.pareggi}/${statisticheStagione.sconfitte}`, color: 'var(--text-primary)' },
        ].map((k) => (
          <div key={k.label} className="card" style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 24, color: k.color }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Grafico andamento stagione */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ fontSize: 15 }}>📈 Andamento Punti — Stagione 2024/25</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>G1 → G{andamentoPunti.length}</div>
        </div>
        <BarChart data={andamentoPunti} height={100} labels={labelsGiornate} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>G1</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>G{andamentoPunti.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Top performer */}
        <div className="card">
          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>🏆 Top Performer della Rosa</div>
          {topPerformer.map((g, i) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: i < 3 ? 'var(--accent-amber)' : 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 11,
                color: i < 3 ? '#000' : 'var(--text-muted)', flexShrink: 0,
              }}>{i + 1}</div>
              <span className="badge badge-muted" style={{ fontSize: 9, flexShrink: 0 }}>{g.ruoloMantra}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.cognome}
              </span>
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: g.votoMedia >= 7 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                {g.votoMedia.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Media per ruolo */}
        <div className="card">
          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>📊 Media per Reparto</div>
          {mediaPerRuolo.map((r) => (
            <div key={r.nome} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.nome}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.count} gioc.</span>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: parseFloat(r.media) >= 7 ? 'var(--accent-green)' : parseFloat(r.media) >= 6 ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                    {r.media}
                  </span>
                </div>
              </div>
              <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(((parseFloat(r.media) - 5) / 3) * 100, 100)}%`,
                  background: parseFloat(r.media) >= 7 ? 'var(--accent-green)' : parseFloat(r.media) >= 6 ? 'var(--accent-amber)' : 'var(--accent-red)',
                  borderRadius: 2, transition: 'width 0.5s',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forma giocatori */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <div className="section-title" style={{ fontSize: 14 }}>In Forma</div>
            <span className="badge badge-green">{inForma.length}</span>
          </div>
          {inForma.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nessun giocatore particolarmente in forma</div>}
          {inForma.map((g) => {
            const ultimi3 = g.votiUltimi5.slice(-3).filter((v) => v > 0);
            const media3 = (ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length).toFixed(1);
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                <span className="badge badge-muted" style={{ fontSize: 9, flexShrink: 0 }}>{g.ruoloMantra}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{g.cognome}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--accent-green)' }}>{media3}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>media 3</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>{g.votoMedia.toFixed(1)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>stagione</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📉</span>
            <div className="section-title" style={{ fontSize: 14 }}>In Calo</div>
            <span className="badge badge-red">{inCalo.length}</span>
          </div>
          {inCalo.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nessun giocatore in calo di prestazioni</div>}
          {inCalo.map((g) => {
            const ultimi3 = g.votiUltimi5.slice(-3).filter((v) => v > 0);
            const media3 = ultimi3.length > 0 ? (ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length).toFixed(1) : '—';
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                <span className="badge badge-muted" style={{ fontSize: 9, flexShrink: 0 }}>{g.ruoloMantra}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{g.cognome}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--accent-red)' }}>{media3}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>media 3</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>{g.votoMedia.toFixed(1)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>stagione</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
