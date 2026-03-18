import { useState } from 'react';
import useAppStore from '../store/useAppStore';

function MiniBarChart({ punti, max }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24 }}>
      {punti.map((p, i) => (
        <div
          key={i}
          title={`${p}pt`}
          style={{
            flex: 1,
            background: 'var(--purple)',
            opacity: 0.55,
            borderRadius: '1px 1px 0 0',
            height: `${Math.max((p / max) * 100, 8)}%`,
            minWidth: 3, minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

export default function Classifica() {
  const classifica = useAppStore((s) => s.classifica);
  const [modal, setModal] = useState(null);
  const [confronto, setConfronto] = useState(null);

  if (classifica.length === 0) {
    return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="empty-state-icon">🏆</div>
        <div className="empty-state-title">Classifica non disponibile</div>
        <div className="empty-state-desc">
          La classifica verrà popolata quando inizieranno le giornate.
        </div>
      </div>
    );
  }

  const userRow = classifica.find((c) => c.isUser);
  const userPos = classifica.findIndex((c) => c.isUser) + 1;

  const andamento = (team) => {
    if (team.andamento && team.andamento.length > 0) return team.andamento;
    return [50, 50, 50, 50, 50];
  };
  const allPunti = classifica.flatMap((t) => andamento(t));
  const maxPunti = Math.max(...allPunti, 1);

  const kpiItems = [
    { label: 'Posizione', value: `${userPos}°`, color: 'var(--gold)' },
    { label: 'Punti Totali', value: userRow?.punti ?? '—', color: 'var(--purple)' },
    { label: 'V / P / S', value: `${userRow?.vittorie ?? 0} / ${userRow?.pareggi ?? 0} / ${userRow?.sconfitte ?? 0}`, color: 'var(--blue)' },
    { label: 'Media', value: userRow ? `${userRow.puntimedia?.toFixed(1)}pt` : '—', color: 'var(--green)' },
  ];

  return (
    <div>
      {/* KPI */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {kpiItems.map((k) => (
          <div key={k.label} className="glass-card" style={{ flex: 1, minWidth: 100, padding: '14px 18px' }}>
            <div style={{
              fontSize: 10, color: 'var(--text-muted)',
              fontFamily: 'Barlow Condensed', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>{k.label}</div>
            <div style={{
              fontFamily: 'Barlow Condensed', fontWeight: 800,
              fontSize: 26, color: k.color,
            }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabella */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>Pos</th>
                <th>Squadra</th>
                <th>V</th>
                <th>P</th>
                <th>S</th>
                <th>Tot</th>
                <th>Media</th>
                <th>Ultimo</th>
                <th>Forma</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {classifica.map((team, i) => {
                const anda = andamento(team);
                return (
                  <tr key={team.id} className={team.isUser ? 'highlight' : ''}>
                    <td>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: i < 3 ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 12,
                        color: i < 3 ? '#000' : 'var(--text-muted)',
                      }}>{i + 1}</div>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: team.isUser ? 'var(--gold)' : 'var(--text-primary)',
                        fontSize: 13,
                      }}>
                        {team.nome}
                        {team.isUser && (
                          <span style={{ fontSize: 9, marginLeft: 6, opacity: 0.6, color: 'var(--gold)' }}>TU</span>
                        )}
                      </span>
                    </td>
                    <td style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                      {team.vittorie}
                    </td>
                    <td style={{ color: 'var(--amber)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                      {team.pareggi}
                    </td>
                    <td style={{ color: 'var(--red)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                      {team.sconfitte}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'Barlow Condensed', fontWeight: 800,
                        fontSize: 16, color: 'var(--text-primary)',
                      }}>{team.punti}</span>
                    </td>
                    <td style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                      {team.puntimedia?.toFixed(1)}
                    </td>
                    <td style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--blue)' }}>
                      {team.ultimoTurno}
                    </td>
                    <td style={{ width: 80 }}>
                      <MiniBarChart punti={anda} max={maxPunti} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setModal(team)}
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                        >
                          Dettaglio
                        </button>
                        {!team.isUser && (
                          <button
                            onClick={() => setConfronto(confronto?.id === team.id ? null : team)}
                            className="btn-secondary"
                            style={{
                              fontSize: 11, padding: '3px 8px',
                              borderColor: confronto?.id === team.id ? 'var(--blue)' : undefined,
                              color: confronto?.id === team.id ? 'var(--blue)' : undefined,
                            }}
                          >
                            H2H
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Head to Head */}
      {confronto && (
        <div className="glass-card" style={{ marginBottom: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              Head to Head: {userRow?.nome} vs {confronto.nome}
            </div>
            <button
              onClick={() => setConfronto(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
            >✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            {[
              { label: 'Punti Totali', a: userRow?.punti, b: confronto.punti },
              { label: 'Media', a: userRow?.puntimedia?.toFixed(1), b: confronto.puntimedia?.toFixed(1) },
              { label: 'Vittorie', a: userRow?.vittorie, b: confronto.vittorie },
              { label: 'Ultimo Turno', a: userRow?.ultimoTurno, b: confronto.ultimoTurno },
            ].map((row) => {
              const aWins = parseFloat(row.a) > parseFloat(row.b);
              return (
                <div key={row.label} style={{ display: 'contents' }}>
                  <div style={{
                    textAlign: 'right',
                    fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20,
                    color: aWins ? 'var(--green)' : 'var(--text-secondary)',
                  }}>{row.a}</div>
                  <div style={{
                    textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{row.label}</div>
                  <div style={{
                    textAlign: 'left',
                    fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20,
                    color: !aWins ? 'var(--green)' : 'var(--text-secondary)',
                  }}>{row.b}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal dettaglio */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 800,
                  fontSize: 22, color: 'var(--text-primary)',
                }}>{modal.nome}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dettaglio stagione</div>
              </div>
              <button
                onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}
              >✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Punti', value: modal.punti, color: 'var(--green)' },
                { label: 'Vittorie', value: modal.vittorie, color: 'var(--green)' },
                { label: 'Pareggi', value: modal.pareggi, color: 'var(--amber)' },
                { label: 'Sconfitte', value: modal.sconfitte, color: 'var(--red)' },
                { label: 'Media', value: modal.puntimedia?.toFixed(1), color: 'var(--blue)' },
                { label: 'Ultimo', value: modal.ultimoTurno, color: 'var(--text-primary)' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, padding: '10px 12px', textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 10, color: 'var(--text-muted)',
                    fontFamily: 'Barlow Condensed', letterSpacing: '0.08em',
                    textTransform: 'uppercase', marginBottom: 4,
                  }}>{s.label}</div>
                  <div style={{
                    fontFamily: 'Barlow Condensed', fontWeight: 800,
                    fontSize: 22, color: s.color,
                  }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              Forma ultimi 5 turni
            </div>
            <div style={{ height: 60 }}>
              <MiniBarChart punti={andamento(modal)} max={maxPunti} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
