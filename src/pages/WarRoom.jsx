import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { warRoomAnalisi } from '../lib/claudeApi';
import ShareButton from '../components/warroom/ShareButton';

const LOADING_STEPS = [
  'Analizzando avversario...',
  'Valutando vantaggi...',
  'Generando piano tattico...',
];

export default function WarRoom() {
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const avversariLista = classifica.filter((t) => !t.isUser).map((t) => t.nome);

  const [avversario, setAvversario] = useState(avversariLista[0] || '');
  const [avversarioLibero, setAvversarioLibero] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [risultato, setRisultato] = useState(null);
  const [error, setError] = useState(null);

  const nomeAvversario = avversariLista.length > 0 ? avversario : avversarioLibero;

  async function lanciaAnalisi() {
    if (!nomeAvversario.trim()) return;
    setLoading(true);
    setError(null);
    setRisultato(null);
    setLoadingStep(0);

    try {
      setLoadingStep(0);
      const { analisiAvversario, vantaggi, pianoTattico } = await warRoomAnalisi(
        rosa,
        [],
        nomeAvversario,
        giornataCorrente,
      );
      setLoadingStep(2);
      setRisultato({ analisiAvversario, vantaggi, pianoTattico });
    } catch (err) {
      console.error('War Room AI error:', err);
      setError(`Analisi non disponibile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function salvaAnalisi() {
    if (risultato) {
      sessionStorage.setItem(
        `war-room-g${giornataCorrente}`,
        JSON.stringify({ avversario: nomeAvversario, risultato, timestamp: Date.now() }),
      );
    }
  }

  return (
    <div>
      <div className="y2k-page-header">
        <div>
          <div className="y2k-page-title" style={{ color: 'var(--y2k-war)' }}>War Room</div>
          <div className="y2k-page-sub">// ANALISI TATTICA AVVERSARIO</div>
        </div>
        <span className="y2k-panel-tag war">LIVE</span>
      </div>
      {/* Config card */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Dropdown avversario */}
          <div>
            <label style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
              display: 'block', marginBottom: 6, textTransform: 'uppercase',
            }}>
              Avversario · Giornata {giornataCorrente}
            </label>
            {avversariLista.length > 0 ? (
              <select
                className="input-field"
                value={avversario}
                onChange={(e) => { setAvversario(e.target.value); setRisultato(null); }}
              >
                {avversariLista.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            ) : (
              <input
                className="input-field"
                placeholder="Nome avversario (es. Juventino Power)"
                value={avversarioLibero}
                onChange={(e) => { setAvversarioLibero(e.target.value); setRisultato(null); }}
              />
            )}
            {avversariLista.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Aggiungi la classifica per selezionare l'avversario dalla lista
              </div>
            )}
          </div>

        </div>

        {/* Avviso rosa vuota */}
        {rosa.length === 0 && (
          <div style={{
            marginBottom: 14, padding: '10px 14px',
            background: 'rgba(126, 173, 212,0.08)',
            border: '1px solid rgba(126, 173, 212,0.2)',
            borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)',
          }}>
            ℹ️ Aggiungi giocatori per un'analisi personalizzata. Puoi comunque eseguire un'analisi generica.
          </div>
        )}

        {/* Avviso crediti */}
        {aiCrediti < 3 && (
          <div style={{
            marginBottom: 14, padding: '8px 12px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 6, fontSize: 12, color: 'var(--amber)',
          }}>
            ⚠️ Solo {aiCrediti} crediti AI rimasti! L'analisi War Room ne usa 3.
          </div>
        )}

        {/* Bottone grande centrato */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn-ai"
            onClick={lanciaAnalisi}
            disabled={loading || aiCrediti === 0 || !nomeAvversario.trim()}
            style={{
              padding: '14px 40px', fontSize: 16,
              letterSpacing: '0.06em', fontFamily: 'var(--font-display)',
              fontWeight: 700, minWidth: 240,
            }}
          >
            {loading ? '⏳ Analizzando...' : '⚔️ LANCIA ANALISI AI'}
          </button>
        </div>

        {/* Loading steps */}
        {loading && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LOADING_STEPS.map((step, i) => (
              <div
                key={step}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13,
                  color: i <= loadingStep ? 'var(--blue)' : 'var(--text-muted)',
                  opacity: i <= loadingStep ? 1 : 0.4,
                  transition: 'all 0.3s',
                }}
              >
                {i < loadingStep ? (
                  <span style={{ color: 'var(--green)' }}>✓</span>
                ) : i === loadingStep ? (
                  <div className="spinner" />
                ) : (
                  <span style={{ width: 14, display: 'inline-block' }} />
                )}
                {step}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 16,
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 10, color: 'var(--red)',
          fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Risultato AI */}
      {risultato && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 16,
          }}>
            <div className="section-title" style={{ fontSize: 18 }}>
              ⚔️ War Room — G{giornataCorrente} vs {nomeAvversario}
            </div>
            <button onClick={salvaAnalisi} className="btn-secondary" style={{ fontSize: 12 }}>
              💾 Salva
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              {
                titolo: '🔍 Analisi Avversario',
                contenuto: risultato.analisiAvversario,
                color: 'var(--blue)',
                bg: 'rgba(96,165,250,0.05)',
                border: 'rgba(96,165,250,0.2)',
              },
              {
                titolo: '⚡ Vantaggi e Rischi',
                contenuto: risultato.vantaggi,
                color: 'var(--green)',
                bg: 'rgba(74,222,128,0.05)',
                border: 'rgba(74,222,128,0.2)',
              },
              {
                titolo: '🗺️ Piano Tattico',
                contenuto: risultato.pianoTattico,
                color: 'var(--gold)',
                bg: 'rgba(245, 158, 11,0.05)',
                border: 'rgba(245, 158, 11,0.2)',
              },
            ].map((sezione) => (
              <div
                key={sezione.titolo}
                style={{
                  background: sezione.bg,
                  border: `1px solid ${sezione.border}`,
                  borderRadius: 12, padding: 16,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 15, color: sezione.color,
                  marginBottom: 12, letterSpacing: '0.03em',
                }}>
                  {sezione.titolo}
                </div>
                <div style={{
                  fontSize: 13, lineHeight: 1.7,
                  color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
                }}>
                  {sezione.contenuto}
                </div>
              </div>
            ))}
          </div>

          {/* Condividi analisi */}
          <ShareButton
            analysisText={[risultato.analisiAvversario, risultato.vantaggi, risultato.pianoTattico].join('\n\n---\n\n')}
            matchContext={{ avversario: nomeAvversario, giornata: giornataCorrente }}
          />
        </div>
      )}

      {/* Empty state */}
      {!risultato && !loading && !error && (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-state-icon" style={{ fontSize: 52 }}>⚔️</div>
          <div className="empty-state-title">War Room</div>
          <div className="empty-state-desc">
            Seleziona l'avversario della giornata e lancia l'analisi AI per ottenere
            punti di forza, rischi e piano tattico personalizzato.
          </div>
        </div>
      )}
    </div>
  );
}
