import { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { chatClaude, buildSystemPrompt } from '../lib/claudeApi';

const PROMPT_RAPIDI = [
  { label: 'Chi schiero questa giornata?', icon: '🏟️' },
  { label: 'Analizza il mio prossimo avversario', icon: '🔍' },
  { label: 'Chi vale la pena acquistare al mercato?', icon: '💰' },
  { label: 'Dimmi i miei giocatori più in forma', icon: '🔥' },
  { label: 'Chi rischio di schierare? Infortuni e diffide', icon: '⚠️' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2979ff, #00e5ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '80%',
        background: isUser ? 'rgba(41,121,255,0.2)' : 'var(--bg-elevated)',
        border: `1px solid ${isUser ? 'rgba(41,121,255,0.3)' : 'var(--border)'}`,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px',
        fontSize: 13,
        color: 'var(--text-primary)',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIAnalisi() {
  const rosa = useAppStore((s) => s.rosa);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const aiConversazioni = useAppStore((s) => s.aiConversazioni);
  const aggiungiMessaggio = useAppStore((s) => s.aggiungiMessaggio);
  const resetConversazione = useAppStore((s) => s.resetConversazione);

  const PAGE_ID = 'ai-analisi';
  const messaggi = aiConversazioni[PAGE_ID] || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, loading]);

  const systemPrompt = buildSystemPrompt(rosa, giornataCorrente, 'Juventino Power');

  async function invia(testo) {
    const msg = testo || input.trim();
    if (!msg || loading) return;
    setInput('');
    setError(null);

    aggiungiMessaggio(PAGE_ID, { role: 'user', content: msg });

    const history = [...messaggi, { role: 'user', content: msg }];
    const claudeMessages = history.map((m) => ({ role: m.role, content: m.content }));

    setLoading(true);
    try {
      const risposta = await chatClaude({
        messages: claudeMessages,
        systemPrompt,
        maxTokens: 600,
        apiKey,
      });
      aggiungiMessaggio(PAGE_ID, { role: 'assistant', content: risposta });
    } catch (err) {
      setError('Risposta non disponibile. Verifica la API key o riprova.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="section-title" style={{ fontSize: 16 }}>🤖 Chat AI</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Giornata {giornataCorrente} · Avversario: Juventino Power</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge ${aiCrediti < 3 ? 'badge-red' : 'badge-blue'}`}>
              {aiCrediti} crediti
            </span>
            {messaggi.length > 0 && (
              <button onClick={() => resetConversazione(PAGE_ID)} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
                Nuova chat
              </button>
            )}
          </div>
        </div>

        {/* Messaggi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messaggi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
                Benvenuto su FantaBrain AI
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Sono il tuo assistente per il Fantacalcio Mantra. Chiedimi tutto sulla tua rosa, sul prossimo avversario, o sulle strategie di mercato.
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Usa i prompt rapidi qui sotto o scrivi la tua domanda
              </div>
            </div>
          )}

          {messaggi.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #2979ff, #00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: 'var(--accent-red)', padding: '10px 14px', background: 'rgba(255,23,68,0.08)', borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Prompt rapidi */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {PROMPT_RAPIDI.map((p) => (
              <button
                key={p.label}
                onClick={() => invia(p.label)}
                disabled={loading || aiCrediti === 0}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '5px 12px', fontSize: 11,
                  color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'Barlow', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-field"
              placeholder="Fai una domanda sulla tua rosa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && invia()}
              disabled={loading || aiCrediti === 0}
            />
            <button
              className="btn-primary"
              onClick={() => invia()}
              disabled={loading || !input.trim() || aiCrediti === 0}
              style={{ flexShrink: 0 }}
            >
              Invia
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: rosa + API key */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        {/* API Key */}
        <div className="card">
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 }}>
            🔑 Claude API Key
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              className="input-field"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ fontSize: 12 }}
            />
            <button onClick={() => setShowApiKey((s) => !s)} className="btn-secondary" style={{ padding: '8px 10px', flexShrink: 0 }}>
              {showApiKey ? '🙈' : '👁'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Prototipo client-side. In produzione la chiave va server-side.
          </div>
          {aiCrediti < 3 && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255,171,0,0.08)', borderRadius: 6, border: '1px solid rgba(255,171,0,0.2)', fontSize: 11, color: 'var(--accent-amber)' }}>
              ⚠️ Solo {aiCrediti} crediti rimasti!
            </div>
          )}
        </div>

        {/* Contesto rosa */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>
            📋 La Tua Rosa
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rosa.map((g) => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
                borderBottom: '1px solid rgba(30,45,69,0.4)',
                opacity: g.infortunato ? 0.5 : 1,
              }}>
                <span className="badge badge-muted" style={{ fontSize: 9, padding: '1px 5px' }}>{g.ruoloMantra}</span>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.cognome}
                </span>
                <span style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12,
                  color: g.votoMedia >= 7 ? 'var(--accent-green)' : g.votoMedia >= 6 ? 'var(--text-secondary)' : 'var(--accent-red)',
                }}>
                  {g.votoMedia.toFixed(1)}
                </span>
                {g.infortunato && <span style={{ fontSize: 10 }}>🤕</span>}
                {g.diffidato && !g.infortunato && <span style={{ fontSize: 10 }}>⚠️</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
