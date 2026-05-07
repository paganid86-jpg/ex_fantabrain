import { useEffect, useState } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
import { analizzaGiornata } from '../lib/claudeApi';
import { formatMatchDate } from '../services/footballDataMapper';

const FILTERS = [
  { value: 'tutte', label: 'Tutte' },
  { value: 'giocate', label: 'Giocate' },
  { value: 'future', label: 'Future' },
];

function getResultTone(day) {
  const parts = day.risultato ? day.risultato.split('-').map((value) => parseInt(value, 10)) : [];
  if (parts.length !== 2) return 'neutral';
  if (parts[0] > parts[1]) return 'win';
  if (parts[0] < parts[1]) return 'loss';
  return 'draw';
}

function getResultLabel(tone) {
  if (tone === 'win') return 'Vittoria';
  if (tone === 'loss') return 'Sconfitta';
  if (tone === 'draw') return 'Pareggio';
  return 'Da giocare';
}

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

  const serieAMatchday = useSerieAStore((s) => s.currentMatchday);
  const loadingMatches = useSerieAStore((s) => s.loading.matches);
  const errorMatches = useSerieAStore((s) => s.errors.matches);
  const fetchSerieA = useSerieAStore((s) => s.fetchAll);
  const getNextMatches = useSerieAStore((s) => s.getNextMatchdayMatches);

  useEffect(() => {
    fetchSerieA();
  }, [fetchSerieA]);

  const nextSerieAMatches = getNextMatches();
  const titolari = titolariIds.map((id) => rosa.find((player) => player.id === id)).filter(Boolean);

  const giornate = calendario.filter((day) => {
    if (filtro === 'giocate') return day.giocata;
    if (filtro === 'future') return !day.giocata;
    return true;
  });

  const totaleGiocate = calendario.filter((day) => day.giocata).length;
  const puntiTot = calendario
    .filter((day) => day.giocata && day.puntiUser)
    .reduce((sum, day) => sum + day.puntiUser, 0);
  const prossimaGiornata = calendario.find((day) => !day.giocata) || calendario[0] || null;

  async function analizzaProssima() {
    setAiLoading(true);
    setAiError(null);
    setAiRisultato(null);
    try {
      const text = await analizzaGiornata(titolari, nextSerieAMatches, giornataCorrente);
      setAiRisultato(text);
    } catch {
      setAiError('Analisi non disponibile. Riprova piu tardi.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="ops-page calendar-page">
      <section className="ops-hero calendar-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Matchday Timeline</span>
          <h1>Calendario operativo.</h1>
          <p>
            Giornate di lega, prossima Serie A e analisi rapida dei titolari
            raccolte in una timeline mobile-first.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="ops-stat-grid" aria-label="Sintesi calendario">
        <div className="ops-stat">
          <span>Giornata</span>
          <strong>{giornataCorrente ?? '--'}</strong>
          <small>fantacampionato</small>
        </div>
        <div className="ops-stat">
          <span>Giocate</span>
          <strong>{totaleGiocate}</strong>
          <small>{calendario.length} totali</small>
        </div>
        <div className="ops-stat">
          <span>Punti</span>
          <strong>{puntiTot || '--'}</strong>
          <small>totale stagione</small>
        </div>
      </section>

      <div className="calendar-layout">
        <main className="calendar-main">
          <div className="ops-tabs calendar-filters" aria-label="Filtri calendario">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`ops-tab${filtro === filter.value ? ' is-active' : ''}`}
                onClick={() => setFiltro(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {calendario.length === 0 ? (
            <section className="ops-empty calendar-empty">
              <span className="lux-kicker">Calendario</span>
              <h2>Non disponibile.</h2>
              <p>Le giornate compariranno quando il motore stagione sara pronto o quando avrai dati di lega.</p>
            </section>
          ) : (
            <section className="calendar-timeline" aria-label="Giornate lega">
              {giornate.map((day) => {
                const expanded = giornataDettaglio?.giornata === day.giornata;
                const tone = getResultTone(day);
                const isCurrent = day.inCorso || day.giornata === giornataCorrente;

                return (
                  <article key={day.giornata} className={`calendar-day-card${isCurrent ? ' is-current' : ''}`}>
                    <button
                      type="button"
                      className="calendar-day-card__summary"
                      onClick={() => setGiornataDettaglio(expanded ? null : day)}
                      aria-expanded={expanded}
                    >
                      <span className="calendar-day-card__round">G{day.giornata}</span>
                      <span className="calendar-day-card__body">
                        <strong>vs {day.avversario || 'Da definire'}</strong>
                        <small>{day.data || 'Data non disponibile'}</small>
                      </span>
                      <span className={`calendar-day-card__result is-${tone}`}>
                        {day.giocata && day.risultato ? day.risultato : day.proiezionePunti ? `~${day.proiezionePunti}` : '--'}
                        <small>{getResultLabel(tone)}</small>
                      </span>
                    </button>

                    {expanded && (
                      <div className="calendar-day-card__detail">
                        <span className="lux-kicker">Dettaglio giornata</span>
                        {day.giocata ? (
                          <p>
                            Risultato {day.risultato || '--'}.
                            {day.puntiUser ? ` Punti squadra: ${day.puntiUser}.` : ' Punteggio dettagliato non disponibile.'}
                          </p>
                        ) : (
                          <p>
                            Giornata non ancora disputata.
                            {day.proiezionePunti ? ` Proiezione attuale: ${day.proiezionePunti} punti.` : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </main>

        <aside className="calendar-side">
          <section className="ops-panel calendar-ai-panel">
            <span className="lux-kicker">AI Matchday</span>
            <h2>Analisi G{giornataCorrente}</h2>
            <p>Usa i titolari schierati e il calendario Serie A come contesto operativo.</p>
            <button
              type="button"
              className="home-lux-hero__cta calendar-ai-panel__button"
              onClick={analizzaProssima}
              disabled={aiLoading || aiCrediti === 0}
            >
              {aiLoading ? 'Analizzando...' : 'Analizza giornata'}
            </button>
            {aiCrediti === 0 && <small className="ops-note">Crediti AI esauriti.</small>}
            {aiError && <div className="ops-error">{aiError}</div>}
            {aiRisultato && <div className="ai-response calendar-ai-response">{aiRisultato}</div>}
          </section>

          <section className="ops-panel seriea-match-panel">
            <header className="ops-panel__header">
              <div>
                <span className="lux-kicker">Serie A</span>
                <h2>G{serieAMatchday ?? '--'}</h2>
              </div>
            </header>

            {loadingMatches && <div className="ops-inline-empty">Caricamento partite...</div>}
            {errorMatches && (
              <div className="ops-error">
                {errorMatches.includes('non configurata')
                  ? 'Aggiungi VITE_FOOTBALL_DATA_API_KEY nel .env.'
                  : 'Errore dati Serie A.'}
              </div>
            )}
            {nextSerieAMatches.length === 0 && !loadingMatches && !errorMatches && (
              <div className="ops-inline-empty">Nessuna partita in programma.</div>
            )}
            <div className="seriea-match-list">
              {nextSerieAMatches.map((match) => {
                const isLive = ['IN_PLAY', 'PAUSED'].includes(match.status);
                return (
                  <article key={match.id} className="seriea-match-item">
                    <div>
                      {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" />}
                      <strong>{match.homeTeam.shortName}</strong>
                    </div>
                    <span>{isLive ? 'LIVE' : formatMatchDate(match.date)}</span>
                    <div>
                      {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" />}
                      <strong>{match.awayTeam.shortName}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {prossimaGiornata && (
            <section className="ops-panel calendar-next-card">
              <span className="lux-kicker">Prossima lega</span>
              <h2>G{prossimaGiornata.giornata}</h2>
              <p>vs {prossimaGiornata.avversario || 'Da definire'}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
