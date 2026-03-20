import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { RUOLI_MANTRA, SQUADRE_SERIE_A } from '../data/mockData';
import { reportScouting } from '../lib/claudeApi';

const FASCE = [
  { label: 'Tutti', val: '' },
  { label: '< 10M', val: 'bassa' },
  { label: '10–20M', val: 'media' },
  { label: '20–30M', val: 'alta' },
  { label: '> 30M', val: 'top' },
];

function estraiConsiglio(testo) {
  if (!testo) return 'FORSE';
  const upper = testo.toUpperCase();
  if (upper.includes('CONSIGLIO: SI') || upper.includes('CONSIGLIO ACQUISTO: SI') || upper.includes('ACQUISTO: SI')) return 'SI';
  if (upper.includes('CONSIGLIO: NO') || upper.includes('CONSIGLIO ACQUISTO: NO') || upper.includes('ACQUISTO: NO')) return 'NO';
  return 'FORSE';
}

function VotiPallini({ voti }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {(voti || []).map((v, i) => {
        let color = 'var(--text-muted)';
        if (v >= 7) color = 'var(--green)';
        else if (v >= 6) color = 'var(--amber)';
        else if (v > 0) color = 'var(--red)';
        return (
          <div
            key={i}
            title={v > 0 ? v.toString() : 'SV'}
            style={{ width: 9, height: 9, borderRadius: '50%', background: color }}
          />
        );
      })}
    </div>
  );
}

function GiocatoreCard({ g, onGeneraReport, reportStato, onSeleziona, isSelezionato }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: 16,
        opacity: g.infortunato ? 0.7 : 1,
        borderColor: isSelezionato ? 'rgba(96,165,250,0.5)' : undefined,
        background: isSelezionato ? 'rgba(96,165,250,0.05)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {g.nome} {g.cognome}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{g.squadra}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--amber)',
          }}>
            {g.quotazione}M
          </div>
          <span className="badge badge-muted" style={{ fontSize: 9 }}>{g.ruoloMantra}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em',
          }}>MEDIA</div>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20,
            color: g.votoMedia >= 7 ? 'var(--green)' : 'var(--amber)',
          }}>
            {g.votoMedia.toFixed(1)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em', marginBottom: 4,
          }}>ULTIMI 5</div>
          <VotiPallini voti={g.votiUltimi5} />
        </div>
      </div>

      {g.infortunato && (
        <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>🤕 Infortunato</div>
      )}
      {g.diffidato && (
        <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 8 }}>⚠️ In diffida</div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onGeneraReport(g)}
          className="btn-ai"
          style={{ flex: 1, fontSize: 12, padding: '6px' }}
          disabled={reportStato?.loading}
        >
          {reportStato?.loading ? '⏳...' : '🔍 Genera Report AI'}
        </button>
        <button
          onClick={() => onSeleziona(g)}
          className="btn-secondary"
          style={{
            fontSize: 12, padding: '6px 10px',
            borderColor: isSelezionato ? 'var(--blue)' : undefined,
            color: isSelezionato ? 'var(--blue)' : undefined,
          }}
        >
          {isSelezionato ? '✓ Sel.' : 'Confronta'}
        </button>
      </div>

      {reportStato?.error && (
        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 8 }}>{reportStato.error}</div>
      )}
      {reportStato?.testo && (
        <div className="ai-response" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{
              fontSize: 10, color: 'var(--text-muted)',
              fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em',
            }}>REPORT SCOUTING AI</span>
            {reportStato.consiglio && (
              <span className={`badge badge-${reportStato.consiglio === 'SI' ? 'green' : reportStato.consiglio === 'NO' ? 'red' : 'amber'}`}>
                ACQUISTA: {reportStato.consiglio}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-primary)' }}>
            {reportStato.testo}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Scouting() {
  const rosa = useAppStore((s) => s.rosa);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [cerca, setCerca] = useState('');
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroSquadra, setFiltroSquadra] = useState('Tutte');
  const [filtroFascia, setFiltroFascia] = useState('');
  const [report, setReport] = useState({});
  const [confronto, setConfronto] = useState([]);

  const filtrati = rosa.filter((g) => {
    if (filtroRuolo !== 'Tutti' && !g.ruoloMantra.includes(filtroRuolo)) return false;
    if (filtroSquadra !== 'Tutte' && g.squadra !== filtroSquadra) return false;
    if (filtroFascia === 'bassa' && g.quotazione >= 10) return false;
    if (filtroFascia === 'media' && (g.quotazione < 10 || g.quotazione > 20)) return false;
    if (filtroFascia === 'alta' && (g.quotazione <= 20 || g.quotazione > 30)) return false;
    if (filtroFascia === 'top' && g.quotazione <= 30) return false;
    if (cerca && !`${g.nome} ${g.cognome}`.toLowerCase().includes(cerca.toLowerCase())) return false;
    return true;
  });

  async function generaReport(g) {
    setReport((r) => ({ ...r, [g.id]: { loading: true, testo: null, error: null } }));
    try {
      const testo = await reportScouting(g);
      const consiglio = estraiConsiglio(testo);
      setReport((r) => ({ ...r, [g.id]: { loading: false, testo, consiglio, error: null } }));
    } catch {
      setReport((r) => ({
        ...r,
        [g.id]: { loading: false, testo: null, error: 'Report non disponibile. Riprova più tardi.' },
      }));
    }
  }

  function toggleConfronto(g) {
    setConfronto((prev) => {
      if (prev.find((p) => p.id === g.id)) return prev.filter((p) => p.id !== g.id);
      if (prev.length >= 2) return [prev[1], g];
      return [...prev, g];
    });
  }

  if (rosa.length === 0) {
    return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Rosa vuota</div>
        <div className="empty-state-desc">
          Aggiungi giocatori alla rosa per utilizzare lo scouting AI e generare report personalizzati.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search bar prominente */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <input
          className="input-field"
          placeholder="Cerca giocatore nella tua rosa..."
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          style={{ width: '100%', fontSize: 15, marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="input-field"
            value={filtroRuolo}
            onChange={(e) => setFiltroRuolo(e.target.value)}
            style={{ maxWidth: 140 }}
          >
            <option value="Tutti">Tutti i ruoli</option>
            {RUOLI_MANTRA.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="input-field"
            value={filtroSquadra}
            onChange={(e) => setFiltroSquadra(e.target.value)}
            style={{ maxWidth: 160 }}
          >
            <option value="Tutte">Tutte le squadre</option>
            {SQUADRE_SERIE_A.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="input-field"
            value={filtroFascia}
            onChange={(e) => setFiltroFascia(e.target.value)}
            style={{ maxWidth: 140 }}
          >
            {FASCE.map((f) => <option key={f.val} value={f.val}>{f.label}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtrati.length} giocatori · <span className={`badge ${aiCrediti < 3 ? 'badge-red' : 'badge-gold'}`}>{aiCrediti} crediti</span>
          </span>
        </div>
      </div>

      {/* Confronto 2 giocatori */}
      {confronto.length === 2 && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="section-title" style={{ fontSize: 15 }}>⚖️ Confronto Giocatori</span>
            <button
              onClick={() => setConfronto([])}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
            >✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                {confronto[0].cognome}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {confronto[0].squadra} · {confronto[0].ruoloMantra}
              </div>
            </div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: 18, color: 'var(--text-muted)',
            }}>VS</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                {confronto[1].cognome}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {confronto[1].squadra} · {confronto[1].ruoloMantra}
              </div>
            </div>
          </div>
          {[
            {
              label: 'Media voti',
              a: confronto[0].votoMedia.toFixed(1),
              b: confronto[1].votoMedia.toFixed(1),
            },
            {
              label: 'Quotazione',
              a: `${confronto[0].quotazione}M`,
              b: `${confronto[1].quotazione}M`,
            },
            { label: 'Ruolo', a: confronto[0].ruoloMantra, b: confronto[1].ruoloMantra },
          ].map((row) => {
            const aWins = parseFloat(row.a) > parseFloat(row.b);
            return (
              <div
                key={row.label}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                  gap: 16, alignItems: 'center',
                  marginTop: 10, padding: '6px 0',
                  borderTop: '1px solid rgba(0,212,255,0.1)',
                }}
              >
                <div style={{
                  textAlign: 'left',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16,
                  color: aWins ? 'var(--green)' : 'var(--text-secondary)',
                }}>{row.a}</div>
                <div style={{
                  textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
                }}>{row.label}</div>
                <div style={{
                  textAlign: 'right',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16,
                  color: !aWins ? 'var(--green)' : 'var(--text-secondary)',
                }}>{row.b}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid giocatori */}
      {filtrati.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtrati.map((g) => (
            <GiocatoreCard
              key={g.id}
              g={g}
              onGeneraReport={generaReport}
              reportStato={report[g.id]}
              onSeleziona={toggleConfronto}
              isSelezionato={confronto.some((c) => c.id === g.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Nessun giocatore trovato</div>
          <div className="empty-state-desc">Prova a modificare i filtri di ricerca.</div>
        </div>
      )}
    </div>
  );
}
