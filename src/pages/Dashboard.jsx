// src/pages/Dashboard.jsx

import { Link } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useLeagueStore from '../stores/useLeagueStore';
import MetricHero from '../components/patterns/MetricHero';
import SignalRow from '../components/patterns/SignalRow';
import NoirActionRow from '../components/patterns/NoirActionRow';
import NewsPreviewStub from '../components/patterns/NewsPreviewStub';
import { getNextMatchdayDeadline } from '../lib/matchdayDeadline';
import { getHeroPhrase } from '../lib/heroPhrase';

export default function Dashboard() {
  // State reads (selettori reattivi inline)
  const userName = useAppStore((s) => s.user?.name || 'Fantallenatore');
  const rosa = useAppStore((s) => s.rosa);
  const calendario = useAppStore((s) => s.calendario);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const currentLeagueId = useLeagueStore((s) => s.currentLeagueId);
  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId)
  );

  // LeagueGate - onboarding per utenti senza lega attiva
  if (!currentLeagueId || !currentLeague) {
    return (
      <div className="empty-state home-empty-state">
        <div className="empty-state-icon" aria-hidden="true">⚑</div>
        <h1 className="empty-state-title">Crea la tua prima lega</h1>
        <p className="empty-state-desc">
          Per usare FantaBrain serve una lega. Creane una nuova o unisciti
          con un codice invito.
        </p>
        <div className="home-empty-state__actions">
          <Link to="/crea-lega" className="btn-primary">Crea lega</Link>
          <Link to="/impostazioni-lega" className="btn-secondary">Unisciti</Link>
        </div>
      </div>
    );
  }

  // Calcoli per hero
  const ultimaGiocata = [...calendario].reverse().find((g) => g.giocata);
  const puntiUltima = ultimaGiocata?.puntiUser ?? null;
  const userRow = classifica?.find((r) => r.isUser) || null;
  const puntiMedia = userRow?.puntimedia ?? null;
  const diff =
    puntiUltima != null && puntiMedia != null
      ? Math.round((puntiUltima - puntiMedia) * 10) / 10
      : null;
  const giornataAperta = !!(ultimaGiocata && !ultimaGiocata.giocata);

  const phrase = getHeroPhrase({ puntiUltima, puntiMedia, giornataAperta });
  const deadline = getNextMatchdayDeadline();
  const leagueName = currentLeague.settings?.nome ?? currentLeague.nome ?? 'Lega';

  // KPI rapidi per segnali home
  const posizione = userRow ? classifica.findIndex((r) => r.isUser) + 1 : null;
  const infortunati = rosa.filter((p) => p.infortunato).length;

  return (
    <div className="home-stack home-stack--luxury">
      <section className="home-lux-hero">
        <div className="home-lux-hero__copy">
          <span className="lux-kicker">
            GIORNATA {giornataCorrente ?? '-'} · {leagueName}
          </span>
          <h1>
            Ciao {userName}. <span>{phrase}</span>
          </h1>
          <p>
            L'AI ha analizzato i segnali della tua lega. Ecco cosa conta oggi per vincere.
          </p>
          <Link to="/ai-analisi" className="home-lux-hero__cta">
            Chiedi un consiglio all'AI
          </Link>
        </div>
        <div className="home-lux-hero__brain" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <MetricHero
        kicker={
          ultimaGiocata
            ? `GIORNATA ${ultimaGiocata.giornata} · PUNTI`
            : 'PUNTI · NESSUNA GIOCATA'
        }
        value={puntiUltima ?? '—'}
        delta={diff}
        label={puntiUltima != null ? 'ultima giornata' : 'nessun dato'}
      />

      <NoirActionRow
        primary={{ label: 'Schiera ora', to: '/schieramento' }}
        secondary={{ label: 'Coach', to: '/ai-analisi' }}
      />

      <section className="home-noir-signals" aria-label="Segnali giornata">
        <SignalRow
          tone="gold"
          label="Deadline schieramento"
          value={deadline.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
          hint="Controlla prima del blocco"
          to="/schieramento"
        />
        <SignalRow
          tone={infortunati > 0 ? 'danger' : 'success'}
          label="Rischi rosa"
          value={infortunati}
          hint={infortunati > 0 ? 'giocatori da valutare' : 'nessun infortunio'}
          to="/la-rosa"
        />
        <SignalRow
          tone="neutral"
          label="Posizione lega"
          value={posizione ? `${posizione}/${classifica.length}` : '—'}
          hint={posizione ? 'classifica aggiornata' : 'non disponibile'}
          to="/classifica"
        />
      </section>

      <NewsPreviewStub players={rosa} />
    </div>
  );
}
