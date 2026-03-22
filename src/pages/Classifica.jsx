import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
import useLeagueStore from '../stores/useLeagueStore';

function MiniBarChart({ punti, max }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24 }}>
      {punti.map((p, i) => (
        <div
          key={i}
          title={`${p}pt`}
          style={{
            flex: 1,
            background: 'var(--accent-primary)',
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
  const appClassifica = useAppStore((s) => s.classifica);

  // Reactive selector — re-renders when leagues or currentLeagueId change
  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId) || null
  );

  // Derive classifica from currentLeague (standings or participants), fall back to appStore
  const classifica = currentLeague?.standings?.length > 0
    ? currentLeague.standings
    : currentLeague?.participants?.map((p, i) => ({
        id: p.id ?? i,
        nome: p.name || 'Squadra',
        punti: 0,
        vittorie: 0,
        pareggi: 0,
        sconfitte: 0,
        puntimedia: 0,
        ultimoTurno: 0,
        isUser: p.isUser ?? false,
        andamento: [],
      })) ?? appClassifica;

  const [modal, setModal] = useState(null);
  const [confronto, setConfronto] = useState(null);
  const [vista, setVista] = useState('lega'); // 'lega' | 'seriea'

  // Dati reali Serie A
  const serieAStandings = useSerieAStore((s) => s.standings);
  const serieAMatchday  = useSerieAStore((s) => s.currentMatchday);
  const loadingStandings = useSerieAStore((s) => s.loading.standings);
  const errorStandings   = useSerieAStore((s) => s.errors.standings);
  const fetchStandings   = useSerieAStore((s) => s.fetchStandings);

  useEffect(() => {
    if (vista === 'seriea') fetchStandings();
  }, [vista, fetchStandings]);

  // Se la lega è vuota, mostriamo solo il tab Serie A come default
  const legaVuota = classifica.length === 0;

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
    { label: 'Punti Totali', value: userRow?.punti ?? '—', color: 'var(--accent-primary)' },
    { label: 'V / P / S', value: `${userRow?.vittorie ?? 0} / ${userRow?.pareggi ?? 0} / ${userRow?.sconfitte ?? 0}`, color: 'var(--blue)' },
    { label: 'Media', value: userRow ? `${userRow.puntimedia?.toFixed(1)}pt` : '—', color: 'var(--green)' },
  ];

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { val: 'lega',   label: '🏆 La mia Lega' },
          { val: 'seriea', label: '⚽ Serie A Reale' },
        ].map((t) => (
          <button
            key={t.val}
            onClick={() => setVista(t.val)}
            style={{
              background: vista === t.val ? 'rgba(0,212,255,0.15)' : 'var(--bg-glass)',
              border: `1px solid ${vista === t.val ? 'rgba(0,212,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
              color: vista === t.val ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderRadius: 20, padding: '7px 20px',
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── VISTA SERIE A REALE ── */}
      {vista === 'seriea' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Classifica Serie A 2025/2026 · Giornata {serieAMatchday ?? '…'}
          </div>

          {loadingStandings && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              Caricamento classifica reale…
            </div>
          )}

          {errorStandings && (
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ color: 'var(--red)', marginBottom: 8 }}>
                {errorStandings.includes('non configurata')
                  ? '⚙️ Configura VITE_FOOTBALL_DATA_API_KEY nel file .env per vedere la classifica reale.'
                  : `Errore: ${errorStandings}`}
              </div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => fetchStandings(true)}>
                Riprova
              </button>
            </div>
          )}

          {serieAStandings && !loadingStandings && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>Pos</th>
                      <th>Squadra</th>
                      <th>G</th>
                      <th>V</th>
                      <th>P</th>
                      <th>S</th>
                      <th>GF</th>
                      <th>GS</th>
                      <th>DR</th>
                      <th>Pt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serieAStandings.map((team, i) => (
                      <tr key={team.id}>
                        <td>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: i < 4 ? 'var(--gold)' : i >= 17 ? 'var(--red)' : 'rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12,
                            color: i < 4 || i >= 17 ? '#000' : 'var(--text-muted)',
                          }}>
                            {team.position}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {team.crest && (
                              <img src={team.crest} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                            )}
                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{team.played}</td>
                        <td style={{ color: 'var(--green)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{team.won}</td>
                        <td style={{ color: 'var(--amber)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{team.drawn}</td>
                        <td style={{ color: 'var(--red)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{team.lost}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td style={{ color: team.goalDifference > 0 ? 'var(--green)' : team.goalDifference < 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                            {team.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 16px', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid rgba(0,212,255,0.08)' }}>
                🟡 Champions League · 🔴 Retrocessione · Dati: football-data.org
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VISTA LEGA FANTACALCIO ── */}
      {vista === 'lega' && (
      <div>
      {legaVuota ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">Classifica lega non disponibile</div>
          <div className="empty-state-desc">
            La classifica si aggiornerà dopo la prima giornata.<br />
            Nel frattempo, esplora la <strong>classifica Serie A reale</strong> qui sopra!
          </div>
        </div>
      ) : (
      <div>
      {/* KPI */}
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
                        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12,
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
                    <td style={{ color: 'var(--green)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                      {team.vittorie}
                    </td>
                    <td style={{ color: 'var(--amber)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                      {team.pareggi}
                    </td>
                    <td style={{ color: 'var(--red)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                      {team.sconfitte}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800,
                        fontSize: 16, color: 'var(--text-primary)',
                      }}>{team.punti}</span>
                    </td>
                    <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                      {team.puntimedia?.toFixed(1)}
                    </td>
                    <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--blue)' }}>
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
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20,
                    color: aWins ? 'var(--green)' : 'var(--text-secondary)',
                  }}>{row.a}</div>
                  <div style={{
                    textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{row.label}</div>
                  <div style={{
                    textAlign: 'left',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20,
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
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
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
                    fontFamily: 'Syne, sans-serif', letterSpacing: '0.08em',
                    textTransform: 'uppercase', marginBottom: 4,
                  }}>{s.label}</div>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: 22, color: s.color,
                  }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: 'Syne, sans-serif', fontSize: 12, color: 'var(--text-muted)',
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
      )}
      </div>
      )}
    </div>
  );
}
