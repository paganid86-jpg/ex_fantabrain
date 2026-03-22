import useAppStore from '../store/useAppStore';
import KpiCard from '../components/ui/KpiCard';
import AlertItem from '../components/ui/AlertItem';
import RankItem from '../components/ui/RankItem';
import { statisticheStagione } from '../data/mockData';

function VotoDot({ voto }) {
  let color = 'var(--text-muted)';
  if (voto >= 7) color = 'var(--accent-green)';
  else if (voto >= 6) color = 'var(--accent-amber)';
  else if (voto > 0) color = 'var(--accent-red)';
  return (
    <span
      title={voto > 0 ? voto.toString() : 'SV'}
      style={{
        display: 'inline-block', width: 10, height: 10,
        borderRadius: '50%', background: color, marginRight: 3,
      }}
    />
  );
}

function BarChart({ data, height = 60 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          title={`G${i + 1}: ${v}pt`}
          style={{
            flex: 1, background: 'var(--accent-blue)',
            borderRadius: '2px 2px 0 0',
            height: `${Math.max((v / max) * 100, 4)}%`,
            opacity: 0.7, transition: 'opacity 0.2s', cursor: 'default',
            minWidth: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; }}
        />
      ))}
    </div>
  );
}

function PitchSlot({ giocatore, position }) {
  if (!giocatore) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px dashed var(--text-muted)', opacity: 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: 'var(--text-muted)',
        }}>+</div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed' }}>VUOTO</span>
      </div>
    );
  }

  const ruoloColors = {
    Por: '#ff9800', DD: '#2979ff', DS: '#2979ff', DC: '#2979ff',
    'M/C': '#00e676', C: '#00e676', 'T/A': '#e040fb', PC: '#ff1744',
  };
  const color = ruoloColors[giocatore.ruoloMantra] || '#7a92b0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: `${color}22`, border: `2px solid ${color}88`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 9, color }}>
          {giocatore.ruoloMantra}
        </span>
        {giocatore.infortunato && (
          <span style={{
            position: 'absolute', top: -3, right: -3, width: 12, height: 12,
            background: 'var(--accent-red)', borderRadius: '50%',
            fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
          }}>✕</span>
        )}
        {giocatore.diffidato && !giocatore.infortunato && (
          <span style={{
            position: 'absolute', top: -3, right: -3, width: 12, height: 12,
            background: 'var(--accent-amber)', borderRadius: '50%',
            fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontWeight: 700,
          }}>!</span>
        )}
      </div>
      <span style={{
        fontSize: 10, fontFamily: 'Barlow Condensed', fontWeight: 600,
        color: 'var(--text-primary)', textAlign: 'center',
        maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {giocatore.cognome}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const titolariIds = useAppStore((s) => s.titolariIds);

  const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);
  const userRow = classifica.find((c) => c.isUser);

  const portieri = titolari.filter((g) => g.ruoloMantra === 'Por');
  const difensori = titolari.filter((g) => ['DD', 'DS', 'DC', 'DD/DS'].some((r) => g.ruoloMantra.includes(r.split('/')[0]) && g.ruoloMantra.startsWith(r.split('/')[0])) && !['M/C', 'C', 'T/A', 'PC', 'T', 'A', 'W'].some((r) => g.ruoloMantra.includes(r)));
  const centrocampisti = titolari.filter((g) => ['M/C', 'C', 'M'].some((r) => g.ruoloMantra.startsWith(r)));
  const attaccanti = titolari.filter((g) => ['T/A', 'PC', 'T', 'A', 'W'].some((r) => g.ruoloMantra.startsWith(r)));

  const infortunati = rosa.filter((g) => g.infortunato);
  const diffidati = rosa.filter((g) => g.diffidato);

  const alerts = [
    ...infortunati.map((g) => ({ tipo: 'infortunio', giocatore: `${g.nome} ${g.cognome}`, messaggio: `${g.cognome} è infortunato e non disponibile per la giornata ${giornataCorrente}.` })),
    ...diffidati.filter((g) => !g.infortunato).map((g) => ({ tipo: 'diffida', giocatore: `${g.nome} ${g.cognome}`, messaggio: `${g.cognome} è in diffida: un'altra ammonizione lo squalificherà.` })),
    { tipo: 'forma', giocatore: 'Lautaro Martinez', messaggio: 'Lautaro in grande forma con 8 e 7.5 nelle ultime 2 giornate.' },
    { tipo: 'mercato', giocatore: null, messaggio: '3 offerte in attesa di risposta nel mercato.' },
  ];

  const rows = [
    portieri.slice(0, 1),
    difensori.slice(0, 4),
    centrocampisti.slice(0, 3),
    attaccanti.slice(0, 3),
  ];

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard
          label="Posizione in Classifica"
          value={`${classifica.findIndex((c) => c.isUser) + 1}° / ${classifica.length}`}
          sub={`${userRow?.punti} punti totali`}
          color="var(--accent-green)"
        />
        <KpiCard
          label="Media Punti"
          value={userRow?.puntimedia?.toFixed(1)}
          sub="punti a giornata"
          color="var(--accent-blue)"
        />
        <KpiCard
          label="Ultimo Turno"
          value={`${userRow?.ultimoTurno}pt`}
          sub={`Giornata ${giornataCorrente - 1}`}
          color="var(--accent-amber)"
        />
        <KpiCard
          label="Record Stagione"
          value={`${statisticheStagione.miglioreGiornata.punti}pt`}
          sub={`Giornata ${statisticheStagione.miglioreGiornata.giornata}`}
          color="var(--accent-red)"
        />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 20 }}>
        {/* Pitch */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title" style={{ fontSize: 15 }}>Schieramento Attuale — 4-3-3</span>
            <span className="badge badge-green">G{giornataCorrente}</span>
          </div>
          <div className="pitch" style={{ margin: 16, minHeight: 280, padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Campo verticale */}
            {rows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                {(row.length > 0 ? row : [null]).map((g, i) => (
                  <PitchSlot key={i} giocatore={g} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions panel */}
        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              🤖 Suggerimenti AI
            </div>
            <div className="section-subtitle">Giornata {giornataCorrente}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '✅', text: 'Schiera Lautaro: forma top, avversario debole in difesa', color: 'var(--accent-green)' },
              { icon: '⚠️', text: 'Attenzione: Barella in diffida, valuta alternativa', color: 'var(--accent-amber)' },
              { icon: '🔄', text: 'Sostituisci Theo Hernandez (infortunato) con Cambiaso', color: 'var(--accent-blue)' },
              { icon: '🎯', text: 'Lookman ha match ottimale vs difesa di Juventino Power', color: 'var(--accent-green)' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px',
                borderLeft: `3px solid ${s.color}`, fontSize: 12,
                color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <span style={{ marginRight: 6 }}>{s.icon}</span>
                {s.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(41,121,255,0.08)', borderRadius: 8, border: '1px solid rgba(41,121,255,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Barlow Condensed', letterSpacing: '0.06em' }}>
              PUNTEGGIO ATTESO
            </div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28, color: 'var(--accent-blue)' }}>
              64.2pt
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>media ultimi 5 voti × formazione</div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Mini classifica */}
        <div className="card">
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title" style={{ fontSize: 15 }}>Classifica Lega</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>G{giornataCorrente - 1}</span>
          </div>
          {classifica.map((team, i) => (
            <RankItem
              key={team.id}
              posizione={i + 1}
              nome={team.nome}
              punti={team.punti}
              isUser={team.isUser}
              ultimoTurno={team.ultimoTurno}
            />
          ))}
        </div>

        {/* Alert feed */}
        <div className="card">
          <div style={{ marginBottom: 12 }}>
            <span className="section-title" style={{ fontSize: 15 }}>Alert & Notifiche</span>
          </div>
          {alerts.map((a, i) => (
            <AlertItem key={i} tipo={a.tipo} messaggio={a.messaggio} giocatore={a.giocatore} />
          ))}

          {/* Grafico andamento */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', marginBottom: 8 }}>
              ANDAMENTO ULTIME 10 GIORNATE
            </div>
            <BarChart data={statisticheStagione.andamentoPunti.slice(-10)} height={50} />
          </div>
        </div>
      </div>
    </div>
  );
}
