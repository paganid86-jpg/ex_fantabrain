import { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { chatClaude, buildSystemPrompt } from '../lib/claudeApi';

const PROMPT_RAPIDI = [
  { label: 'Chi schiero questa giornata?', icon: '🏟️' },
  { label: 'Analizza il mio prossimo avversario', icon: '🔍' },
  { label: 'Chi vale la pena acquistare?', icon: '💰' },
  { label: 'I miei giocatori più in forma', icon: '🔥' },
  { label: 'Infortuni e diffide da valutare', icon: '⚠️' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14,
      alignItems: 'flex-end',
      gap: 8,
    }}>
      {!isUser && (
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          flexShrink: 0,
          boxShadow: '0 0 12px rgba(168,85,247,0.4)',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '78%',
        background: isUser
          ? 'rgba(245,200,66,0.08)'
          : 'var(--bg-glass)',
        border: `1px solid ${isUser ? 'rgba(245,200,66,0.25)' : 'rgba(168,85,247,0.2)'}`,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 16px',
        fontSize: 13,
        color: 'var(--text-primary)',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        backdropFilter: 'blur(8px)',
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

  const systemPrompt = buildSystemPrompt(rosa, giornataCorrente, 'avversario');

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
    } catch {
      setError('Risposta non disponibile. Verifica la API key o riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, height: 'calc(100vh - 108px)' }}>

      {/* Colonna chat */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

        {/* Header chat */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--gold-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(245,200,66,0.03)',
        }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              🤖 Chat FantaBrain AI
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Giornata {giornataCorrente} · Contestualizzata sulla tua rosa
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge ${aiCrediti < 3 ? 'badge-red' : 'badge-gold'}`}>
              {aiCrediti} crediti
            </span>
            {messaggi.length > 0 && (
              <button
                onClick={() => resetConversazione(PAGE_ID)}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                Nuova chat
              </button>
            )}
          </div>
        </div>

        {/* Area messaggi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 10px' }}>
          {messaggi.length === 0 && (
            <div className="empty-state" style={{ paddingTop: 40, paddingBottom: 20 }}>
              <div className="empty-state-icon" style={{ fontSize: 44 }}>🤖</div>
              <div className="empty-state-title">Benvenuto su FantaBrain AI</div>
              <div className="empty-state-desc">
                Sono il tuo assistente per il Fantacalcio Mantra. Chiedimi tutto sulla tua rosa, sul prossimo avversario o sulle strategie di mercato.
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Usa i prompt rapidi qui sotto o scrivi la tua domanda
              </div>
            </div>
          )}

          {messaggi.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
              }}>🤖</div>
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: '18px 18px 18px 4px',
                padding: '12px 18px',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--purple)',
                    animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              fontSize: 12, color: 'var(--red)',
              padding: '10px 14px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8, marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Bottom bar: prompt rapidi + input */}
        <div className="glass-elevated" style={{ padding: '12px 16px', borderTop: '1px solid var(--gold-border)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {PROMPT_RAPIDI.map((p) => (
              <button
                key={p.label}
                onClick={() => invia(p.label)}
                disabled={loading || aiCrediti === 0}
                style={{
                  background: 'rgba(168,85,247,0.06)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Barlow',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--purple)';
                  e.currentTarget.style.color = 'var(--purple)';
                  e.currentTarget.style.background = 'rgba(168,85,247,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                }}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-field"
              placeholder="Fai una domanda sulla tua rosa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && invia()}
              disabled={loading || aiCrediti === 0}
              style={{ flex: 1 }}
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

      {/* Sidebar destra */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

        {/* API Key */}
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13,
            color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            🔑 Claude API Key
          </div>
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
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Prototipo client-side. In produzione la chiave va server-side.
          </div>
          {aiCrediti < 3 && (
            <div style={{
              marginTop: 10, padding: '7px 10px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 6, fontSize: 11, color: 'var(--amber)',
            }}>
              ⚠️ Solo {aiCrediti} crediti rimasti!
            </div>
          )}
        </div>

        {/* Rosa contestuale */}
        <div className="glass-card" style={{ padding: 16, flex: 1 }}>
          <div style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13,
            color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            📋 La Tua Rosa
          </div>

          {rosa.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Aggiungi giocatori alla rosa per contestualizzare l'AI con i tuoi dati.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {rosa.map((g) => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 0',
                  borderBottom: '1px solid rgba(168,85,247,0.08)',
                  opacity: g.infortunato ? 0.45 : 1,
                }}>
                  <span className="badge badge-muted" style={{ fontSize: 9, padding: '1px 5px', flexShrink: 0 }}>
                    {g.ruoloMantra}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 12, color: 'var(--text-primary)', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {g.cognome}
                  </span>
                  <span style={{
                    fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12,
                    color: g.votoMedia >= 7 ? 'var(--green)' : g.votoMedia >= 6 ? 'var(--text-secondary)' : 'var(--red)',
                  }}>
                    {g.votoMedia.toFixed(1)}
                  </span>
                  {g.infortunato && <span style={{ fontSize: 10 }}>🤕</span>}
                  {g.diffidato && !g.infortunato && <span style={{ fontSize: 10 }}>⚠️</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
