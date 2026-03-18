import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { analizzaGiornata } from '../lib/claudeApi';

export default function Calendario() {
  const rosa = useAppStore((s) => s.rosa);
  const calendario = useAppStore((s) => s.calendario);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [filtro, setFiltro] = useState('tutte');
  const [giornataDettaglio, setGiornataDettaglio] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisultato, setAiRisultato] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);

  const giornate = calendario.filter((g) => {
    if (filtro === 'giocate') return g.giocata;
    if (filtro === 'future') return !g.giocata;
    return true;
  });

  async function analizzaProssima() {
    setAiLoading(true);
    setAiError(null);
    setAiRisultato(null);
    try {
      const partite = [{ mio: 'Serie A', avversario: 'Avversario giornata' }];
      const testo = await analizzaGiornata(titolari, partite, giornataCorrente, apiKey);
      setAiRisultato(testo);
    } catch {
      setAiError('Analisi non disponibile. Verifica la API key.');
    } finally {
      setAiLoading(false);
    }
  }

  const totaleGiocate = calendario.filter((g) => g.giocata).length;
  const puntiTot = calendario.filter((g) => g.giocata && g.puntiUser).reduce((s, g) => s + g.puntiUser, 0);

  if (calendario.length === 0) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Empty state principale */}
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">Calendario non disponibile</div>
          <div className="empty-state-desc">
            Le giornate compariranno man mano che la stagione avanza.
          </div>
        </div>

        {/* Sidebar destra anche con calendario vuoto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15,
              color: 'var(--text-primary)', marginBottom: 6,
            }}>
              🤖 Analisi Giornata {giornataCorrente}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Analisi AI dei tuoi titolari per la prossima giornata
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="input-field"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{ fontSize: 12, flex: 1 }}
                />
                <button
                  onClick={() => setShowApiKey((s) => !s)}
                  className="btn-secondary"
                  style={{ padding: '8px 10px', flexShrink: 0 }}
                >
                  {showApiKey ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              className="btn-ai"
              onClick={analizzaProssima}
              disabled={aiLoading || aiCrediti === 0}
              style={{ width: '100%' }}
            >
              {aiLoading ? '⏳ Analizzando...' : '📅 Analizza Giornata Corrente'}
            </button>

            {aiError && (
              <div style={{
                fontSize: 12, color: 'var(--red)', padding: '8px',
                background: 'rgba(248,113,113,0.08)', borderRadius: 6, marginTop: 10,
              }}>
                {aiError}
              </div>
            )}
            {aiRisultato && (
              <div className="ai-response" style={{ marginTop: 12, fontSize: 12 }}>
                {aiRisultato}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
      {/* Lista giornate */}
      <div>
        {/* Filtri + stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { val: 'tutte', label: 'Tutte' },
            { val: 'giocate', label: 'Giocate' },
            { val: 'future', label: 'Future' },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFiltro(f.val)}
              style={{
                background: filtro === f.val ? 'rgba(168,85,247,0.15)' : 'var(--bg-glass)',
                border: `1px solid ${filtro === f.val ? 'rgba(168,85,247,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: filtro === f.val ? 'var(--purple)' : 'var(--text-secondary)',
                borderRadius: 20, padding: '6px 18px',
                fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.15s',
                backdropFilter: 'blur(8px)',
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{totaleGiocate} giocate</span>
            {puntiTot > 0 && (
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--green)' }}>
                {puntiTot}pt totali
              </span>
            )}
          </div>
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {giornate.map((g) => {
            const isCorso = g.inCorso;
            const isGiocata = g.giocata;
            const parti = g.risultato ? g.risultato.split('-') : [];
            const vinta = parti.length === 2 && parseInt(parti[0]) > parseInt(parti[1]);
            const persa = parti.length === 2 && parseInt(parti[0]) < parseInt(parti[1]);
            const espanso = giornataDettaglio?.giornata === g.giornata;

            return (
              <div key={g.giornata}>
                <div
                  onClick={() => setGiornataDettaglio(espanso ? null : g)}
                  className="glass-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', padding: '12px 16px',
                    borderColor: isCorso ? 'rgba(245,200,66,0.35)' : undefined,
                    background: isCorso ? 'rgba(245,200,66,0.04)' : undefined,
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Numero giornata */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 8, flexShrink: 0,
                    background: isCorso ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.08)',
                    border: `1px solid ${isCorso ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 14,
                      color: isCorso ? 'var(--purple)' : 'var(--text-muted)',
                    }}>
                      G{g.giornata}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        vs {g.avversario || 'Da definire'}
                      </span>
                      {isCorso && <span className="badge badge-gold">IN CORSO</span>}
                      {!isGiocata && !isCorso && g.proiezionePunti && (
                        <span className="badge badge-blue">~{g.proiezionePunti}pt attesi</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.data}</div>
                  </div>

                  {/* Risultato */}
                  {isGiocata && g.risultato && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 20,
                        color: vinta ? 'var(--green)' : persa ? 'var(--red)' : 'var(--amber)',
                      }}>
                        {g.risultato}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: vinta ? 'var(--green)' : persa ? 'var(--red)' : 'var(--amber)',
                        fontFamily: 'Barlow Condensed', fontWeight: 600,
                      }}>
                        {vinta ? 'VITTORIA' : persa ? 'SCONFITTA' : 'PAREGGIO'}
                      </div>
                    </div>
                  )}

                  {!isGiocata && !isCorso && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Da giocare</div>
                    </div>
                  )}
                </div>

                {/* Dettaglio inline */}
                {espanso && (
                  <div className="glass-elevated" style={{
                    margin: '4px 0 0',
                    padding: '14px 20px',
                    borderRadius: 10,
                    borderTop: 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{
                        fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                      }}>
                        Giornata {g.giornata} — vs {g.avversario}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setGiornataDettaglio(null); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
                      >✕</button>
                    </div>
                    {isGiocata ? (
                      <div>
                        <div style={{
                          fontFamily: 'Barlow Condensed', fontWeight: 800,
                          fontSize: 28, color: 'var(--text-primary)', marginBottom: 8,
                        }}>
                          {g.risultato}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {g.puntiUser ? `Punti: ${g.puntiUser}pt` : 'Punteggio dettagliato non disponibile nel prototipo.'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Giornata non ancora disputata.
                        {g.proiezionePunti && (
                          <span> Proiezione: <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{g.proiezionePunti}pt</span></span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar AI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15,
            color: 'var(--text-primary)', marginBottom: 6,
          }}>
            🤖 Analisi Giornata {giornataCorrente}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Analisi AI dei tuoi titolari per la prossima giornata
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              className="input-field"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ fontSize: 12, flex: 1 }}
            />
            <button
              onClick={() => setShowApiKey((s) => !s)}
              className="btn-secondary"
              style={{ padding: '8px 10px', flexShrink: 0 }}
            >
              {showApiKey ? '🙈' : '👁'}
            </button>
          </div>

          <button
            className="btn-ai"
            onClick={analizzaProssima}
            disabled={aiLoading || aiCrediti === 0}
            style={{ width: '100%' }}
          >
            {aiLoading ? '⏳ Analizzando...' : '📅 Analizza Giornata'}
          </button>

          {aiError && (
            <div style={{
              fontSize: 12, color: 'var(--red)', padding: '8px',
              background: 'rgba(248,113,113,0.08)', borderRadius: 6, marginTop: 10,
            }}>
              {aiError}
            </div>
          )}
          {aiRisultato && (
            <div className="ai-response" style={{ marginTop: 12, fontSize: 12 }}>
              {aiRisultato}
            </div>
          )}
        </div>

        {/* Riepilogo stagione */}
        {totaleGiocate > 0 && (
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14,
              color: 'var(--text-primary)', marginBottom: 12,
            }}>
              📊 Riepilogo
            </div>
            {[
              { label: 'Giornate giocate', value: totaleGiocate },
              { label: 'Punti totali', value: `${puntiTot}pt` },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: '1px solid rgba(168,85,247,0.08)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 700,
                  fontSize: 14, color: 'var(--text-primary)',
                }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
