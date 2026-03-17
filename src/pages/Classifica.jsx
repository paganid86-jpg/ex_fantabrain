import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { statisticheStagione } from '../data/mockData';

function MiniBarChart({ punti, max }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24 }}>
      {punti.map((p, i) => (
        <div
          key={i}
          title={`${p}pt`}
          style={{
            flex: 1, background: 'var(--accent-blue)', opacity: 0.6,
            borderRadius: '1px 1px 0 0',
            height: `${Math.max((p / max) * 100, 8)}%`,
            minWidth: 3, minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

const andamentoSquadre = {
  'Marco R. FantaTeam': [67, 58, 72, 55, 58],
  'Scudetto Dreams FC': [71, 63, 65, 60, 62],
  'Tiki Taka Masters': [55, 70, 62, 58, 71],
  'Nerazzurri United': [60, 52, 65, 58, 55],
  'Juventino Power': [50, 58, 48, 62, 48],
  'Calcio Fantastico': [58, 45, 60, 52, 52],
  'Azzurri Attack': [48, 55, 50, 45, 44],
  'Goleadores FC': [42, 48, 38, 50, 39],
};

export default function Classifica() {
  const classifica = useAppStore((s) => s.classifica);
  const [modal, setModal] = useState(null);
  const [confronto, setConfronto] = useState(null);

  const maxPunti = Math.max(...Object.values(andamentoSquadre).flat());
  const userRow = classifica.find((c) => c.isUser);

  return (
    <div>
      {/* KPI */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Posizione', value: `${classifica.findIndex((c) => c.isUser) + 1}°`, color: 'var(--accent-green)' },
          { label: 'Punti Totali', value: userRow?.punti, color: 'var(--accent-blue)' },
          { label: 'V / P / S', value: `${userRow?.vittorie} / ${userRow?.pareggi} / ${userRow?.sconfitte}`, color: 'var(--text-primary)' },
          { label: 'Media', value: userRow?.puntimedia?.toFixed(1) + 'pt', color: 'var(--accent-amber)' },
        ].map((k) => (
          <div key={k.label} className="card" style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 26, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabella */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>Pos</th>
                <th>Squadra</th>
                <th>V</th>
                <th>P</th>
                <th>S</th>
                <th>Tot Punti</th>
                <th>Media</th>
                <th>Ultimo</th>
                <th>Forma</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {classifica.map((team, i) => {
                const andamento = andamentoSquadre[team.nome] || [50, 50, 50, 50, 50];
                return (
                  <tr key={team.id} className={team.isUser ? 'highlight' : ''}>
                    <td>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: i < 3 ? 'var(--accent-amber)' : 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 12,
                        color: i < 3 ? '#000' : 'var(--text-muted)',
                      }}>{i + 1}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: team.isUser ? 'var(--accent-green)' : 'var(--text-primary)', fontSize: 13 }}>
                        {team.nome}
                        {team.isUser && <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.6 }}>TU</span>}
                      </span>
                    </td>
                    <td style={{ color: 'var(--accent-green)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{team.vittorie}</td>
                    <td style={{ color: 'var(--accent-amber)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{team.pareggi}</td>
                    <td style={{ color: 'var(--accent-red)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{team.sconfitte}</td>
                    <td>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{team.punti}</span>
                    </td>
                    <td style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{team.puntimedia.toFixed(1)}</td>
                    <td style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--accent-blue)' }}>{team.ultimoTurno}</td>
                    <td style={{ width: 80 }}>
                      <MiniBarChart punti={andamento} max={maxPunti} />
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
                            style={{ fontSize: 11, padding: '3px 8px', borderColor: confronto?.id === team.id ? 'var(--accent-blue)' : 'var(--border)', color: confronto?.id === team.id ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
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
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              Head to Head: {userRow?.nome} vs {confronto.nome}
            </div>
            <button onClick={() => setConfronto(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            {[
              { label: 'Punti Totali', a: userRow?.punti, b: confronto.punti },
              { label: 'Media', a: userRow?.puntimedia?.toFixed(1), b: confronto.puntimedia.toFixed(1) },
              { label: 'Vittorie', a: userRow?.vittorie, b: confronto.vittorie },
              { label: 'Ultimo Turno', a: userRow?.ultimoTurno, b: confronto.ultimoTurno },
            ].map((row) => {
              const aWins = parseFloat(row.a) > parseFloat(row.b);
              return (
                <div key={row.label} style={{ display: 'contents' }}>
                  <div style={{ textAlign: 'right', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: aWins ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{row.a}</div>
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{row.label}</div>
                  <div style={{ textAlign: 'left', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: !aWins ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{row.b}</div>
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
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>{modal.nome}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dettaglio stagione</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Punti', value: modal.punti, color: 'var(--accent-green)' },
                { label: 'Vittorie', value: modal.vittorie, color: 'var(--accent-green)' },
                { label: 'Pareggi', value: modal.pareggi, color: 'var(--accent-amber)' },
                { label: 'Sconfitte', value: modal.sconfitte, color: 'var(--accent-red)' },
                { label: 'Media', value: modal.puntimedia.toFixed(1), color: 'var(--accent-blue)' },
                { label: 'Ultimo', value: modal.ultimoTurno, color: 'var(--text-primary)' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Forma ultimi 5 turni
            </div>
            <div style={{ height: 60 }}>
              <MiniBarChart punti={andamentoSquadre[modal.nome] || [50, 50, 50, 50, 50]} max={maxPunti} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
