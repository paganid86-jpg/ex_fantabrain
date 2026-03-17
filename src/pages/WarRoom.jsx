import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { rosaAvversaria, classificaLega } from '../data/mockData';
import { warRoomAnalisi } from '../lib/claudeApi';

const AVVERSARI = classificaLega.filter((t) => !t.isUser).map((t) => t.nome);

export default function WarRoom() {
  const rosa = useAppStore((s) => s.rosa);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [avversario, setAvversario] = useState('Juventino Power');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [risultato, setRisultato] = useState(null);
  const [error, setError] = useState(null);

  const rosaAvv = rosaAvversaria[avversario] || rosaAvversaria['Juventino Power'] || [];

  async function lanciaAnalisi() {
    setLoading(true);
    setError(null);
    setRisultato(null);

    try {
      setLoadingStep('Analizzando la rosa avversaria...');
      const { analisiAvversario, vantaggi, pianoTattico } = await warRoomAnalisi(rosa, rosaAvv, avversario, giornataCorrente, apiKey);

      setRisultato({ analisiAvversario, vantaggi, pianoTattico });
    } catch {
      setError('Analisi non disponibile al momento. Verifica la API key e i crediti AI.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  function salvaAnalisi() {
    if (risultato) {
      sessionStorage.setItem(`war-room-g${giornataCorrente}`, JSON.stringify({ avversario, risultato, timestamp: Date.now() }));
      alert('Analisi salvata!');
    }
  }

  return (
    <div>
      {/* Header configurazione */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              AVVERSARIO GIORNATA {giornataCorrente}
            </label>
            <select className="input-field" value={avversario} onChange={(e) => { setAvversario(e.target.value); setRisultato(null); }}>
              {AVVERSARI.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              CLAUDE API KEY
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                className="input-field"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button onClick={() => setShowApiKey((s) => !s)} className="btn-secondary" style={{ padding: '8px 10px', flexShrink: 0 }}>
                {showApiKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button
            className="btn-ai"
            onClick={lanciaAnalisi}
            disabled={loading || aiCrediti === 0}
            style={{ padding: '12px 24px', fontSize: 16, letterSpacing: '0.05em', alignSelf: 'end', whiteSpace: 'nowrap' }}
          >
            {loading ? '⏳ Analizzando...' : '⚔️ LANCIA ANALISI AI'}
          </button>
        </div>

        {aiCrediti < 3 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,171,0,0.08)', borderRadius: 6, border: '1px solid rgba(255,171,0,0.2)', fontSize: 12, color: 'var(--accent-amber)' }}>
            ⚠️ Attenzione: solo {aiCrediti} crediti AI rimasti! L'analisi War Room ne usa 3.
          </div>
        )}

        {loading && loadingStep && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--accent-blue)' }}>
            <div className="spinner" />
            {loadingStep}
          </div>
        )}
      </div>

      {/* Rosa avversaria */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>
            🛡️ Rosa Avversaria — {avversario}
          </div>
          {rosaAvv.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {rosaAvv.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                  <span className="badge badge-muted" style={{ fontSize: 9, width: 36, textAlign: 'center', flexShrink: 0 }}>{g.ruoloMantra}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{g.nome}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.squadra}</span>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: g.votoMedia >= 7 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                    {g.votoMedia.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
              Rosa non disponibile per questo avversario nel prototipo.
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>
            📊 La Mia Rosa (Titolari)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rosa.filter((g) => !g.infortunato).slice(0, 11).map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                <span className="badge badge-muted" style={{ fontSize: 9, width: 36, textAlign: 'center', flexShrink: 0 }}>{g.ruoloMantra}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{g.cognome}</span>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: g.votoMedia >= 7 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  {g.votoMedia.toFixed(1)}
                </span>
                {g.diffidato && <span style={{ fontSize: 10 }}>⚠️</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risultato AI */}
      {error && (
        <div style={{ padding: '16px', background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.2)', borderRadius: 10, color: 'var(--accent-red)', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {risultato && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 18 }}>
              ⚔️ War Room Analysis — G{giornataCorrente} vs {avversario}
            </div>
            <button onClick={salvaAnalisi} className="btn-secondary" style={{ fontSize: 13 }}>
              💾 Salva Analisi
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              {
                titolo: '🔍 Analisi Avversario',
                contenuto: risultato.analisiAvversario,
                color: 'var(--accent-blue)',
                bg: 'rgba(41,121,255,0.05)',
                border: 'rgba(41,121,255,0.2)',
              },
              {
                titolo: '⚡ Vantaggi e Rischi',
                contenuto: risultato.vantaggi,
                color: 'var(--accent-green)',
                bg: 'rgba(0,230,118,0.05)',
                border: 'rgba(0,230,118,0.2)',
              },
              {
                titolo: '🗺️ Piano Tattico',
                contenuto: risultato.pianoTattico,
                color: 'var(--accent-amber)',
                bg: 'rgba(255,171,0,0.05)',
                border: 'rgba(255,171,0,0.2)',
              },
            ].map((sezione) => (
              <div
                key={sezione.titolo}
                style={{
                  background: sezione.bg,
                  border: `1px solid ${sezione.border}`,
                  borderRadius: 12, padding: 16,
                }}
              >
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: sezione.color, marginBottom: 12, letterSpacing: '0.03em' }}>
                  {sezione.titolo}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {sezione.contenuto}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!risultato && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>
            War Room
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            Seleziona l'avversario della giornata e lancia l'analisi AI per ottenere una tattica personalizzata: punti di forza, rischi e piano tattico.
          </div>
        </div>
      )}
    </div>
  );
}
