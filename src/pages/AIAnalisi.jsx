import { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
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
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), #06B6D4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
          boxShadow: '0 0 14px rgba(0,212,255,0.45)',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '78%',
        background: isUser
          ? 'rgba(245, 158, 11, 0.08)'
          : 'var(--bg-glass)',
        border: `1px solid ${isUser ? 'var(--gold-border)' : 'rgba(0,212,255,0.2)'}`,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 16px',
        fontSize: 13,
        color: 'var(--text-primary)',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        backdropFilter: 'blur(10px)',
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
  const resetAt = useAppStore((s) => s.resetAt);
  const userPlan = useAppStore((s) => s.user.plan);
  const isGold = userPlan === 'gold';
  const aiConversazioni = useAppStore((s) => s.aiConversazioni);
  const aggiungiMessaggio = useAppStore((s) => s.aggiungiMessaggio);
  const resetConversazione = useAppStore((s) => s.resetConversazione);

  // Contesto Serie A reale per arricchire il prompt AI
  const serieAStandings = useSerieAStore((s) => s.standings);
  const serieAMatchday  = useSerieAStore((s) => s.currentMatchday);
  const serieAScorers   = useSerieAStore((s) => s.scorers);
  const getNextMatches  = useSerieAStore((s) => s.getNextMatchdayMatches);

  const PAGE_ID = 'ai-analisi';
  const messaggi = aiConversazioni[PAGE_ID] || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, loading]);

  const serieAContext = (serieAStandings || serieAScorers.length > 0)
    ? {
        currentMatchday: serieAMatchday ?? giornataCorrente,
        standings: serieAStandings,
        scorers: serieAScorers,
        nextMatches: getNextMatches(),
      }
    : null;

  const systemPrompt = buildSystemPrompt(rosa, giornataCorrente, 'avversario', serieAContext);

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
      });
      aggiungiMessaggio(PAGE_ID, { role: 'assistant', content: risposta });
    } catch (err) {
      if (err.message === 'NO_CREDITS') {
        // Store already updated by chatClaude — UI re-renders with lock screen
        return;
      }
      setError('Risposta non disponibile. Riprova più tardi.');
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
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 212, 255, 0.03)',
        }}>
          <div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17,
              color: 'var(--text-primary)', letterSpacing: '0.02em',
            }}>
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

        {/* Credits header — only for non-Gold */}
        {!isGold && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#12121A', borderBottom: '1px solid #ffffff08' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < aiCrediti ? '#F59E0B' : '#ffffff20', border: i >= aiCrediti ? '1px solid #F59E0B44' : 'none' }} />
                ))}
              </div>
              <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 'bold' }}>{aiCrediti}/3 crediti</span>
            </div>
            {resetAt && (
              <span style={{ fontSize: '9px', color: '#475569' }}>
                🔄 Reset {new Date(resetAt).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })} 20:45
              </span>
            )}
          </div>
        )}
        {isGold && (
          <div style={{ padding: '6px 12px', background: 'linear-gradient(90deg, #1A1200, #12121A)', borderBottom: '1px solid #F59E0B22', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#000', fontSize: '8px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>✦ GOLD</span>
            <span style={{ fontSize: '10px', color: '#F59E0B44' }}>Accesso illimitato</span>
          </div>
        )}

        {/* Area messaggi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 10px' }}>
          {messaggi.length === 0 && (
            <div className="empty-state" style={{ paddingTop: 40, paddingBottom: 20 }}>
              <div className="empty-state-icon" style={{ fontSize: 48 }}>🤖</div>
              <div className="empty-state-title">Benvenuto su FantaBrain AI</div>
              <div className="empty-state-desc">
                Sono il tuo assistente per il Fantacalcio Mantra. Chiedimi tutto sulla tua rosa,
                sul prossimo avversario o sulle strategie di mercato.
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
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
                boxShadow: '0 0 14px rgba(0,212,255,0.45)',
              }}>🤖</div>
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 18px',
                display: 'flex', gap: 6, alignItems: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    animation: `dotPulse 1.2s ease-in-out ${idx * 0.2}s infinite`,
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

        {/* Bottom bar: prompt rapidi + input, or lock screen */}
        {aiCrediti === 0 && !isGold ? (
          /* Lock screen when credits are exhausted */
          <div className="glass-elevated" style={{ padding: '24px 16px', textAlign: 'center', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>Crediti AI esauriti</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {resetAt
                ? `Reset: ${new Date(resetAt).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle 20:45`
                : 'Reset automatico a fine giornata'}
            </div>
          </div>
        ) : (
          /* Normal input bar */
          <div className="glass-elevated" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {PROMPT_RAPIDI.map((p) => (
                <button
                  key={p.label}
                  onClick={() => invia(p.label)}
                  disabled={loading || aiCrediti === 0}
                  style={{
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'DM Sans, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(0,212,255,0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'rgba(0,212,255,0.06)';
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
        )}
      </div>

      {/* Sidebar destra */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

        {/* Rosa contestuale */}
        <div className="glass-card" style={{ padding: 16, flex: 1 }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
            color: 'var(--text-primary)', letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            📋 La Tua Rosa
          </div>

          {rosa.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Aggiungi giocatori alla rosa per contestualizzare l'AI con i tuoi dati.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {rosa.map((g) => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 0',
                  borderBottom: '1px solid rgba(0,212,255,0.08)',
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
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
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
