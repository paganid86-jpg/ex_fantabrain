import { useEffect, useState } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
import useLeagueStore from '../stores/useLeagueStore';

function MiniBarChart({ punti, max }) {
  return (
    <div className="rank-form-bars" aria-label="Forma ultimi turni">
      {punti.map((point, index) => (
        <span key={`${point}-${index}`} title={`${point}pt`}>
          <i style={{ '--bar-height': `${Math.max((point / max) * 100, 8)}%` }} />
        </span>
      ))}
    </div>
  );
}

function formatMedia(value) {
  return Number.isFinite(value) ? value.toFixed(1) : '--';
}

function getTrend(team) {
  const last = team.andamento || [];
  if (last.length < 2) return 'steady';
  return last[last.length - 1] >= last[0] ? 'rise' : 'risk';
}

export default function Classifica() {
  const appClassifica = useAppStore((s) => s.classifica);

  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId) || null
  );

  const classifica = currentLeague?.standings?.length > 0
    ? currentLeague.standings
    : currentLeague?.participants?.map((participant, index) => ({
        id: participant.id ?? index,
        nome: participant.name || 'Squadra',
        punti: 0,
        vittorie: 0,
        pareggi: 0,
        sconfitte: 0,
        puntimedia: 0,
        ultimoTurno: 0,
        isUser: participant.isUser ?? false,
        andamento: [],
      })) ?? appClassifica;

  const [modal, setModal] = useState(null);
  const [confronto, setConfronto] = useState(null);
  const [vista, setVista] = useState('lega');

  const serieAStandings = useSerieAStore((s) => s.standings);
  const serieAMatchday = useSerieAStore((s) => s.currentMatchday);
  const loadingStandings = useSerieAStore((s) => s.loading.standings);
  const errorStandings = useSerieAStore((s) => s.errors.standings);
  const fetchStandings = useSerieAStore((s) => s.fetchStandings);

  useEffect(() => {
    if (vista === 'seriea') fetchStandings();
  }, [vista, fetchStandings]);

  const legaVuota = classifica.length === 0;
  const userRow = classifica.find((team) => team.isUser);
  const userPos = classifica.findIndex((team) => team.isUser) + 1;
  const leader = classifica[0] || null;
  const gapLeader = userRow && leader ? Math.max((leader.punti || 0) - (userRow.punti || 0), 0) : null;

  const andamento = (team) => {
    if (team.andamento && team.andamento.length > 0) return team.andamento;
    return [50, 50, 50, 50, 50];
  };
  const allPunti = classifica.flatMap((team) => andamento(team));
  const maxPunti = Math.max(...allPunti, 1);

  const kpiItems = [
    { label: 'Posizione', value: userPos > 0 ? `${userPos}/${classifica.length}` : '--', hint: 'ranking lega' },
    { label: 'Punti', value: userRow?.punti ?? '--', hint: gapLeader != null ? `${gapLeader} dal leader` : 'non disponibile' },
    { label: 'Record', value: `${userRow?.vittorie ?? 0}/${userRow?.pareggi ?? 0}/${userRow?.sconfitte ?? 0}`, hint: 'V/P/S' },
    { label: 'Media', value: userRow ? formatMedia(userRow.puntimedia) : '--', hint: 'punti a giornata' },
  ];

  const renderLeagueTable = () => (
    <>
      <div className="rank-mobile-list">
        {classifica.map((team, index) => (
          <article key={team.id} className={`rank-card${team.isUser ? ' is-user' : ''}`}>
            <div className="rank-card__pos">{index + 1}</div>
            <div className="rank-card__body">
              <strong>{team.nome}{team.isUser ? ' - tu' : ''}</strong>
              <span>{team.vittorie}V / {team.pareggi}P / {team.sconfitte}S</span>
              <MiniBarChart punti={andamento(team)} max={maxPunti} />
            </div>
            <div className="rank-card__score">
              <strong>{team.punti}</strong>
              <span>{formatMedia(team.puntimedia)}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="ops-panel rank-table-card">
        <div className="rank-table-scroll">
          <table className="data-table rank-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Squadra</th>
                <th>V</th>
                <th>P</th>
                <th>S</th>
                <th>Tot</th>
                <th>Media</th>
                <th>Ultimo</th>
                <th>Forma</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {classifica.map((team, index) => {
                const form = andamento(team);
                return (
                  <tr key={team.id} className={team.isUser ? 'highlight' : ''}>
                    <td><span className={`rank-position${index < 3 ? ' is-podium' : ''}`}>{index + 1}</span></td>
                    <td>
                      <strong className="rank-team-name">
                        {team.nome}{team.isUser && <small>TU</small>}
                      </strong>
                    </td>
                    <td className="rank-win">{team.vittorie}</td>
                    <td className="rank-draw">{team.pareggi}</td>
                    <td className="rank-loss">{team.sconfitte}</td>
                    <td><strong>{team.punti}</strong></td>
                    <td>{formatMedia(team.puntimedia)}</td>
                    <td>{team.ultimoTurno ?? '--'}</td>
                    <td><MiniBarChart punti={form} max={maxPunti} /></td>
                    <td>
                      <div className="rank-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModal(team)}>Dettaglio</button>
                        {!team.isUser && (
                          <button
                            type="button"
                            className={`btn-secondary${confronto?.id === team.id ? ' is-selected' : ''}`}
                            onClick={() => setConfronto(confronto?.id === team.id ? null : team)}
                          >
                            H2H
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <div className="ops-page rank-page">
      <section className="ops-hero rank-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Classifica</span>
          <h1>{vista === 'seriea' ? 'Serie A reale.' : 'Ranking lega.'}</h1>
          <p>
            Posizione, gap, media e forma recente in una vista compatta da controllare
            prima di mercato e formazione.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <nav className="ops-tabs" aria-label="Vista classifica">
        {[
          { value: 'lega', label: 'La mia Lega' },
          { value: 'seriea', label: 'Serie A reale' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setVista(tab.value)}
            className={`ops-tab${vista === tab.value ? ' is-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {vista === 'lega' && (
        <>
          {legaVuota ? (
            <section className="ops-empty">
              <span className="lux-kicker">Lega non pronta</span>
              <h2>Classifica non disponibile.</h2>
              <p>La classifica si aggiornera dopo la prima giornata. Puoi intanto consultare la Serie A reale.</p>
              <button type="button" className="btn-secondary" onClick={() => setVista('seriea')}>Apri Serie A</button>
            </section>
          ) : (
            <>
              <section className="ops-stat-grid" aria-label="Sintesi classifica">
                {kpiItems.map((item) => (
                  <div key={item.label} className="ops-stat">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small>{item.hint}</small>
                  </div>
                ))}
              </section>

              <section className="ops-panel rank-leader-panel">
                <span className="lux-kicker">Leader board</span>
                <h2>{leader?.nome || 'Nessun leader'}</h2>
                <p>
                  {userRow
                    ? gapLeader === 0
                      ? 'Sei agganciato alla vetta: difendi il ritmo.'
                      : `Ti servono ${gapLeader} punti per agganciare il leader.`
                    : 'Aggiungi partecipanti o risultati per attivare insight personali.'}
                </p>
              </section>

              {renderLeagueTable()}

              {confronto && userRow && (
                <section className="ops-panel rank-h2h-panel">
                  <header className="ops-panel__header">
                    <div>
                      <span className="lux-kicker">Head to Head</span>
                      <h2>{userRow.nome} vs {confronto.nome}</h2>
                    </div>
                    <button type="button" className="rosa-icon-btn" onClick={() => setConfronto(null)} aria-label="Chiudi confronto">x</button>
                  </header>
                  <div className="rank-h2h-grid">
                    {[
                      { label: 'Punti', a: userRow.punti, b: confronto.punti },
                      { label: 'Media', a: formatMedia(userRow.puntimedia), b: formatMedia(confronto.puntimedia) },
                      { label: 'Vittorie', a: userRow.vittorie, b: confronto.vittorie },
                      { label: 'Ultimo turno', a: userRow.ultimoTurno, b: confronto.ultimoTurno },
                    ].map((row) => (
                      <div key={row.label}>
                        <strong>{row.a}</strong>
                        <span>{row.label}</span>
                        <strong>{row.b}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {vista === 'seriea' && (
        <section className="ops-panel seriea-panel">
          <header className="ops-panel__header">
            <div>
              <span className="lux-kicker">Serie A 2025/2026</span>
              <h2>Giornata {serieAMatchday ?? '--'}</h2>
            </div>
            <button type="button" className="btn-secondary" onClick={() => fetchStandings(true)}>Aggiorna</button>
          </header>

          {loadingStandings && <div className="ops-inline-empty">Caricamento classifica reale...</div>}

          {errorStandings && (
            <div className="ops-error">
              {errorStandings.includes('non configurata')
                ? 'Configura VITE_FOOTBALL_DATA_API_KEY nel file .env per vedere la classifica reale.'
                : `Errore: ${errorStandings}`}
            </div>
          )}

          {serieAStandings && !loadingStandings && (
            <div className="rank-table-scroll">
              <table className="data-table rank-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Squadra</th>
                    <th>G</th>
                    <th>V</th>
                    <th>N</th>
                    <th>P</th>
                    <th>GF</th>
                    <th>GS</th>
                    <th>DR</th>
                    <th>Pt</th>
                  </tr>
                </thead>
                <tbody>
                  {serieAStandings.map((team, index) => (
                    <tr key={team.id}>
                      <td><span className={`rank-position${index < 4 ? ' is-podium' : index >= 17 ? ' is-danger' : ''}`}>{team.position}</span></td>
                      <td>
                        <span className="rank-seriea-team">
                          {team.crest && <img src={team.crest} alt="" />}
                          <strong>{team.name}</strong>
                        </span>
                      </td>
                      <td>{team.played}</td>
                      <td className="rank-win">{team.won}</td>
                      <td className="rank-draw">{team.drawn}</td>
                      <td className="rank-loss">{team.lost}</td>
                      <td>{team.goalsFor}</td>
                      <td>{team.goalsAgainst}</td>
                      <td className={team.goalDifference > 0 ? 'rank-win' : team.goalDifference < 0 ? 'rank-loss' : ''}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </td>
                      <td><strong>{team.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="ops-note">Gold: zona Champions. Rosso: zona retrocessione. Dati: football-data.org.</p>
            </div>
          )}
        </section>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box rank-modal" onClick={(event) => event.stopPropagation()}>
            <header className="ops-panel__header">
              <div>
                <span className="lux-kicker">Dettaglio stagione</span>
                <h2>{modal.nome}</h2>
              </div>
              <button type="button" className="rosa-icon-btn" onClick={() => setModal(null)} aria-label="Chiudi dettaglio">x</button>
            </header>

            <div className="rank-modal-grid">
              {[
                { label: 'Punti', value: modal.punti },
                { label: 'Vittorie', value: modal.vittorie },
                { label: 'Pareggi', value: modal.pareggi },
                { label: 'Sconfitte', value: modal.sconfitte },
                { label: 'Media', value: formatMedia(modal.puntimedia) },
                { label: 'Trend', value: getTrend(modal) === 'rise' ? 'In crescita' : 'Stabile' },
              ].map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <span className="lux-kicker">Forma ultimi 5 turni</span>
            <MiniBarChart punti={andamento(modal)} max={maxPunti} />
          </div>
        </div>
      )}
    </div>
  );
}
