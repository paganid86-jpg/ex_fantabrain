import { useMemo, useState } from 'react';
import useAppStore from '../store/useAppStore';
import AddPlayerModal from '../components/ui/AddPlayerModal';
import { RUOLI_MANTRA } from '../data/mockData';

const RUOLI_FILTRO = ['Tutti', ...RUOLI_MANTRA];
const RUOLI_KPI = ['Por', 'DC', 'DD', 'DS', 'M/C', 'C', 'T/A', 'PC'];

function getPlayerName(player) {
  return `${player?.nome || ''} ${player?.cognome || ''}`.trim() || 'Giocatore';
}

function getInitials(player) {
  const first = player?.nome?.[0] || '';
  const second = player?.cognome?.[0] || player?.nome?.[1] || '';
  return `${first}${second}`.toUpperCase() || 'FB';
}

function getSafeMedia(player) {
  return Number.isFinite(player?.votoMedia) ? player.votoMedia : 0;
}

function getMediaTone(media) {
  if (media >= 7) return 'rise';
  if (media >= 6) return 'steady';
  return 'risk';
}

function StatoBadge({ infortunato, diffidato }) {
  if (infortunato) return <span className="badge badge-red">Infortunato</span>;
  if (diffidato) return <span className="badge badge-amber">Diffida</span>;
  return <span className="badge badge-green">Disponibile</span>;
}

function VotiDots({ voti = [] }) {
  return (
    <div className="rosa-vote-dots" aria-label="Ultimi voti">
      {voti.slice(0, 5).map((voto, index) => {
        let tone = 'empty';
        if (voto >= 7) tone = 'rise';
        else if (voto >= 6) tone = 'steady';
        else if (voto > 0) tone = 'risk';

        return (
          <span
            key={`${voto}-${index}`}
            className={`rosa-vote-dot rosa-vote-dot--${tone}`}
            title={voto > 0 ? String(voto) : 'SV'}
          />
        );
      })}
    </div>
  );
}

function SortIcon({ active, direction }) {
  if (!active) return <span className="sort-icon" aria-hidden="true">↕</span>;
  return <span className="sort-icon sort-icon--active" aria-hidden="true">{direction === 1 ? '↑' : '↓'}</span>;
}

function DettaglioGiocatore({ giocatore, onModifica, onRimuovi, onClose }) {
  if (!giocatore) return null;

  const votiUltimi5 = giocatore.votiUltimi5 || [];
  const votiValidi = votiUltimi5.filter((voto) => voto > 0);
  const ultimiTre = votiValidi.slice(-3);
  const mediaUltimi3 =
    ultimiTre.length > 0 ? ultimiTre.reduce((sum, voto) => sum + voto, 0) / ultimiTre.length : null;
  const media = getSafeMedia(giocatore);
  const inForma = mediaUltimi3 != null && mediaUltimi3 >= media;
  const statusNote = giocatore.infortunato
    ? 'Giocatore non disponibile per infortunio.'
    : giocatore.diffidato
      ? 'In diffida: attenzione alla prossima ammonizione.'
      : 'Giocatore disponibile e in condizione.';

  return (
    <aside className="rosa-detail-panel" aria-label={`Dettaglio ${getPlayerName(giocatore)}`}>
      <header className="rosa-detail-panel__header">
        <div>
          <span className="lux-kicker">Scheda giocatore</span>
          <h3>{getPlayerName(giocatore)}</h3>
          <p>{giocatore.squadra || 'Squadra non impostata'}</p>
        </div>
        <button type="button" className="rosa-icon-btn" onClick={onClose} aria-label="Chiudi dettaglio">
          x
        </button>
      </header>

      <div className="rosa-detail-panel__badges">
        <StatoBadge infortunato={giocatore.infortunato} diffidato={giocatore.diffidato} />
        {mediaUltimi3 != null && (
          <span className={`badge badge-${inForma ? 'green' : 'red'}`}>
            {inForma ? 'In forma' : 'In calo'}
          </span>
        )}
      </div>

      <dl className="rosa-detail-grid">
        <div>
          <dt>Ruolo</dt>
          <dd>{giocatore.ruoloMantra || '--'}</dd>
        </div>
        <div>
          <dt>Quotazione</dt>
          <dd>{giocatore.quotazione ?? '--'}M</dd>
        </div>
        <div>
          <dt>Media voti</dt>
          <dd>{media.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Media ultimi 3</dt>
          <dd>{mediaUltimi3 != null ? mediaUltimi3.toFixed(1) : '--'}</dd>
        </div>
      </dl>

      <section className="rosa-form-chart" aria-label="Andamento voti ultimi 5">
        <span className="lux-kicker">Andamento voti</span>
        <div className="rosa-form-chart__bars">
          {votiUltimi5.slice(0, 5).map((voto, index) => {
            const height = voto > 0 ? Math.max(((voto - 4) / 6) * 100, 8) : 8;
            const tone = getMediaTone(voto);
            return (
              <span key={`${voto}-${index}`} className={`rosa-form-bar rosa-form-bar--${tone}`}>
                <strong>{voto > 0 ? voto : 'SV'}</strong>
                <i style={{ '--bar-height': `${height}%` }} />
              </span>
            );
          })}
        </div>
      </section>

      <p className="rosa-detail-note">{statusNote}</p>

      <div className="rosa-detail-actions">
        <button type="button" className="btn-secondary" onClick={onModifica}>
          Modifica
        </button>
        <button type="button" className="btn-danger" onClick={onRimuovi}>
          Rimuovi
        </button>
      </div>
    </aside>
  );
}

export default function LaRosa() {
  const rosa = useAppStore((s) => s.rosa);
  const removeGiocatore = useAppStore((s) => s.removeGiocatore);

  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroSquadra, setFiltroSquadra] = useState('');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [cerca, setCerca] = useState('');
  const [sortKey, setSortKey] = useState('cognome');
  const [sortDir, setSortDir] = useState(1);
  const [selezionato, setSelezionato] = useState(null);

  const squadre = useMemo(
    () => [...new Set(rosa.map((giocatore) => giocatore.squadra).filter(Boolean))].sort(),
    [rosa]
  );

  const kpiRuoli = useMemo(
    () =>
      RUOLI_KPI.map((ruolo) => ({
        ruolo,
        count: rosa.filter((giocatore) => giocatore.ruoloMantra?.startsWith(ruolo.split('/')[0])).length,
      })),
    [rosa]
  );

  const summary = useMemo(() => {
    const voti = rosa.map((giocatore) => giocatore.votoMedia).filter(Number.isFinite);
    const media = voti.length > 0 ? voti.reduce((sum, voto) => sum + voto, 0) / voti.length : null;

    return {
      disponibili: rosa.filter((giocatore) => !giocatore.infortunato).length,
      rischi: rosa.filter((giocatore) => giocatore.infortunato || giocatore.diffidato).length,
      media,
    };
  }, [rosa]);

  const rosaFiltrata = useMemo(() => {
    let filtered = [...rosa];
    if (filtroRuolo !== 'Tutti') {
      filtered = filtered.filter((giocatore) => giocatore.ruoloMantra?.includes(filtroRuolo));
    }
    if (filtroSquadra) {
      filtered = filtered.filter((giocatore) => giocatore.squadra === filtroSquadra);
    }
    if (filtroStato === 'infortunati') {
      filtered = filtered.filter((giocatore) => giocatore.infortunato);
    }
    if (filtroStato === 'diffidati') {
      filtered = filtered.filter((giocatore) => giocatore.diffidato);
    }
    if (filtroStato === 'disponibili') {
      filtered = filtered.filter((giocatore) => !giocatore.infortunato);
    }
    if (cerca) {
      const query = cerca.toLowerCase();
      filtered = filtered.filter((giocatore) => getPlayerName(giocatore).toLowerCase().includes(query));
    }

    filtered.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (typeof av === 'number') return (av - bv) * sortDir;
      return av.toString().localeCompare(bv.toString()) * sortDir;
    });

    return filtered;
  }, [rosa, filtroRuolo, filtroSquadra, filtroStato, cerca, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((direction) => direction * -1);
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  function handleRemove(giocatore) {
    if (window.confirm(`Rimuovere ${getPlayerName(giocatore)} dalla rosa?`)) {
      removeGiocatore(giocatore.id);
      if (selezionato?.id === giocatore.id) setSelezionato(null);
    }
  }

  function toggleSelected(giocatore) {
    setSelezionato(selezionato?.id === giocatore.id ? null : giocatore);
  }

  const pageTitle = rosa.length === 0 ? 'Costruisci la tua squadra.' : 'La Rosa';
  const pageCopy =
    rosa.length === 0
      ? 'Inserisci i tuoi giocatori reali per sbloccare schieramento, news e analisi AI.'
      : 'Profondita, forma e rischi pronti per lo schieramento.';

  return (
    <div className="rosa-lux-page">
      <header className={`rosa-lux-hero${rosa.length === 0 ? ' rosa-lux-hero--empty' : ''}`}>
        <div className="rosa-lux-hero__copy">
          <span className="lux-kicker">Rosa Mantra</span>
          <h2>{pageTitle}</h2>
          <p>{pageCopy}</p>
        </div>
        <button type="button" className="rosa-lux-add" onClick={() => setShowAdd(true)}>
          {rosa.length === 0 ? 'Aggiungi il primo giocatore' : 'Aggiungi giocatore'}
        </button>
      </header>

      {rosa.length === 0 ? (
        <section className="rosa-empty-wrap">
          <div className="empty-state rosa-empty-state">
            <div className="empty-state-icon" aria-hidden="true">FB</div>
            <div className="empty-state-title">La tua rosa e vuota</div>
            <div className="empty-state-desc">
              Aggiungi i tuoi giocatori per iniziare. La rosa resta salvata localmente.
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="rosa-lux-stats" aria-label="Sintesi rosa">
            <div>
              <span>Totale</span>
              <strong>{rosa.length}</strong>
            </div>
            <div>
              <span>Disponibili</span>
              <strong>{summary.disponibili}</strong>
            </div>
            <div>
              <span>Media</span>
              <strong>{summary.media != null ? summary.media.toFixed(1) : '--'}</strong>
            </div>
            <div>
              <span>Rischi</span>
              <strong>{summary.rischi}</strong>
            </div>
          </section>

          <section className="rosa-role-strip" aria-label="Distribuzione ruoli">
            {kpiRuoli.map((kpi) => (
              <div key={kpi.ruolo} className="rosa-role-chip">
                <strong>{kpi.count}</strong>
                <span>{kpi.ruolo}</span>
              </div>
            ))}
          </section>

          <section className="rosa-filter-bar" aria-label="Filtri rosa">
            <input
              className="input-field"
              placeholder="Cerca giocatore..."
              value={cerca}
              onChange={(event) => setCerca(event.target.value)}
            />
            <select className="input-field" value={filtroRuolo} onChange={(event) => setFiltroRuolo(event.target.value)}>
              {RUOLI_FILTRO.map((ruolo) => (
                <option key={ruolo} value={ruolo}>
                  {ruolo}
                </option>
              ))}
            </select>
            <select
              className="input-field"
              value={filtroSquadra}
              onChange={(event) => setFiltroSquadra(event.target.value)}
            >
              <option value="">Tutte le squadre</option>
              {squadre.map((squadra) => (
                <option key={squadra} value={squadra}>
                  {squadra}
                </option>
              ))}
            </select>
            <select className="input-field" value={filtroStato} onChange={(event) => setFiltroStato(event.target.value)}>
              <option value="tutti">Tutti gli stati</option>
              <option value="disponibili">Disponibili</option>
              <option value="infortunati">Infortunati</option>
              <option value="diffidati">Diffidati</option>
            </select>
          </section>

          <div className={`rosa-lux-layout${selezionato ? ' has-detail' : ''}`}>
            <div className="rosa-lux-main">
              <div className="rosa-mobile-list" aria-label="Giocatori filtrati">
                {rosaFiltrata.map((giocatore) => {
                  const selected = selezionato?.id === giocatore.id;
                  const media = getSafeMedia(giocatore);
                  const tone = getMediaTone(media);

                  return (
                    <article key={giocatore.id} className={`rosa-player-card${selected ? ' is-selected' : ''}`}>
                      <button
                        type="button"
                        className="rosa-player-card__open"
                        onClick={() => toggleSelected(giocatore)}
                        aria-label={`Apri dettagli ${getPlayerName(giocatore)}`}
                      >
                        <span className="rosa-player-card__avatar" aria-hidden="true">
                          {getInitials(giocatore)}
                        </span>
                        <span className="rosa-player-card__body">
                          <span className="rosa-player-card__top">
                            <strong>{getPlayerName(giocatore)}</strong>
                            <span className={`rosa-player-card__media rosa-player-card__media--${tone}`}>
                              {media.toFixed(1)}
                            </span>
                          </span>
                          <span className="rosa-player-card__meta">
                            {giocatore.ruoloMantra || '--'} · {giocatore.squadra || 'Squadra'} · {giocatore.quotazione ?? '--'}M
                          </span>
                          <span className="rosa-player-card__foot">
                            <VotiDots voti={giocatore.votiUltimi5} />
                            <StatoBadge infortunato={giocatore.infortunato} diffidato={giocatore.diffidato} />
                          </span>
                        </span>
                      </button>
                      <span className="rosa-player-card__actions">
                        <button
                          type="button"
                          onClick={() => setEditPlayer(giocatore)}
                          aria-label={`Modifica ${getPlayerName(giocatore)}`}
                        >
                          Mod.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(giocatore)}
                          aria-label={`Rimuovi ${getPlayerName(giocatore)}`}
                        >
                          Rim.
                        </button>
                      </span>
                    </article>
                  );
                })}
                {rosaFiltrata.length === 0 && (
                  <div className="rosa-empty-results">Nessun giocatore trovato con i filtri selezionati.</div>
                )}
              </div>

              <div className="glass-card rosa-table-card">
                <div className="rosa-table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {[
                          ['ruoloMantra', 'Ruolo'],
                          ['cognome', 'Nome'],
                          ['squadra', 'Squadra'],
                          ['quotazione', 'Quota'],
                          ['votoMedia', 'Media'],
                        ].map(([key, label]) => (
                          <th key={key}>
                            <button type="button" className="rosa-sort-btn" onClick={() => handleSort(key)}>
                              {label}
                              <SortIcon active={sortKey === key} direction={sortDir} />
                            </button>
                          </th>
                        ))}
                        <th>Ultimi 5</th>
                        <th>Stato</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosaFiltrata.map((giocatore) => {
                        const selected = selezionato?.id === giocatore.id;
                        const media = getSafeMedia(giocatore);
                        const tone = getMediaTone(media);

                        return (
                          <tr
                            key={giocatore.id}
                            className={selected ? 'is-selected' : ''}
                            onClick={() => toggleSelected(giocatore)}
                          >
                            <td>
                              <span className="badge badge-muted">{giocatore.ruoloMantra || '--'}</span>
                            </td>
                            <td>
                              <strong>{getPlayerName(giocatore)}</strong>
                            </td>
                            <td>{giocatore.squadra || '--'}</td>
                            <td>{giocatore.quotazione ?? '--'}M</td>
                            <td>
                              <span className={`rosa-table-media rosa-table-media--${tone}`}>{media.toFixed(1)}</span>
                            </td>
                            <td>
                              <VotiDots voti={giocatore.votiUltimi5} />
                            </td>
                            <td>
                              <StatoBadge infortunato={giocatore.infortunato} diffidato={giocatore.diffidato} />
                            </td>
                            <td onClick={(event) => event.stopPropagation()}>
                              <div className="rosa-table-actions">
                                <button type="button" onClick={() => setEditPlayer(giocatore)}>
                                  Modifica
                                </button>
                                <button type="button" onClick={() => handleRemove(giocatore)}>
                                  Rimuovi
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {rosaFiltrata.length === 0 && (
                  <div className="rosa-empty-results">Nessun giocatore trovato con i filtri selezionati.</div>
                )}
              </div>
            </div>

            {selezionato && (
              <DettaglioGiocatore
                giocatore={selezionato}
                onClose={() => setSelezionato(null)}
                onModifica={() => {
                  setEditPlayer(selezionato);
                  setSelezionato(null);
                }}
                onRimuovi={() => handleRemove(selezionato)}
              />
            )}
          </div>
        </>
      )}

      {showAdd && <AddPlayerModal onClose={() => setShowAdd(false)} />}
      {editPlayer && <AddPlayerModal onClose={() => setEditPlayer(null)} giocatoreEsistente={editPlayer} />}
    </div>
  );
}
