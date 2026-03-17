import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { tutteLeGiornate } from '../data/mockData';
import { analizzaGiornata } from '../lib/claudeApi';

export default function Calendario() {
  const rosa = useAppStore((s) => s.rosa);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [filtro, setFiltro] = useState('tutte');
  const [giornataDettaglio, setGiornataDettaglio] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisultato, setAiRisultato] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const giornate = tutteLeGiornate.filter((g) => {
    if (filtro === 'giocate') return g.giocata;
    if (filtro === 'future') return !g.giocata;
    return true;
  });

  const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);

  async function analizzaProssima() {
    setAiLoading(true);
    setAiError(null);
    setAiRisultato(null);
    try {
      const partite = [{ mio: 'Serie A', avversario: 'Juventino Power' }];
      const testo = await analizzaGiornata(titolari, partite, giornataCorrente, apiKey);
      setAiRisultato(testo);
    } catch {
      setAiError('Analisi non disponibile. Verifica la API key.');
    } finally {
      setAiLoading(false);
    }
  }

  const totaleGiocate = tutteLeGiornate.filter((g) => g.giocata).length;
  const puntiTot = tutteLeGiornate.filter((g) => g.giocata && g.puntiUser).reduce((s, g) => s + g.puntiUser, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
      {/* Lista giornate */}
      <div>
        {/* Filtri */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { val: 'tutte', label: 'Tutte' },
            { val: 'giocate', label: 'Giocate' },
            { val: 'future', label: 'Future' },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFiltro(f.val)}
              style={{
                background: filtro === f.val ? 'rgba(0,230,118,0.15)' : 'var(--bg-card)',
                border: `1px solid ${filtro === f.val ? 'rgba(0,230,118,0.4)' : 'var(--border)'}`,
                color: filtro === f.val ? 'var(--accent-green)' : 'var(--text-secondary)',
                borderRadius: 8, padding: '6px 16px',
                fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{totaleGiocate} giornate giocate</span>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--accent-green)' }}>{puntiTot}pt totali</span>
          </div>
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {giornate.map((g) => {
            const isCurrenta = g.inCorso;
            const isGiocata = g.giocata;
            const vinta = isGiocata && g.risultato && parseInt(g.risultato.split('-')[0]) > parseInt(g.risultato.split('-')[1]);
            const persa = isGiocata && g.risultato && parseInt(g.risultato.split('-')[0]) < parseInt(g.risultato.split('-')[1]);

            return (
              <div
                key={g.giornata}
                onClick={() => setGiornataDettaglio(giornataDettaglio?.giornata === g.giornata ? null : g)}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer', padding: '12px 16px',
                  borderColor: isCurrenta ? 'rgba(255,171,0,0.4)' : undefined,
                  background: isCurrenta ? 'rgba(255,171,0,0.05)' : undefined,
                }}
              >
                {/* Numero giornata */}
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: isCurrenta ? 'rgba(255,171,0,0.2)' : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 14, color: isCurrenta ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                    G{g.giornata}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>vs {g.avversario}</span>
                    {isCurrenta && <span className="badge badge-amber">IN CORSO</span>}
                    {!isGiocata && !isCurrenta && g.proiezionePunti && (
                      <span className="badge badge-blue">~{g.proiezionePunti}pt attesi</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.data}</div>
                </div>

                {/* Risultato */}
                {isGiocata && g.risultato && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 20, color: vinta ? 'var(--accent-green)' : persa ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                      {g.risultato}
                    </div>
                    <div style={{ fontSize: 10, color: vinta ? 'var(--accent-green)' : persa ? 'var(--accent-red)' : 'var(--accent-amber)', fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
                      {vinta ? 'VITTORIA' : persa ? 'SCONFITTA' : 'PAREGGIO'}
                    </div>
                  </div>
                )}

                {!isGiocata && !isCurrenta && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Da giocare</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dettaglio giornata */}
        {giornataDettaglio && (
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="section-title" style={{ fontSize: 15 }}>
                Giornata {giornataDettaglio.giornata} — vs {giornataDettaglio.avversario}
              </span>
              <button onClick={() => setGiornataDettaglio(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            {giornataDettaglio.giocata ? (
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 12 }}>
                  {giornataDettaglio.risultato}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Punteggio dettagliato per giocatore non disponibile nel prototipo.
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Giornata non ancora disputata. Proiezione punti: <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{giornataDettaglio.proiezionePunti}pt</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar AI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* AI analisi giornata */}
        <div className="card">
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
            🤖 Analisi Giornata {giornataCorrente}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Analisi AI dei tuoi titolari per la prossima giornata
          </div>

          <input
            type="password"
            className="input-field"
            placeholder="Claude API Key (sk-ant-...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ marginBottom: 10, fontSize: 12 }}
          />

          <button
            className="btn-ai"
            onClick={analizzaProssima}
            disabled={aiLoading || aiCrediti === 0}
            style={{ width: '100%' }}
          >
            {aiLoading ? '⏳ Analizzando...' : '📅 Analizza Prossima Giornata'}
          </button>

          {aiError && (
            <div style={{ fontSize: 12, color: 'var(--accent-red)', padding: '8px', background: 'rgba(255,23,68,0.08)', borderRadius: 6, marginTop: 10 }}>
              {aiError}
            </div>
          )}

          {aiRisultato && (
            <div className="ai-response" style={{ marginTop: 12, fontSize: 12 }}>
              {aiRisultato}
            </div>
          )}
        </div>

        {/* Statistiche stagione */}
        <div className="card">
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>
            📊 Riepilogo Stagione
          </div>
          {[
            { label: 'V / P / S', value: '16 / 6 / 5' },
            { label: 'Media punti', value: '16.5pt' },
            { label: 'Best giornata', value: '98pt (G12)' },
            { label: 'Worst giornata', value: '28pt (G7)' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
