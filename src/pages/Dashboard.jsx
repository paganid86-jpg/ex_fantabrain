import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import KpiCard from '../components/ui/KpiCard';
import AlertItem from '../components/ui/AlertItem';
import RankItem from '../components/ui/RankItem';
import { statisticheStagione } from '../data/mockData';

/* ── Sub-componenti ──────────────────────────────────────── */

function BarChart({ data, height = 60 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          title={`G${i + 1}: ${v}pt`}
          style={{
            flex: 1,
            background: 'var(--purple)',
            borderRadius: '3px 3px 0 0',
            height: `${Math.max((v / max) * 100, 4)}%`,
            opacity: 0.6,
            transition: 'opacity 0.2s',
            cursor: 'default',
            minWidth: 4,
            boxShadow: '0 0 6px rgba(168,85,247,0.35)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; }}
        />
      ))}
    </div>
  );
}

function PitchSlot({ giocatore }) {
  if (!giocatore) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px dashed rgba(168,85,247,0.25)',
          background: 'rgba(168,85,247,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: 'rgba(168,85,247,0.35)',
        }}>+</div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed' }}>VUOTO</span>
      </div>
    );
  }

  const ruoloColors = {
    Por: '#f97316', DD: 'var(--blue)', DS: 'var(--blue)', DC: 'var(--blue)',
    'M/C': 'var(--green)', C: 'var(--green)', 'T/A': 'var(--purple)', PC: 'var(--red)',
  };
  const color = ruoloColors[giocatore.ruoloMantra] || 'var(--gold)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: `${color}18`,
        border: '2px solid var(--gold-border)',
        boxShadow: `0 0 12px ${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        backdropFilter: 'blur(6px)',
        transition: 'box-shadow 0.2s',
      }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 9, color }}>
          {giocatore.ruoloMantra}
        </span>
        {giocatore.infortunato && (
          <span style={{
            position: 'absolute', top: -3, right: -3, width: 14, height: 14,
            background: 'var(--red)', borderRadius: '50%',
            fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, border: '1px solid #07030f',
          }}>✕</span>
        )}
        {giocatore.diffidato && !giocatore.infortunato && (
          <span style={{
            position: 'absolute', top: -3, right: -3, width: 14, height: 14,
            background: 'var(--amber)', borderRadius: '50%',
            fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontWeight: 700, border: '1px solid #07030f',
          }}>!</span>
        )}
      </div>
      <span style={{
        fontSize: 10, fontFamily: 'Barlow Condensed', fontWeight: 600,
        color: 'var(--text-primary)', textAlign: 'center',
        maxWidth: 54, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {giocatore.cognome}
      </span>
    </div>
  );
}

/* ── Componente principale ───────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const titolariIds = useAppStore((s) => s.titolariIds);

  const userRow = classifica.find((c) => c.isUser);
  const posizione = classifica.findIndex((c) => c.isUser) + 1;

  const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);
  const portieri = titolari.filter((g) => g.ruoloMantra === 'Por');
  const difensori = titolari.filter((g) => ['DD', 'DS', 'DC'].some((r) => g.ruoloMantra.startsWith(r)));
  const centrocampisti = titolari.filter((g) => ['M/C', 'C', 'M'].some((r) => g.ruoloMantra.startsWith(r)));
  const attaccanti = titolari.filter((g) => ['T/A', 'PC', 'T', 'A', 'W'].some((r) => g.ruoloMantra.startsWith(r)));

  const infortunati = rosa.filter((g) => g.infortunato);
  const diffidati = rosa.filter((g) => g.diffidato && !g.infortunato);

  const alerts = [
    ...infortunati.map((g) => ({
      tipo: 'infortunio',
      giocatore: `${g.nome} ${g.cognome}`,
      messaggio: `${g.cognome} è infortunato e non disponibile per la giornata ${giornataCorrente}.`,
    })),
    ...diffidati.map((g) => ({
      tipo: 'diffida',
      giocatore: `${g.nome} ${g.cognome}`,
      messaggio: `${g.cognome} è in diffida: un'altra ammonizione lo squalificherà.`,
    })),
  ];

  const pitchRows = [
    portieri.slice(0, 1),
    difensori.slice(0, 4),
    centrocampisti.slice(0, 3),
    attaccanti.slice(0, 3),
  ];

  /* ── Empty state ─────────────────────────────────────── */
  if (rosa.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="empty-state">
          <div className="empty-state-icon">⚽</div>
          <div className="empty-state-title">Nessun giocatore in rosa</div>
          <div className="empty-state-desc">
            Vai su La Rosa per aggiungere i tuoi giocatori e iniziare a giocare.
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 24 }}
            onClick={() => navigate('/la-rosa')}
          >
            Vai alla Rosa
          </button>
        </div>
      </div>
    );
  }

  /* ── Layout principale ───────────────────────────────── */
  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard
          label="Posizione in Classifica"
          value={posizione > 0 ? `${posizione}° / ${classifica.length}` : '—'}
          sub={`${userRow?.punti ?? 0} punti totali`}
          color="var(--gold)"
        />
        <KpiCard
          label="Media Punti"
          value={userRow?.puntimedia != null ? userRow.puntimedia.toFixed(1) : '—'}
          sub="punti a giornata"
          color="var(--purple)"
        />
        <KpiCard
          label="Giornata Corrente"
          value={`G${giornataCorrente}`}
          sub={`Ultimo turno: ${userRow?.ultimoTurno ?? 0}pt`}
          color="var(--blue)"
        />
        <KpiCard
          label="Giocatori in Rosa"
          value={rosa.length}
          sub={`${titolariIds.length} titolari schierati`}
          color="var(--green)"
        />
      </div>

      {/* Grid: pitch + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 20 }}>
        {/* Pitch */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--gold-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span className="section-title" style={{ fontSize: 15 }}>Schieramento Attuale — 4-3-3</span>
            <span className="badge badge-gold">G{giornataCorrente}</span>
          </div>
          <div className="pitch" style={{
            margin: 16, minHeight: 280, padding: '20px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
          }}>
            {pitchRows.map((riga, ri) => (
              <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {(riga.length > 0 ? riga : [null]).map((g, i) => (
                  <PitchSlot key={i} giocatore={g} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="glass-card">
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 15 }}>Suggerimenti AI</div>
            <div className="section-subtitle">Giornata {giornataCorrente}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '✅', text: 'Schiera la tua punta: controlla la forma recente prima di decidere.', color: 'var(--green)' },
              { icon: '⚠️', text: 'Verifica i diffidati: un giallo li renderà squalificati.', color: 'var(--amber)' },
              { icon: '🔄', text: 'Considera i difensori con avversari deboli in attacco.', color: 'var(--blue)' },
              { icon: '🎯', text: 'Il centrocampista con media più alta va titolare.', color: 'var(--purple)' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-glass)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  borderLeft: `3px solid ${s.color}`,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ marginRight: 6 }}>{s.icon}</span>{s.text}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            background: 'rgba(245,200,66,0.06)',
            borderRadius: 8,
            border: '1px solid var(--gold-border)',
          }}>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', marginBottom: 4,
            }}>
              PUNTEGGIO ATTESO
            </div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28, color: 'var(--gold)' }}>
              {titolari.reduce((s, g) => s + (g?.votoMedia ?? 0), 0).toFixed(1)}pt
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>somma medie titolari</div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Mini classifica */}
        <div className="glass-card">
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title" style={{ fontSize: 15 }}>Classifica Lega</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>G{Math.max(giornataCorrente - 1, 1)}</span>
          </div>
          {classifica.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
              Classifica non ancora disponibile
            </div>
          ) : (
            classifica.map((team, i) => (
              <RankItem
                key={team.id}
                posizione={i + 1}
                nome={team.nome}
                punti={team.punti}
                isUser={team.isUser}
                ultimoTurno={team.ultimoTurno}
              />
            ))
          )}
        </div>

        {/* Alert feed + grafico */}
        <div className="glass-card">
          <div style={{ marginBottom: 12 }}>
            <span className="section-title" style={{ fontSize: 15 }}>Alert & Notifiche</span>
          </div>

          {alerts.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16 }}>
              Nessun alert attivo. Tutti i giocatori sono disponibili.
            </div>
          ) : (
            alerts.map((a, i) => (
              <AlertItem key={i} tipo={a.tipo} messaggio={a.messaggio} giocatore={a.giocatore} />
            ))
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', marginBottom: 8,
            }}>
              ANDAMENTO ULTIME GIORNATE
            </div>
            {statisticheStagione.andamentoPunti.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Nessun dato disponibile per il grafico.
              </div>
            ) : (
              <BarChart data={statisticheStagione.andamentoPunti.slice(-10)} height={50} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
