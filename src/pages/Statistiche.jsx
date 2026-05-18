import { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';

function BarChart({ data, max, labels }) {
  const maximum = max || Math.max(...data, 1);
  return (
    <div className="stats-bar-chart" aria-label="Andamento punti">
      {data.map((value, index) => (
        <span key={`${value}-${index}`}>
          <i
            title={`${labels ? labels[index] : `G${index + 1}`}: ${value}pt`}
            style={{ '--bar-height': `${Math.max((value / maximum) * 100, 3)}%` }}
          />
        </span>
      ))}
    </div>
  );
}

function StatBar({ value }) {
  const pct = Math.min(((parseFloat(value) - 5) / 5) * 100, 100);
  return (
    <div className="stats-progress">
      <span style={{ '--progress': `${Math.max(pct, 0)}%` }} />
    </div>
  );
}

function formatPlayer(player) {
  return player.cognome || player.nome || 'Giocatore';
}

export default function Statistiche() {
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const calendario = useAppStore((s) => s.calendario);

  const scorers = useSerieAStore((s) => s.scorers);
  const loadingScorers = useSerieAStore((s) => s.loading.scorers);
  const errorScorers = useSerieAStore((s) => s.errors.scorers);
  const fetchScorers = useSerieAStore((s) => s.fetchScorers);

  useEffect(() => {
    fetchScorers();
  }, [fetchScorers]);

  const userRow = classifica.find((row) => row.isUser);
  const giornateGiocate = calendario.filter((day) => day.giocata && day.puntiUser);
  const andamentoPunti = giornateGiocate.map((day) => day.puntiUser);
  const labelsGiornate = giornateGiocate.map((day) => `G${day.giornata}`);
  const puntiTotali = userRow?.punti ?? andamentoPunti.reduce((sum, value) => sum + value, 0);
  const media = andamentoPunti.length > 0
    ? (andamentoPunti.reduce((sum, value) => sum + value, 0) / andamentoPunti.length).toFixed(1)
    : (userRow?.puntimedia?.toFixed(1) ?? '--');

  const migliore = andamentoPunti.length > 0
    ? { punti: Math.max(...andamentoPunti), giornata: labelsGiornate[andamentoPunti.indexOf(Math.max(...andamentoPunti))] }
    : null;
  const peggiore = andamentoPunti.length > 0
    ? { punti: Math.min(...andamentoPunti), giornata: labelsGiornate[andamentoPunti.indexOf(Math.min(...andamentoPunti))] }
    : null;

  const topPerformer = [...rosa]
    .filter((player) => !player.infortunato)
    .sort((a, b) => b.votoMedia - a.votoMedia)
    .slice(0, 8);

  const roleGroups = {
    Portieri: rosa.filter((player) => player.ruoloMantra === 'Por'),
    Difensori: rosa.filter((player) => ['DD', 'DS', 'DC'].some((role) => player.ruoloMantra?.startsWith(role))),
    Centrocampisti: rosa.filter((player) => ['M/C', 'C'].some((role) => player.ruoloMantra?.startsWith(role))),
    Attaccanti: rosa.filter((player) => ['T/A', 'PC', 'T', 'A', 'W'].some((role) => player.ruoloMantra?.startsWith(role))),
  };

  const mediaPerRuolo = Object.entries(roleGroups).map(([name, players]) => ({
    name,
    media: players.length > 0
      ? (players.reduce((sum, player) => sum + player.votoMedia, 0) / players.length).toFixed(2)
      : null,
    count: players.length,
  }));

  const inForma = rosa.filter((player) => {
    const ultimi3 = (player.votiUltimi5 || []).slice(-3).filter((vote) => vote > 0);
    if (ultimi3.length === 0) return false;
    const media3 = ultimi3.reduce((sum, vote) => sum + vote, 0) / ultimi3.length;
    return media3 > player.votoMedia + 0.3;
  });

  const inCalo = rosa.filter((player) => {
    const ultimi3 = (player.votiUltimi5 || []).slice(-3).filter((vote) => vote > 0);
    if (ultimi3.length === 0) return false;
    const media3 = ultimi3.reduce((sum, vote) => sum + vote, 0) / ultimi3.length;
    return media3 < player.votoMedia - 0.3;
  });

  const kpiItems = [
    { label: 'Punti stagione', value: puntiTotali, hint: 'totale' },
    { label: 'Media giornata', value: media, hint: 'punti' },
    migliore ? { label: 'Best', value: `${migliore.punti}pt`, hint: migliore.giornata } : { label: 'Best', value: '--', hint: 'nessun dato' },
    peggiore ? { label: 'Worst', value: `${peggiore.punti}pt`, hint: peggiore.giornata } : { label: 'Worst', value: '--', hint: 'nessun dato' },
  ];

  const noData = rosa.length === 0 && classifica.length === 0;

  return (
    <div className="ops-page stats-page">
      <section className="ops-hero stats-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Statistiche</span>
          <h1>Season lab.</h1>
          <p>
            Trend punti, rendimento rosa, reparti e marcatori Serie A in una vista
            pensata per leggere la stagione senza rumore.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      {noData ? (
        <section className="ops-empty">
          <span className="lux-kicker">Dataset vuoto</span>
          <h2>Nessun dato disponibile.</h2>
          <p>Aggiungi giocatori e partite per vedere statistiche, trend e segnali rosa.</p>
        </section>
      ) : (
        <>
          <section className="ops-stat-grid" aria-label="KPI statistiche">
            {kpiItems.map((item) => (
              <div key={item.label} className="ops-stat">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.hint}</small>
              </div>
            ))}
          </section>

          {andamentoPunti.length > 0 && (
            <section className="ops-panel stats-chart-panel">
              <header className="ops-panel__header">
                <div>
                  <span className="lux-kicker">Andamento punti</span>
                  <h2>Stagione</h2>
                </div>
                <strong>{labelsGiornate[0]} - {labelsGiornate[labelsGiornate.length - 1]}</strong>
              </header>
              <BarChart data={andamentoPunti} labels={labelsGiornate} />
            </section>
          )}

          {rosa.length > 0 && (
            <>
              <div className="stats-grid">
                <section className="ops-panel">
                  <span className="lux-kicker">Top performer</span>
                  <div className="stats-list">
                    {topPerformer.length === 0 ? (
                      <div className="ops-inline-empty">Nessun dato disponibile.</div>
                    ) : (
                      topPerformer.map((player, index) => (
                        <article key={player.id} className="stats-row">
                          <span className={`rank-position${index < 3 ? ' is-podium' : ''}`}>{index + 1}</span>
                          <span className="ops-badge">{player.ruoloMantra}</span>
                          <strong>{formatPlayer(player)}</strong>
                          <em>{player.votoMedia.toFixed(1)}</em>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="ops-panel">
                  <span className="lux-kicker">Media per reparto</span>
                  <div className="stats-role-list">
                    {mediaPerRuolo.map((role) => (
                      <article key={role.name}>
                        <div>
                          <strong>{role.name}</strong>
                          <span>{role.count} giocatori</span>
                        </div>
                        <em>{role.media ?? '--'}</em>
                        {role.media && <StatBar value={role.media} />}
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="stats-grid">
                <section className="ops-panel">
                  <header className="stats-panel-title">
                    <span className="lux-kicker">In forma</span>
                    <strong>{inForma.length}</strong>
                  </header>
                  <div className="stats-list">
                    {inForma.length === 0 ? (
                      <div className="ops-inline-empty">Nessun giocatore particolarmente in forma.</div>
                    ) : (
                      inForma.map((player) => (
                        <article key={player.id} className="stats-row">
                          <span className="ops-badge">{player.ruoloMantra}</span>
                          <strong>{formatPlayer(player)}</strong>
                          <em>{player.votoMedia.toFixed(1)}</em>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="ops-panel">
                  <header className="stats-panel-title">
                    <span className="lux-kicker">In calo</span>
                    <strong>{inCalo.length}</strong>
                  </header>
                  <div className="stats-list">
                    {inCalo.length === 0 ? (
                      <div className="ops-inline-empty">Nessun giocatore in calo di prestazioni.</div>
                    ) : (
                      inCalo.map((player) => (
                        <article key={player.id} className="stats-row">
                          <span className="ops-badge">{player.ruoloMantra}</span>
                          <strong>{formatPlayer(player)}</strong>
                          <em>{player.votoMedia.toFixed(1)}</em>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </>
      )}

      <section className="ops-panel stats-scorers-panel">
        <header className="ops-panel__header">
          <div>
            <span className="lux-kicker">Serie A reale</span>
            <h2>Top marcatori</h2>
          </div>
          {!loadingScorers && !errorScorers && scorers.length > 0 && (
            <button type="button" className="btn-secondary" onClick={() => fetchScorers(true)}>Aggiorna</button>
          )}
        </header>

        {loadingScorers && <div className="ops-inline-empty">Caricamento marcatori...</div>}
        {errorScorers && (
          <div className="ops-error">
            {errorScorers.includes('non configurata')
              ? 'Configura VITE_FOOTBALL_DATA_API_KEY nel file .env.'
              : `Errore: ${errorScorers}`}
          </div>
        )}
        {!loadingScorers && scorers.length === 0 && !errorScorers && (
          <div className="ops-inline-empty">Dati marcatori non disponibili.</div>
        )}
        {scorers.length > 0 && (
          <div className="stats-scorer-grid">
            {scorers.slice(0, 20).map((scorer, index) => (
              <article key={scorer.playerId} className="stats-scorer-row">
                <span className={`rank-position${index < 3 ? ' is-podium' : ''}`}>{index + 1}</span>
                <div>
                  <strong>{scorer.name}</strong>
                  <span>{scorer.teamName} - {scorer.played}G</span>
                </div>
                <em>{scorer.goals}<small> gol</small></em>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
