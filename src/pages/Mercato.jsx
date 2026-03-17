import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { svincolati } from '../data/mockData';
import { valutaOfferta } from '../lib/claudeApi';

const ruoliMantra = ['Tutti', 'Por', 'DD', 'DS', 'DC', 'M/C', 'C', 'T/A', 'PC'];

function TabOfferte() {
  const offerte = useAppStore((s) => s.offerte);
  const aggiornaOfferta = useAppStore((s) => s.aggiornaOfferta);
  const rosa = useAppStore((s) => s.rosa);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [aiStati, setAiStati] = useState({});
  const [apiKey, setApiKey] = useState('');

  async function valutaConAI(offerta) {
    setAiStati((s) => ({ ...s, [offerta.id]: { loading: true, testo: null, error: null } }));
    try {
      const testo = await valutaOfferta(offerta, rosa, apiKey);
      setAiStati((s) => ({ ...s, [offerta.id]: { loading: false, testo, error: null } }));
    } catch {
      setAiStati((s) => ({ ...s, [offerta.id]: { loading: false, testo: null, error: 'Analisi non disponibile. Verifica la API key.' } }));
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
          CLAUDE API KEY (per valutazioni AI)
        </label>
        <input type="password" className="input-field" placeholder="sk-ant-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ maxWidth: 320, fontSize: 12 }} />
      </div>

      {offerte.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nessuna offerta ricevuta</div>
      )}

      {offerte.map((offerta) => {
        const ai = aiStati[offerta.id] || {};
        const statoColors = { in_attesa: 'amber', accettata: 'green', rifiutata: 'red' };
        const color = statoColors[offerta.stato] || 'muted';

        return (
          <div key={offerta.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Offerta da <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{offerta.da}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scadenza: {offerta.scadenza}</div>
              </div>
              <span className={`badge badge-${color}`}>{offerta.stato.replace('_', ' ').toUpperCase()}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ background: 'rgba(255,23,68,0.08)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,23,68,0.2)' }}>
                <div style={{ fontSize: 10, color: 'var(--accent-red)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  CEDO
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{offerta.giocatoreRichiesto}</div>
              </div>
              <div style={{ fontSize: 20, color: 'var(--text-muted)' }}>⇄</div>
              <div style={{ background: 'rgba(0,230,118,0.08)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(0,230,118,0.2)' }}>
                <div style={{ fontSize: 10, color: 'var(--accent-green)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  RICEVO
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{offerta.giocatoreOfferto}</div>
                <div style={{ fontSize: 11, color: 'var(--accent-amber)' }}>{offerta.quotazioneOfferta}M</div>
              </div>
            </div>

            {offerta.stato === 'in_attesa' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: ai.testo || ai.loading || ai.error ? 10 : 0 }}>
                <button onClick={() => aggiornaOfferta(offerta.id, 'accettata')} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
                  ✓ Accetta
                </button>
                <button onClick={() => aggiornaOfferta(offerta.id, 'rifiutata')} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px', color: 'var(--accent-red)', borderColor: 'rgba(255,23,68,0.3)' }}>
                  ✕ Rifiuta
                </button>
                <button onClick={() => aggiornaOfferta(offerta.id, 'controproposta')} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
                  ↩ Controproposta
                </button>
                <button
                  onClick={() => valutaConAI(offerta)}
                  disabled={ai.loading || aiCrediti === 0}
                  className="btn-ai"
                  style={{ fontSize: 12, padding: '6px 14px', marginLeft: 'auto' }}
                >
                  {ai.loading ? '⏳...' : '🤖 Valuta AI'}
                </button>
              </div>
            )}

            {ai.error && <div style={{ fontSize: 12, color: 'var(--accent-red)', padding: '8px', background: 'rgba(255,23,68,0.08)', borderRadius: 6 }}>{ai.error}</div>}
            {ai.testo && <div className="ai-response" style={{ fontSize: 12 }}>{ai.testo}</div>}
          </div>
        );
      })}
    </div>
  );
}

function TabScouting() {
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroQuota, setFiltroQuota] = useState('');
  const [cerca, setCerca] = useState('');

  const filtrati = svincolati.filter((g) => {
    if (filtroRuolo !== 'Tutti' && !g.ruoloMantra.includes(filtroRuolo)) return false;
    if (filtroQuota === 'bassa' && g.quotazione >= 10) return false;
    if (filtroQuota === 'media' && (g.quotazione < 10 || g.quotazione > 20)) return false;
    if (filtroQuota === 'alta' && g.quotazione <= 20) return false;
    if (cerca && !`${g.nome} ${g.cognome}`.toLowerCase().includes(cerca.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input-field" placeholder="Cerca giocatore..." value={cerca} onChange={(e) => setCerca(e.target.value)} style={{ maxWidth: 200 }} />
        <select className="input-field" value={filtroRuolo} onChange={(e) => setFiltroRuolo(e.target.value)} style={{ maxWidth: 120 }}>
          {ruoliMantra.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input-field" value={filtroQuota} onChange={(e) => setFiltroQuota(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">Tutti i prezzi</option>
          <option value="bassa">&lt; 10M</option>
          <option value="media">10–20M</option>
          <option value="alta">&gt; 20M</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtrati.map((g) => {
          const scoreAI = Math.round((g.votoMedia * 10 + (g.infortunato ? -20 : 0)) * 0.9);
          return (
            <div key={g.id} className="card" style={{ opacity: g.infortunato ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{g.nome} {g.cognome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.squadra}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--accent-amber)' }}>{g.quotazione}M</div>
                  <span className="badge badge-muted" style={{ fontSize: 9 }}>{g.ruoloMantra}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em' }}>MEDIA</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 18, color: g.votoMedia >= 7 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{g.votoMedia.toFixed(1)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', marginBottom: 4 }}>ULTIMI 5</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {g.votiUltimi5.map((v, i) => {
                      let color = 'var(--text-muted)';
                      if (v >= 7) color = 'var(--accent-green)';
                      else if (v >= 6) color = 'var(--accent-amber)';
                      else if (v > 0) color = 'var(--accent-red)';
                      return <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />;
                    })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em' }}>SCORE AI</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--accent-blue)' }}>{scoreAI}</div>
                </div>
              </div>
              {g.infortunato && <div style={{ fontSize: 11, color: 'var(--accent-red)', marginBottom: 6 }}>🤕 Infortunato</div>}
              {g.diffidato && <div style={{ fontSize: 11, color: 'var(--accent-amber)', marginBottom: 6 }}>⚠️ In diffida</div>}
              <button className="btn-secondary" style={{ width: '100%', fontSize: 12, padding: '6px' }}>
                + Fai un'offerta
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabTrattative() {
  const trattative = useAppStore((s) => s.trattative);
  const statoColors = { in_attesa: 'amber', accettata: 'green', rifiutata: 'red' };

  return (
    <div>
      {trattative.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nessuna trattativa in corso</div>
      )}
      {trattative.map((t) => (
        <div key={t.id} className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t.mioGiocatore} → {t.giocatoreVoluto}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Con: <span style={{ color: 'var(--accent-blue)' }}>{t.avversario}</span></div>
          </div>
          <span className={`badge badge-${statoColors[t.stato] || 'muted'}`}>{t.stato.replace('_', ' ').toUpperCase()}</span>
        </div>
      ))}
      <button className="btn-secondary" style={{ marginTop: 8 }}>+ Nuova Trattativa</button>
    </div>
  );
}

export default function Mercato() {
  const [tab, setTab] = useState('offerte');

  return (
    <div>
      <div className="tab-bar">
        {[
          { id: 'offerte', label: 'Offerte Ricevute' },
          { id: 'scouting', label: 'Scouting Acquisti' },
          { id: 'trattative', label: 'Trattative' },
        ].map((t) => (
          <div key={t.id} className={`tab-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'offerte' && <TabOfferte />}
      {tab === 'scouting' && <TabScouting />}
      {tab === 'trattative' && <TabTrattative />}
    </div>
  );
}
