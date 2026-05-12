import { useEffect, useMemo, useState } from 'react';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
import { RUOLI_MANTRA } from '../data/mockData';
import { reportScouting } from '../lib/claudeApi';

const FASCE = [
  { label: 'Tutti', val: '' },
  { label: '< 10M', val: 'bassa' },
  { label: '10-20M', val: 'media' },
  { label: '20-30M', val: 'alta' },
  { label: '> 30M', val: 'top' },
];

const POSITION_TO_MANTRA = {
  Goalkeeper: 'Por',
  Defence: 'DC',
  Midfield: 'C',
  Offence: 'A',
};

const QUOTA_RANGE = {
  Goalkeeper: [8, 22],
  Defence: [6, 20],
  Midfield: [8, 26],
  Offence: [12, 40],
};

const MEDIA_RANGE = {
  Goalkeeper: [6.1, 6.9],
  Defence: [6.0, 6.8],
  Midfield: [6.2, 7.1],
  Offence: [6.4, 7.5],
};

function stimaStats(player) {
  const seed = (player.id * 7 + 13) % 100;
  const position = player.position || 'Midfield';
  const [minQ, maxQ] = QUOTA_RANGE[position] || [8, 20];
  const [minM, maxM] = MEDIA_RANGE[position] || [6.2, 6.9];

  const quota = minQ + Math.round((seed / 100) * (maxQ - minQ));
  const media = +(minM + (seed / 100) * (maxM - minM)).toFixed(1);
  const votiUltimi5 = Array.from({ length: 5 }, (_, index) => {
    const raw = media + ((seed * (index + 3)) % 20) * 0.05 - 0.5;
    return Math.round(Math.max(5.0, Math.min(8.5, raw)) * 10) / 10;
  });

  return {
    votoMedia: media,
    quotazione: quota,
    votiUltimi5,
    infortunato: seed % 16 === 0,
    diffidato: seed % 9 === 0,
  };
}

function splitName(fullName = '') {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return { nome: '', cognome: parts[0] };
  return {
    nome: parts.slice(0, -1).join(' '),
    cognome: parts[parts.length - 1],
  };
}

function estraiConsiglio(testo) {
  if (!testo) return 'FORSE';
  const upper = testo.toUpperCase();
  if (upper.includes('CONSIGLIO: SI') || upper.includes('ACQUISTO: SI')) return 'SI';
  if (upper.includes('CONSIGLIO: NO') || upper.includes('ACQUISTO: NO')) return 'NO';
  return 'FORSE';
}

function getPlayerName(player) {
  return `${player.nome || ''} ${player.cognome || ''}`.trim() || 'Giocatore';
}

function VotiDots({ voti }) {
  return (
    <div className="scout-vote-dots" aria-label="Ultimi voti">
      {(voti || []).map((vote, index) => {
        const tone = vote >= 7 ? 'rise' : vote >= 6 ? 'steady' : 'risk';
        return <span key={`${vote}-${index}`} className={`scout-vote-dot scout-vote-dot--${tone}`} title={vote.toString()} />;
      })}
    </div>
  );
}

function GiocatoreCard({
  player,
  inRosa,
  onAggiungi,
  onGeneraReport,
  reportStato,
  onSeleziona,
  isSelezionato,
  canGenerateReport,
}) {
  return (
    <article className={`ops-panel scout-player-card${isSelezionato ? ' is-selected' : ''}${player.infortunato ? ' is-injured' : ''}`}>
      <header className="scout-player-card__header">
        <div>
          <span className="lux-kicker">{player.squadra}</span>
          <h2>{getPlayerName(player)}</h2>
        </div>
        <div className="scout-player-card__price">
          <strong>{player.quotazione}M</strong>
          <span>{player.ruoloMantra}</span>
        </div>
      </header>

      <div className="scout-player-card__metrics">
        <div>
          <span>Media</span>
          <strong>{player.votoMedia.toFixed(1)}</strong>
        </div>
        <div>
          <span>Ultimi 5</span>
          <VotiDots voti={player.votiUltimi5} />
        </div>
      </div>

      <div className="scout-player-card__status">
        {player.infortunato && <span className="ops-badge ops-badge--red">Infortunato</span>}
        {player.diffidato && <span className="ops-badge ops-badge--amber">Diffida</span>}
        {!player.infortunato && !player.diffidato && <span className="ops-badge">Disponibile</span>}
      </div>

      <div className="scout-player-card__actions">
        <button
          type="button"
          onClick={() => onGeneraReport(player)}
          className="home-lux-hero__cta scout-ai-btn"
          disabled={reportStato?.loading || !canGenerateReport}
        >
          {reportStato?.loading ? 'Report...' : canGenerateReport ? 'Report AI' : 'Crediti 0'}
        </button>
        <button
          type="button"
          onClick={() => onSeleziona(player)}
          className={`btn-secondary${isSelezionato ? ' is-selected' : ''}`}
        >
          {isSelezionato ? 'Selez.' : 'VS'}
        </button>
        <button
          type="button"
          onClick={() => onAggiungi(player)}
          className="btn-secondary"
          disabled={inRosa}
        >
          {inRosa ? 'In rosa' : '+'}
        </button>
      </div>

      {reportStato?.error && <div className="ops-error">{reportStato.error}</div>}
      {reportStato?.testo && (
        <div className="ai-response scout-ai-response">
          <div className="scout-ai-response__header">
            <span>Report scouting AI</span>
            {reportStato.consiglio && (
              <strong className={`is-${reportStato.consiglio.toLowerCase()}`}>
                Acquista: {reportStato.consiglio}
              </strong>
            )}
          </div>
          <p>{reportStato.testo}</p>
        </div>
      )}
    </article>
  );
}

export default function Scouting() {
  const rosa = useAppStore((s) => s.rosa);
  const addGiocatore = useAppStore((s) => s.addGiocatore);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const teams = useSerieAStore((s) => s.teams);
  const loading = useSerieAStore((s) => s.loading);
  const errors = useSerieAStore((s) => s.errors);
  const fetchTeams = useSerieAStore((s) => s.fetchTeams);

  const [cerca, setCerca] = useState('');
  const [filtroRuolo, setFiltroRuolo] = useState('Tutti');
  const [filtroSquadra, setFiltroSquadra] = useState('Tutte');
  const [filtroFascia, setFiltroFascia] = useState('');
  const [escludiInRosa, setEscludiInRosa] = useState(
    () => sessionStorage.getItem('scouting-escludi-rosa') === 'true'
  );
  const [report, setReport] = useState({});
  const [confronto, setConfronto] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const allPlayers = useMemo(() => {
    if (!teams.length) return [];
    return teams.flatMap((team) =>
      (team.squad || []).map((player) => {
        const { nome, cognome } = splitName(player.name);
        return {
          id: player.id,
          nome,
          cognome,
          ruoloMantra: POSITION_TO_MANTRA[player.position] || 'C',
          squadra: team.shortName || team.name,
          ...stimaStats(player),
        };
      })
    );
  }, [teams]);

  const squadreDisponibili = useMemo(
    () => [...new Set(allPlayers.map((player) => player.squadra))].sort(),
    [allPlayers]
  );

  const rosaIds = useMemo(() => new Set(rosa.map((player) => player.id)), [rosa]);

  const filtrati = useMemo(() => allPlayers.filter((player) => {
    if (escludiInRosa && rosaIds.has(player.id)) return false;
    if (filtroRuolo !== 'Tutti' && player.ruoloMantra !== filtroRuolo) return false;
    if (filtroSquadra !== 'Tutte' && player.squadra !== filtroSquadra) return false;
    if (filtroFascia === 'bassa' && player.quotazione >= 10) return false;
    if (filtroFascia === 'media' && (player.quotazione < 10 || player.quotazione > 20)) return false;
    if (filtroFascia === 'alta' && (player.quotazione <= 20 || player.quotazione > 30)) return false;
    if (filtroFascia === 'top' && player.quotazione <= 30) return false;
    if (cerca && !getPlayerName(player).toLowerCase().includes(cerca.toLowerCase())) return false;
    return true;
  }), [allPlayers, filtroRuolo, filtroSquadra, filtroFascia, cerca, escludiInRosa, rosaIds]);

  async function generaReport(player) {
    setReport((state) => ({ ...state, [player.id]: { loading: true, testo: null, error: null } }));
    try {
      const testo = await reportScouting(player);
      const consiglio = estraiConsiglio(testo);
      setReport((state) => ({ ...state, [player.id]: { loading: false, testo, consiglio, error: null } }));
    } catch {
      setReport((state) => ({
        ...state,
        [player.id]: { loading: false, testo: null, error: 'Report non disponibile. Riprova più tardi.' },
      }));
    }
  }

  function aggiungiARosa(player) {
    if (!rosaIds.has(player.id)) addGiocatore(player);
  }

  function toggleConfronto(player) {
    setConfronto((previous) => {
      if (previous.find((item) => item.id === player.id)) return previous.filter((item) => item.id !== player.id);
      if (previous.length >= 2) return [previous[1], player];
      return [...previous, player];
    });
  }

  function toggleEscludiRosa() {
    setEscludiInRosa((previous) => {
      const next = !previous;
      sessionStorage.setItem('scouting-escludi-rosa', String(next));
      return next;
    });
  }

  const topTargets = filtrati.slice(0, 4);

  if (loading.teams && allPlayers.length === 0) {
    return (
      <div className="ops-page scout-page">
        <section className="ops-empty">
          <span className="lux-kicker">Scouting</span>
          <h1>Caricamento giocatori Serie A...</h1>
          <p>Recupero rose delle squadre dall'API.</p>
        </section>
      </div>
    );
  }

  if (errors.teams && allPlayers.length === 0) {
    return (
      <div className="ops-page scout-page">
        <section className="ops-empty">
          <span className="lux-kicker">Scouting</span>
          <h1>Errore caricamento giocatori.</h1>
          <p>{errors.teams}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="ops-page scout-page">
      <section className="ops-hero scout-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Scouting</span>
          <h1>Player radar.</h1>
          <p>
            Cerca profili Serie A, confronta due obiettivi e genera report AI
            prima di aggiungerli alla rosa.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="ops-stat-grid" aria-label="Sintesi scouting">
        <div className="ops-stat">
          <span>Pool</span>
          <strong>{allPlayers.length}</strong>
          <small>profili Serie A</small>
        </div>
        <div className="ops-stat">
          <span>Filtrati</span>
          <strong>{filtrati.length}</strong>
          <small>target visibili</small>
        </div>
        <div className="ops-stat">
          <span>Crediti AI</span>
          <strong>{aiCrediti}</strong>
          <small>report disponibili</small>
        </div>
      </section>

      <section className="ops-panel scout-filter-panel">
        <div className="scout-search-row">
          <input
            className="input-field"
            placeholder="Cerca giocatore Serie A..."
            value={cerca}
            onChange={(event) => setCerca(event.target.value)}
          />
          <button type="button" className={`scout-toggle${escludiInRosa ? ' is-active' : ''}`} onClick={toggleEscludiRosa}>
            <span aria-hidden="true" />
            Escludi in rosa
          </button>
        </div>
        <div className="market-filter-grid">
          <select className="input-field" value={filtroRuolo} onChange={(event) => setFiltroRuolo(event.target.value)}>
            <option value="Tutti">Tutti i ruoli</option>
            {RUOLI_MANTRA.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select className="input-field" value={filtroSquadra} onChange={(event) => setFiltroSquadra(event.target.value)}>
            <option value="Tutte">Tutte le squadre</option>
            {squadreDisponibili.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
          <select className="input-field" value={filtroFascia} onChange={(event) => setFiltroFascia(event.target.value)}>
            {FASCE.map((range) => <option key={range.val} value={range.val}>{range.label}</option>)}
          </select>
        </div>
      </section>

      {confronto.length === 2 && (
        <section className="ops-panel scout-compare-panel">
          <header className="ops-panel__header">
            <div>
              <span className="lux-kicker">Confronto</span>
              <h2>{confronto[0].cognome} vs {confronto[1].cognome}</h2>
            </div>
            <button type="button" className="rosa-icon-btn" onClick={() => setConfronto([])} aria-label="Chiudi confronto">x</button>
          </header>
          <div className="scout-compare-grid">
            {[
              { label: 'Media voti', a: confronto[0].votoMedia.toFixed(1), b: confronto[1].votoMedia.toFixed(1) },
              { label: 'Quotazione', a: `${confronto[0].quotazione}M`, b: `${confronto[1].quotazione}M` },
              { label: 'Ruolo', a: confronto[0].ruoloMantra, b: confronto[1].ruoloMantra },
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

      {topTargets.length > 0 && (
        <section className="scout-top-strip" aria-label="Target rapidi">
          {topTargets.map((player) => (
            <button key={player.id} type="button" onClick={() => toggleConfronto(player)}>
              <span>{player.ruoloMantra}</span>
              <strong>{player.cognome}</strong>
              <small>{player.quotazione}M</small>
            </button>
          ))}
        </section>
      )}

      {filtrati.length > 0 ? (
        <section className="scout-player-grid">
          {filtrati.map((player) => (
            <GiocatoreCard
              key={player.id}
              player={player}
              inRosa={rosaIds.has(player.id)}
              onAggiungi={aggiungiARosa}
              onGeneraReport={generaReport}
              reportStato={report[player.id]}
              onSeleziona={toggleConfronto}
              isSelezionato={confronto.some((item) => item.id === player.id)}
              canGenerateReport={aiCrediti > 0}
            />
          ))}
        </section>
      ) : (
        <section className="ops-empty">
          <span className="lux-kicker">Nessun target</span>
          <h2>Nessun giocatore trovato.</h2>
          <p>Prova a modificare ruolo, squadra, prezzo o testo di ricerca.</p>
        </section>
      )}
    </div>
  );
}
