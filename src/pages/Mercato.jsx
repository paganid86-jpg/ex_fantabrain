import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { RUOLI_MANTRA } from '../data/mockData';
import { valutaOfferta } from '../lib/claudeApi';

function TabOfferte() {
  const offerte = useAppStore((s) => s.offerte);
  const aggiornaOfferta = useAppStore((s) => s.aggiornaOfferta);
  const rosa = useAppStore((s) => s.rosa);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [aiStati, setAiStati] = useState({});

  async function valutaConAI(offerta) {
    setAiStati((s) => ({ ...s, [offerta.id]: { loading: true, testo: null, error: null } }));
    try {
      const testo = await valutaOfferta(offerta, rosa);
      setAiStati((s) => ({ ...s, [offerta.id]: { loading: false, testo, error: null } }));
    } catch {
      setAiStati((s) => ({
        ...s,
        [offerta.id]: { loading: false, testo: null, error: 'Analisi non disponibile. Riprova più tardi.' },
      }));
    }
  }

  return (
    <div>
      {offerte.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-title">Nessuna offerta ricevuta</div>
          <div className="empty-state-desc">
            Quando altri allenatori ti propongono scambi, le offerte appariranno qui.
          </div>
        </div>
      ) : (
        offerte.map((offerta) => {
          const ai = aiStati[offerta.id] || {};
          const statoColors = { in_attesa: 'amber', accettata: 'green', rifiutata: 'red' };
          const badgeColor = statoColors[offerta.stato] || 'muted';

          return (
            <div key={offerta.id} className="glass-card" style={{ marginBottom: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
                    Offerta da <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{offerta.da}</span>
                  </div>
                  {offerta.scadenza && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scadenza: {offerta.scadenza}</div>
                  )}
                </div>
                <span className={`badge badge-${badgeColor}`}>
                  {offerta.stato.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  background: 'rgba(248,113,113,0.08)', borderRadius: 8, padding: '10px 12px',
                  border: '1px solid rgba(248,113,113,0.2)',
                }}>
                  <div style={{
                    fontSize: 10, color: 'var(--red)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
                    textTransform: 'uppercase', marginBottom: 4,
                  }}>CEDO</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                    {offerta.giocatoreRichiesto}
                  </div>
                </div>
                <div style={{ fontSize: 22, color: 'var(--text-muted)' }}>⇄</div>
                <div style={{
                  background: 'rgba(74,222,128,0.08)', borderRadius: 8, padding: '10px 12px',
                  border: '1px solid rgba(74,222,128,0.2)',
                }}>
                  <div style={{
                    fontSize: 10, color: 'var(--green)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
                    textTransform: 'uppercase', marginBottom: 4,
                  }}>RICEVO</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                    {offerta.giocatoreOfferto}
                  </div>
                  {offerta.quotazioneOfferta && (
                    <div style={{ fontSize: 11, color: 'var(--amber)' }}>{offerta.quotazioneOfferta}M</div>
                  )}
                </div>
              </div>

              {offerta.stato === 'in_attesa' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: ai.testo || ai.loading || ai.error ? 10 : 0 }}>
                  <button
                    onClick={() => aggiornaOfferta(offerta.id, 'accettata')}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '6px 14px' }}
                  >
                    ✓ Accetta
                  </button>
                  <button
                    onClick={() => aggiornaOfferta(offerta.id, 'rifiutata')}
                    className="btn-danger"
                    style={{ fontSize: 12, padding: '6px 14px' }}
                  >
                    ✕ Rifiuta
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

              {ai.error && (
                <div style={{
                  fontSize: 12, color: 'var(--red)', padding: '8px',
                  background: 'rgba(248,113,113,0.08)', borderRadius: 6,
                }}>
                  {ai.error}
                </div>
              )}
              {ai.testo && (
                <div className="ai-response" style={{ fontSize: 12 }}>{ai.testo}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function TabScouting() {
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroQuota, setFiltroQuota] = useState('');
  const [cerca, setCerca] = useState('');

  return (
    <div>
      {/* Filtri */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="input-field"
          placeholder="Cerca giocatore..."
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <select
          className="input-field"
          value={filtroRuolo}
          onChange={(e) => setFiltroRuolo(e.target.value)}
          style={{ maxWidth: 130 }}
        >
          <option value="Tutti">Tutti i ruoli</option>
          {RUOLI_MANTRA.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          className="input-field"
          value={filtroQuota}
          onChange={(e) => setFiltroQuota(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          <option value="">Tutti i prezzi</option>
          <option value="bassa">&lt; 10M</option>
          <option value="media">10–20M</option>
          <option value="alta">&gt; 20M</option>
        </select>
      </div>

      <div className="empty-state" style={{ paddingTop: 60 }}>
        <div className="empty-state-icon">🔎</div>
        <div className="empty-state-title">Nessun giocatore disponibile nel mercato libero</div>
        <div className="empty-state-desc">
          In questa versione il mercato degli svincolati è vuoto. In futuro potrai cercare e acquistare
          giocatori liberi da tutte le squadre di Serie A.
        </div>
      </div>
    </div>
  );
}

function TabTrattative() {
  const trattative = useAppStore((s) => s.trattative);

  const statoColors = { in_attesa: 'amber', accettata: 'green', rifiutata: 'red', aperta: 'blue' };

  return (
    <div>
      {trattative.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-state-icon">🤝</div>
          <div className="empty-state-title">Nessuna trattativa avviata</div>
          <div className="empty-state-desc">
            Le trattative che avvii con altri allenatori appariranno qui per tenerti aggiornato sullo stato.
          </div>
        </div>
      ) : (
        <div>
          {trattative.map((t) => (
            <div key={t.id} className="glass-card" style={{ marginBottom: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: 14 }}>
                    {t.mioGiocatore}
                    <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                    {t.giocatoreVoluto}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Con: <span style={{ color: 'var(--blue)' }}>{t.avversario}</span>
                  </div>
                </div>
                <span className={`badge badge-${statoColors[t.stato] || 'muted'}`}>
                  {t.stato.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Mercato() {
  const [tab, setTab] = useState('offerte');

  const tabs = [
    { id: 'offerte', label: 'Offerte Ricevute' },
    { id: 'scouting', label: 'Scouting' },
    { id: 'trattative', label: 'Trattative' },
  ];

  return (
    <div>
      <div className="tab-bar">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`tab-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
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
