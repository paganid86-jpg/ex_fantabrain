import { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
import { chatClaude, buildSystemPrompt } from '../lib/claudeApi';

const QUICK_PROMPTS = [
  { label: 'Chi schiero questa giornata?', short: 'XI' },
  { label: 'Analizza il mio prossimo avversario', short: 'VS' },
  { label: 'Chi vale la pena acquistare?', short: 'MK' },
  { label: 'I miei giocatori più in forma', short: 'HOT' },
  { label: 'Infortuni e diffide da valutare', short: 'MED' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`coach-message ${isUser ? 'coach-message--user' : 'coach-message--assistant'}`}>
      {!isUser && <span className="coach-message__avatar" aria-hidden="true">AI</span>}
      <div className="coach-message__bubble">{msg.content}</div>
    </div>
  );
}

function formatMedia(value) {
  return Number.isFinite(value) ? value.toFixed(1) : '-';
}

export default function AIAnalisi() {
  const rosa = useAppStore((s) => s.rosa);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const resetAt = useAppStore((s) => s.resetAt);
  const userPlan = useAppStore((s) => s.user?.plan);
  const isGold = userPlan === 'gold';
  const aiConversazioni = useAppStore((s) => s.aiConversazioni);
  const aggiungiMessaggio = useAppStore((s) => s.aggiungiMessaggio);
  const resetConversazione = useAppStore((s) => s.resetConversazione);

  const serieAStandings = useSerieAStore((s) => s.standings);
  const serieAMatchday = useSerieAStore((s) => s.currentMatchday);
  const serieAScorers = useSerieAStore((s) => s.scorers);
  const getNextMatches = useSerieAStore((s) => s.getNextMatchdayMatches);

  const pageId = 'ai-analisi';
  const messaggi = aiConversazioni[pageId] || [];
  const noCredits = aiCrediti === 0 && !isGold;
  const topPlayers = [...rosa]
    .sort((a, b) => (b.votoMedia || 0) - (a.votoMedia || 0))
    .slice(0, 8);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, loading]);

  const serieAContext = (serieAStandings || (serieAScorers || []).length > 0)
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
    if (!msg || loading || noCredits) return;

    setInput('');
    setError(null);
    aggiungiMessaggio(pageId, { role: 'user', content: msg });

    const history = [...messaggi, { role: 'user', content: msg }];
    const claudeMessages = history.map((m) => ({ role: m.role, content: m.content }));

    setLoading(true);
    try {
      const risposta = await chatClaude({
        messages: claudeMessages,
        systemPrompt,
        maxTokens: 600,
      });
      aggiungiMessaggio(pageId, { role: 'assistant', content: risposta });
    } catch (err) {
      if (err.message === 'NO_CREDITS') return;
      setError('Risposta non disponibile. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="coach-page">
      <section className="coach-shell" aria-label="Chat AI Coach">
        <header className="coach-header">
          <div>
            <span className="coach-kicker">Private Analyst</span>
            <h1 className="coach-title">Coach, senza rumore.</h1>
            <p className="coach-subtitle">
              Giornata {giornataCorrente} · analisi privata sulla tua rosa.
            </p>
          </div>

          <div className="coach-header__actions">
            <button
              type="button"
              className="coach-context-toggle"
              onClick={() => setIsContextOpen((current) => !current)}
              aria-expanded={isContextOpen}
              aria-controls="coach-context-panel"
            >
              <span className="coach-context-toggle__icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              Contesto
            </button>
            <span className={`coach-credit ${aiCrediti < 3 && !isGold ? 'coach-credit--low' : ''}`}>
              {isGold ? 'Gold' : `${aiCrediti} crediti`}
            </span>
            {messaggi.length > 0 && (
              <button
                type="button"
                onClick={() => resetConversazione(pageId)}
                className="coach-reset"
              >
                Nuova chat
              </button>
            )}
          </div>
        </header>

        {!isGold && (
          <div className="coach-credit-strip" aria-label="Crediti AI disponibili">
            <div className="coach-credit-dots">
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < aiCrediti ? 'is-active' : ''} />
              ))}
            </div>
            <span>{aiCrediti}/3 crediti giornata</span>
            {resetAt && (
              <small>
                Reset {new Date(resetAt).toLocaleDateString('it-IT', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })} 20:45
              </small>
            )}
          </div>
        )}

        {isGold && (
          <div className="coach-gold-strip">
            <strong>Gold</strong>
            <span>Accesso illimitato alla console privata.</span>
          </div>
        )}

        <div className="coach-context-card">
          <span className="coach-kicker">Contesto letto</span>
          <p>Rosa, giornata {giornataCorrente}, classifica{serieAContext ? ' e dati Serie A reali.' : '.'}</p>
        </div>

        <div className="coach-thread">
          {messaggi.length === 0 && (
            <div className="coach-empty">
              <span className="coach-empty__mark">AI</span>
              <h2>Dimmi cosa vuoi ottimizzare.</h2>
              <p>
                Posso ragionare su formazione, avversario, mercato e stato fisico
                della tua rosa prima della deadline.
              </p>
            </div>
          )}

          {messaggi.map((msg, i) => (
            <MessageBubble key={`${msg.role}-${i}`} msg={msg} />
          ))}

          {loading && (
            <div className="coach-message coach-message--assistant">
              <span className="coach-message__avatar" aria-hidden="true">AI</span>
              <div className="coach-typing" aria-label="AI Coach sta scrivendo">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {error && <div className="coach-error">{error}</div>}
          <div ref={bottomRef} />
        </div>

        {noCredits ? (
          <div className="coach-lock">
            <strong>Crediti AI esauriti</strong>
            <span>
              {resetAt
                ? `Reset: ${new Date(resetAt).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })} alle 20:45`
                : 'Reset automatico a fine giornata'}
            </span>
          </div>
        ) : (
          <footer className="coach-composer">
            <div className="coach-prompts" aria-label="Prompt rapidi">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => invia(prompt.label)}
                  disabled={loading}
                  className="coach-prompt"
                >
                  <span>{prompt.short}</span>
                  {prompt.label}
                </button>
              ))}
            </div>

            <div className="coach-input-row">
              <input
                className="coach-input"
                placeholder="Fai una domanda al tuo coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && invia()}
                disabled={loading}
              />
              <button
                type="button"
                className="coach-send"
                onClick={() => invia()}
                disabled={loading || !input.trim()}
              >
                Invia
              </button>
            </div>
          </footer>
        )}
      </section>

      <aside
        id="coach-context-panel"
        className={`coach-side${isContextOpen ? ' is-open' : ''}`}
        aria-label="Contesto rosa"
      >
        <div className="coach-side__topbar">
          <span className="coach-kicker">Contesto</span>
          <button
            type="button"
            className="coach-side__close"
            onClick={() => setIsContextOpen(false)}
          >
            Chiudi
          </button>
        </div>
        <section className="coach-side-card coach-side-card--insight">
          <span className="coach-kicker">Insight pack</span>
          <h2>Nucleo rosa</h2>
          <p>
            {rosa.length > 0
              ? 'Il coach usa questi profili come contesto prioritario nella chat.'
              : 'Aggiungi giocatori alla rosa per rendere le risposte più precise.'}
          </p>
        </section>

        <section className="coach-side-card">
          <div className="coach-side-card__header">
            <span className="coach-kicker">Player Board</span>
            <strong>{rosa.length}</strong>
          </div>

          {topPlayers.length === 0 ? (
            <p className="coach-side-empty">
              La rosa è vuota. Inserisci i tuoi giocatori da Schieramento.
            </p>
          ) : (
            <div className="coach-roster-list">
              {topPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`coach-roster-item${player.infortunato ? ' is-injured' : ''}`}
                >
                  <span className="coach-roster-role">{player.ruoloMantra}</span>
                  <span className="coach-roster-name">{player.cognome || player.nome}</span>
                  <span className="coach-roster-media">{formatMedia(player.votoMedia)}</span>
                  {player.infortunato && <span className="coach-roster-status">OUT</span>}
                  {player.diffidato && !player.infortunato && <span className="coach-roster-status">DIFF</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>

      {isContextOpen && (
        <button
          type="button"
          className="coach-side-backdrop"
          aria-label="Chiudi contesto rosa"
          onClick={() => setIsContextOpen(false)}
        />
      )}
    </div>
  );
}
