// src/pages/Dashboard.jsx

import { Link } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useLeagueStore from '../stores/useLeagueStore';
import HeroBlock from '../components/patterns/HeroBlock';
import DeadlinePill from '../components/patterns/DeadlinePill';
import QuickCard from '../components/patterns/QuickCard';
import NewsPreviewStub from '../components/patterns/NewsPreviewStub';
import { getNextMatchdayDeadline } from '../lib/matchdayDeadline';
import { getHeroPhrase } from '../lib/heroPhrase';

export default function Dashboard() {
  // ── State reads (selettori reattivi inline) ────────────
  const userName = useAppStore((s) => s.user?.name || 'Fantallenatore');
  const rosa = useAppStore((s) => s.rosa);
  const calendario = useAppStore((s) => s.calendario);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const currentLeagueId = useLeagueStore((s) => s.currentLeagueId);
  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId)
  );

  // ── LeagueGate — onboarding per utenti senza lega attiva ────
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

  // ── Calcoli per hero ───────────────────────────────────
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

  // ── KPI rapidi per QuickCard ───────────────────────────
  const posizione = userRow ? classifica.findIndex((r) => r.isUser) + 1 : null;
  const infortunati = rosa.filter((p) => p.infortunato).length;

  return (
    <div className="home-stack home-stack--luxury">
      {/* Greeting */}
      <section className="home-greeting">
        <span className="kicker">
          GIORNATA {giornataCorrente ?? '-'} · {currentLeague.nome}
        </span>
        <h1 className="home-greeting-title">
          Ciao {userName}. {phrase}
        </h1>
        <div className="home-greeting-actions" aria-label="Azioni rapide principali">
          <Link to="/schieramento" className="home-action home-action--gold">Schiera ora</Link>
          <Link to="/ai-analisi" className="home-action">Chiedi al coach</Link>
        </div>
      </section>

      {/* Hero punti ultima giornata */}
      <HeroBlock
        kicker={
          ultimaGiocata
            ? `GIORNATA ${ultimaGiocata.giornata} · PUNTI`
            : 'PUNTI · NESSUNA GIOCATA'
        }
        value={puntiUltima ?? '—'}
        diff={diff}
        label={puntiUltima != null ? 'ultima giornata' : 'nessun dato'}
      />

      {/* Deadline schieramento */}
      <DeadlinePill deadline={deadline} label="Schieramento" />

      {/* Quick cards 2x2 */}
      <section className="quick-card-grid">
        <QuickCard
          icon="CL"
          label="Classifica"
          value={posizione ?? '—'}
          hint={posizione ? `su ${classifica.length}` : 'non disponibile'}
          to="/classifica"
        />
        <QuickCard
          icon="XI"
          label="Schiera"
          hint="tocca per schierare"
          to="/schieramento"
        />
        <QuickCard
          icon="MED"
          label="Infortuni"
          value={infortunati}
          hint={infortunati > 0 ? 'in rosa' : 'tutti ok'}
          to="/la-rosa"
        />
        <QuickCard
          icon="AI"
          label="AI Coach"
          hint="apri console"
          to="/ai-analisi"
        />
      </section>

      {/* News preview stub */}
      <NewsPreviewStub players={rosa} />
    </div>
  );
}
