import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { RUOLI_MANTRA } from '../data/mockData';
import { valutaOfferta } from '../lib/claudeApi';

const TABS = [
  { id: 'offerte', label: 'Offerte' },
  { id: 'scouting', label: 'Svincolati' },
  { id: 'trattative', label: 'Trattative' },
];

function EmptyPanel({ kicker, title, children }) {
  return (
    <section className="ops-empty market-empty">
      <span className="lux-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}

function statusLabel(status = '') {
  return status.replace('_', ' ').toUpperCase();
}

function statusTone(status) {
  if (status === 'accettata') return 'green';
  if (status === 'rifiutata') return 'red';
  if (status === 'aperta') return 'blue';
  return 'amber';
}

function TabOfferte() {
  const offerte = useAppStore((s) => s.offerte);
  const aggiornaOfferta = useAppStore((s) => s.aggiornaOfferta);
  const rosa = useAppStore((s) => s.rosa);
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const [aiStati, setAiStati] = useState({});

  async function valutaConAI(offerta) {
    setAiStati((state) => ({ ...state, [offerta.id]: { loading: true, testo: null, error: null } }));
    try {
      const testo = await valutaOfferta(offerta, rosa);
      setAiStati((state) => ({ ...state, [offerta.id]: { loading: false, testo, error: null } }));
    } catch {
      setAiStati((state) => ({
        ...state,
        [offerta.id]: { loading: false, testo: null, error: 'Analisi non disponibile. Riprova più tardi.' },
      }));
    }
  }

  if (offerte.length === 0) {
    return (
      <EmptyPanel kicker="Inbox scambi" title="Nessuna offerta ricevuta.">
        Quando altri allenatori proporranno scambi, li vedrai qui con valutazione AI e azioni rapide.
      </EmptyPanel>
    );
  }

  return (
    <section className="market-card-list">
      {offerte.map((offerta) => {
        const ai = aiStati[offerta.id] || {};
        return (
          <article key={offerta.id} className="ops-panel market-offer-card">
            <header className="market-card-header">
              <div>
                <span className="lux-kicker">Offerta da {offerta.da}</span>
                {offerta.scadenza && <p>Scadenza: {offerta.scadenza}</p>}
              </div>
              <span className={`ops-badge ops-badge--${statusTone(offerta.stato)}`}>
                {statusLabel(offerta.stato)}
              </span>
            </header>

            <div className="market-trade-flow" aria-label="Dettaglio scambio">
              <div className="market-trade-box is-out">
                <span>Cedo</span>
                <strong>{offerta.giocatoreRichiesto}</strong>
              </div>
              <div className="market-trade-swap" aria-hidden="true">VS</div>
              <div className="market-trade-box is-in">
                <span>Ricevo</span>
                <strong>{offerta.giocatoreOfferto}</strong>
                {offerta.quotazioneOfferta && <small>{offerta.quotazioneOfferta}M</small>}
              </div>
            </div>

            {offerta.stato === 'in_attesa' && (
              <div className="market-actions">
                <button type="button" onClick={() => aggiornaOfferta(offerta.id, 'accettata')} className="btn-primary">
                  Accetta
                </button>
                <button type="button" onClick={() => aggiornaOfferta(offerta.id, 'rifiutata')} className="btn-danger">
                  Rifiuta
                </button>
                <button
                  type="button"
                  onClick={() => valutaConAI(offerta)}
                  disabled={ai.loading || aiCrediti === 0}
                  className="home-lux-hero__cta market-ai-btn"
                >
                  {ai.loading ? 'Valuto...' : 'Valuta AI'}
                </button>
              </div>
            )}

            {ai.error && <div className="ops-error">{ai.error}</div>}
            {ai.testo && <div className="ai-response market-ai-response">{ai.testo}</div>}
          </article>
        );
      })}
    </section>
  );
}

function TabScouting() {
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroQuota, setFiltroQuota] = useState('');
  const [cerca, setCerca] = useState('');

  return (
    <section className="ops-panel market-filter-panel">
      <div className="market-filter-grid">
        <input
          className="input-field"
          placeholder="Cerca giocatore..."
          value={cerca}
          onChange={(event) => setCerca(event.target.value)}
        />
        <select className="input-field" value={filtroRuolo} onChange={(event) => setFiltroRuolo(event.target.value)}>
          <option value="Tutti">Tutti i ruoli</option>
          {RUOLI_MANTRA.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <select className="input-field" value={filtroQuota} onChange={(event) => setFiltroQuota(event.target.value)}>
          <option value="">Tutti i prezzi</option>
          <option value="bassa">&lt; 10M</option>
          <option value="media">10-20M</option>
          <option value="alta">&gt; 20M</option>
        </select>
      </div>

      <EmptyPanel kicker="Mercato libero" title="Svincolati non ancora attivi.">
        In questa versione il mercato libero è vuoto. La ricerca completa sui giocatori Serie A vive nella sezione Scouting.
      </EmptyPanel>
    </section>
  );
}

function TabTrattative() {
  const trattative = useAppStore((s) => s.trattative);

  if (trattative.length === 0) {
    return (
      <EmptyPanel kicker="Pipeline scambi" title="Nessuna trattativa avviata.">
        Le trattative aperte con altri allenatori appariranno qui con stato e contesto.
      </EmptyPanel>
    );
  }

  return (
    <section className="market-card-list">
      {trattative.map((trattativa) => (
        <article key={trattativa.id} className="ops-panel market-negotiation-card">
          <div>
            <span className="lux-kicker">Con {trattativa.avversario}</span>
            <h2>{trattativa.mioGiocatore} <span>per</span> {trattativa.giocatoreVoluto}</h2>
          </div>
          <span className={`ops-badge ops-badge--${statusTone(trattativa.stato)}`}>
            {statusLabel(trattativa.stato)}
          </span>
        </article>
      ))}
    </section>
  );
}

export default function Mercato() {
  const [tab, setTab] = useState('offerte');
  const offerte = useAppStore((s) => s.offerte);
  const trattative = useAppStore((s) => s.trattative);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  return (
    <div className="ops-page market-page">
      <section className="ops-hero market-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Mercato</span>
          <h1>Trading desk.</h1>
          <p>
            Offerte, trattative e shortlist in una console rapida per decidere
            cosa accettare, rifiutare o far valutare all'AI.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="ops-stat-grid" aria-label="Sintesi mercato">
        <div className="ops-stat">
          <span>Offerte</span>
          <strong>{offerte.length}</strong>
          <small>ricevute</small>
        </div>
        <div className="ops-stat">
          <span>Trattative</span>
          <strong>{trattative.length}</strong>
          <small>in osservazione</small>
        </div>
        <div className="ops-stat">
          <span>Crediti AI</span>
          <strong>{aiCrediti}</strong>
          <small>per valutare</small>
        </div>
      </section>

      <nav className="ops-tabs" aria-label="Sezioni mercato">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ops-tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'offerte' && <TabOfferte />}
      {tab === 'scouting' && <TabScouting />}
      {tab === 'trattative' && <TabTrattative />}
    </div>
  );
}
