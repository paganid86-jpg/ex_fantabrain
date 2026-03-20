import useAppStore from '../store/useAppStore';

function BarChart({ data, max, height = 80, labels }) {
  const m = max || Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', height: '100%', justifyContent: 'flex-end',
          }}
        >
          <div
            title={`${labels ? labels[i] : `G${i + 1}`}: ${v}pt`}
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, var(--accent-primary) 0%, var(--gold) 100%)',
              borderRadius: '2px 2px 0 0',
              height: `${Math.max((v / m) * 100, 2)}%`,
              opacity: 0.75,
              transition: 'opacity 0.15s',
              cursor: 'default',
              minHeight: 3,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.75; }}
          />
        </div>
      ))}
    </div>
  );
}

function StatBar({ value, max = 10, color = 'var(--gold)' }) {
  const pct = Math.min(((parseFloat(value) - 5) / (max - 5)) * 100, 100);
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${Math.max(pct, 0)}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.5s',
      }} />
    </div>
  );
}

export default function Statistiche() {
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const calendario = useAppStore((s) => s.calendario);

  const userRow = classifica.find((c) => c.isUser);

  // Empty state se non ci sono dati
  if (rosa.length === 0 && classifica.length === 0) {
    return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="empty-state-icon">📈</div>
        <div className="empty-state-title">Nessun dato disponibile</div>
        <div className="empty-state-desc">
          Aggiungi giocatori e gioca le tue partite per vedere le statistiche della stagione.
        </div>
      </div>
    );
  }

  // Calcoli da dati live
  const giornateGiocate = calendario.filter((g) => g.giocata && g.puntiUser);
  const andamentoPunti = giornateGiocate.map((g) => g.puntiUser);
  const labelsGiornate = giornateGiocate.map((g) => `G${g.giornata}`);

  const puntiTotali = userRow?.punti ?? andamentoPunti.reduce((s, v) => s + v, 0);
  const media = andamentoPunti.length > 0
    ? (andamentoPunti.reduce((s, v) => s + v, 0) / andamentoPunti.length).toFixed(1)
    : (userRow?.puntimedia?.toFixed(1) ?? '—');

  const migliore = andamentoPunti.length > 0
    ? { punti: Math.max(...andamentoPunti), giornata: labelsGiornate[andamentoPunti.indexOf(Math.max(...andamentoPunti))] }
    : null;
  const peggiore = andamentoPunti.length > 0
    ? { punti: Math.min(...andamentoPunti), giornata: labelsGiornate[andamentoPunti.indexOf(Math.min(...andamentoPunti))] }
    : null;

  // Top performer
  const topPerformer = [...rosa]
    .filter((g) => !g.infortunato)
    .sort((a, b) => b.votoMedia - a.votoMedia)
    .slice(0, 8);

  // Media per reparto
  const ruoliGruppo = {
    Portieri: rosa.filter((g) => g.ruoloMantra === 'Por'),
    Difensori: rosa.filter((g) => ['DD', 'DS', 'DC'].some((r) => g.ruoloMantra.startsWith(r))),
    Centrocampisti: rosa.filter((g) => ['M/C', 'C'].some((r) => g.ruoloMantra.startsWith(r))),
    Attaccanti: rosa.filter((g) => ['T/A', 'PC', 'T', 'A', 'W'].some((r) => g.ruoloMantra.startsWith(r))),
  };
  const mediaPerRuolo = Object.entries(ruoliGruppo).map(([nome, giocatori]) => ({
    nome,
    media: giocatori.length > 0
      ? (giocatori.reduce((s, g) => s + g.votoMedia, 0) / giocatori.length).toFixed(2)
      : null,
    count: giocatori.length,
  }));

  // Forma
  const inForma = rosa.filter((g) => {
    const ultimi3 = (g.votiUltimi5 || []).slice(-3).filter((v) => v > 0);
    if (ultimi3.length === 0) return false;
    const m3 = ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length;
    return m3 > g.votoMedia + 0.3;
  });

  const inCalo = rosa.filter((g) => {
    const ultimi3 = (g.votiUltimi5 || []).slice(-3).filter((v) => v > 0);
    if (ultimi3.length === 0) return false;
    const m3 = ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length;
    return m3 < g.votoMedia - 0.3;
  });

  const kpiItems = [
    { label: 'Punti Totali Stagione', value: puntiTotali, color: 'var(--green)' },
    { label: 'Media Punti / Giornata', value: `${media}`, color: 'var(--blue)' },
    migliore
      ? { label: 'Migliore Giornata', value: `${migliore.punti}pt`, sub: migliore.giornata, color: 'var(--gold)' }
      : { label: 'Migliore Giornata', value: '—', color: 'var(--gold)' },
    peggiore
      ? { label: 'Peggior Giornata', value: `${peggiore.punti}pt`, sub: peggiore.giornata, color: 'var(--red)' }
      : { label: 'Peggior Giornata', value: '—', color: 'var(--red)' },
    userRow
      ? { label: 'V / P / S', value: `${userRow.vittorie}/${userRow.pareggi}/${userRow.sconfitte}`, color: 'var(--text-primary)' }
      : null,
  ].filter(Boolean);

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {kpiItems.map((k) => (
          <div key={k.label} className="glass-card" style={{ flex: 1, minWidth: 100, padding: '14px 18px' }}>
            <div style={{
              fontSize: 10, color: 'var(--text-muted)',
              fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>{k.label}</div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 24, color: k.color,
            }}>{k.value}</div>
            {k.sub && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Grafico andamento */}
      {andamentoPunti.length > 0 && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              📈 Andamento Punti — Stagione
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              G1 → G{andamentoPunti.length}
            </div>
          </div>
          <BarChart data={andamentoPunti} height={100} labels={labelsGiornate} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>G1</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>G{andamentoPunti.length}</span>
          </div>
        </div>
      )}

      {/* Grid: Top performer + Media per reparto */}
      {rosa.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Top performer */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>
              🏆 Top Performer della Rosa
            </div>
            {topPerformer.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nessun dato disponibile</div>
            ) : (
              topPerformer.map((g, i) => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0',
                  borderBottom: '1px solid rgba(0,212,255,0.08)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: i < 3 ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 11,
                    color: i < 3 ? '#000' : 'var(--text-muted)',
                  }}>{i + 1}</div>
                  <span className="badge badge-muted" style={{ fontSize: 9, flexShrink: 0 }}>
                    {g.ruoloMantra}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {g.cognome}
                  </span>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                    color: g.votoMedia >= 7 ? 'var(--green)' : 'var(--amber)',
                  }}>
                    {g.votoMedia.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Media per reparto */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>
              📊 Media per Reparto
            </div>
            {mediaPerRuolo.map((r) => {
              const val = parseFloat(r.media);
              const barColor = val >= 7 ? 'var(--green)' : val >= 6 ? 'var(--gold)' : 'var(--red)';
              return (
                <div key={r.nome} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.nome}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.count} gioc.</span>
                      <span style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16,
                        color: r.media ? barColor : 'var(--text-muted)',
                      }}>
                        {r.media ?? '—'}
                      </span>
                    </div>
                  </div>
                  {r.media && <StatBar value={r.media} color={barColor} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Forma / Calo */}
      {rosa.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* In forma */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <div className="section-title" style={{ fontSize: 14 }}>In Forma</div>
              <span className="badge badge-green">{inForma.length}</span>
            </div>
            {inForma.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Nessun giocatore particolarmente in forma
              </div>
            ) : (
              inForma.map((g) => {
                const ultimi3 = (g.votiUltimi5 || []).slice(-3).filter((v) => v > 0);
                const media3 = (ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length).toFixed(1);
                return (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 0', borderBottom: '1px solid rgba(0,212,255,0.08)',
                  }}>
                    <span className="badge badge-muted" style={{ fontSize: 9, flexShrink: 0 }}>
                      {g.ruoloMantra}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {g.cognome}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: 14, color: 'var(--green)',
                      }}>{media3}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>media 3</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: 14, color: 'var(--text-secondary)',
                      }}>{g.votoMedia.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>stagione</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* In calo */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>📉</span>
              <div className="section-title" style={{ fontSize: 14 }}>In Calo</div>
              <span className="badge badge-red">{inCalo.length}</span>
            </div>
            {inCalo.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Nessun giocatore in calo di prestazioni
              </div>
            ) : (
              inCalo.map((g) => {
                const ultimi3 = (g.votiUltimi5 || []).slice(-3).filter((v) => v > 0);
                const media3 = ultimi3.length > 0
                  ? (ultimi3.reduce((s, v) => s + v, 0) / ultimi3.length).toFixed(1)
                  : '—';
                return (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 0', borderBottom: '1px solid rgba(0,212,255,0.08)',
                  }}>
                    <span className="badge badge-muted" style={{ fontSize: 9, flexShrink: 0 }}>
                      {g.ruoloMantra}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {g.cognome}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: 14, color: 'var(--red)',
                      }}>{media3}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>media 3</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: 14, color: 'var(--text-secondary)',
                      }}>{g.votoMedia.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>stagione</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
