// src/components/dashboard/MatchdayCard.jsx
import { useState } from 'react';
import useLeagueStore from '../../stores/useLeagueStore';
import useAppStore from '../../store/useAppStore';
import { useCountdown } from '../../hooks/useCountdown';

export default function MatchdayCard() {
  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId) || null
  );
  const playMatchday = useLeagueStore((s) => s.playMatchday);
  const skipCooldown = useLeagueStore((s) => s.skipCooldown);
  const canPlayNow = useLeagueStore((s) => s.canPlayNow);
  const rosa = useAppStore((s) => s.rosa);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const countdown = useCountdown(currentLeague?.nextMatchdayUnlocksAt);

  if (!currentLeague) return null;

  const md = currentLeague.currentMatchday;
  const status = currentLeague.seasonStatus;
  const skips = currentLeague.skipsToday;
  const today = new Date().toISOString().slice(0, 10);
  const skipCount = skips?.date === today ? (skips.count || 0) : 0;
  const skipsRemaining = Math.max(0, 3 - skipCount);

  async function handlePlay() {
    setBusy(true); setError(null);
    try {
      const playersPool = [...rosa];
      await playMatchday(currentLeague.id, { playersPool });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function handleSkip() {
    setError(null);
    try { skipCooldown(currentLeague.id); }
    catch (e) { setError(e.message); }
  }

  const lastResult = currentLeague.matchdayResults?.[currentLeague.matchdayResults.length - 1];
  const userResult = lastResult?.teams?.user;

  let displayState;
  if (status === 'completed') displayState = 'season-completed';
  else if (status === 'pending') displayState = 'pending';
  else if (busy || currentLeague.isPlayingMatchday) displayState = 'playing';
  else if (countdown) displayState = 'locked';
  else displayState = 'ready';

  return (
    <div className="glass-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
          color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          La mia lega · Giornata {md}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {currentLeague.matchdayResults?.length ?? 0}/{currentLeague.calendar?.length || '—'}
        </span>
      </div>

      {displayState === 'pending' && (
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Pronto a iniziare la stagione? Servono almeno 15 giocatori in rosa.
          </p>
          <button
            onClick={handlePlay}
            disabled={busy || rosa.length < 15}
            style={{
              marginTop: 12, width: '100%', padding: '12px',
              background: 'var(--accent-primary)', color: '#000', border: 'none',
              borderRadius: 8, fontWeight: 700, cursor: rosa.length < 15 ? 'not-allowed' : 'pointer',
              opacity: rosa.length < 15 ? 0.5 : 1,
            }}
          >
            {rosa.length < 15 ? `Aggiungi ${15 - rosa.length} giocatori` : `Avvia stagione · Gioca G${md}`}
          </button>
        </div>
      )}

      {displayState === 'locked' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--accent-primary)' }}>
            {countdown}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            alla prossima giornata
          </div>
          <button
            onClick={handleSkip}
            disabled={skipsRemaining === 0}
            style={{
              padding: '8px 16px', background: 'transparent',
              border: '1px solid var(--border-glass)', color: 'var(--text-primary)',
              borderRadius: 6, fontSize: 12, cursor: skipsRemaining === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {skipsRemaining > 0 ? `Skippa attesa (${skipsRemaining}/3)` : 'Skip esauriti, riprova domani'}
          </button>
        </div>
      )}

      {displayState === 'ready' && (
        <button
          onClick={handlePlay}
          disabled={busy}
          style={{
            width: '100%', padding: '12px',
            background: 'var(--accent-primary)', color: '#000', border: 'none',
            borderRadius: 8, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {busy ? 'In corso…' : `Gioca giornata ${md}`}
        </button>
      )}

      {displayState === 'playing' && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Calcolo in corso…</p>
      )}

      {displayState === 'season-completed' && (
        <p style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>
          🏁 Stagione conclusa
        </p>
      )}

      {userResult && displayState !== 'pending' && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Ultima giornata: {userResult.fantapunti}pt · {userResult.golFatti} gol
        </div>
      )}

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>
          {error === 'SkipsExhausted' ? 'Skip esauriti per oggi. Riprova domani.' :
           error === 'RosterTooSmall' ? 'Rosa troppo piccola: servono almeno 15 giocatori.' :
           error === 'PlayerPoolMissing' ? 'Pool giocatori non disponibile.' :
           `Errore: ${error}`}
        </div>
      )}
    </div>
  );
}
