import { useState } from 'react';
import './LuxurySportsOSPreview.css';

const modules = ['3-4-2-1', '3-4-3', '3-5-2', '4-2-3-1', '4-3-1-2', '4-3-3', '4-4-2'];

const homeHighlights = [
  { label: 'Punti ultima', value: '87', meta: '+8.4 vs media', trend: 'positive' },
  { label: 'Posizione', value: '2', meta: 'a 4 punti dal primo', trend: 'neutral' },
  { label: 'Slot vuoti', value: '1', meta: 'chiudi la formazione', trend: 'negative' },
];

const previousDayDigest = {
  day: 'Sabato',
  updatedAt: 'Aggiornata 08:30',
  events: ['Formazione inserita', 'Assist di Barella', 'Clean sheet Inter', 'Dybala gestito'],
};

const squadNews = [
  {
    player: 'Lookman',
    club: 'Atalanta',
    stamp: '2m',
    impact: 'hot',
    headline: 'Seduta brillante: confermato nel blocco offensivo titolare.',
    body: 'Segnali forti sul volume offensivo. Profilo da tenere centrale nel match day.',
  },
  {
    player: 'Dybala',
    club: 'Roma',
    stamp: '11m',
    impact: 'watch',
    headline: 'Gestione dei carichi, ma lo staff filtra fiducia sulla presenza.',
    body: 'Non e un allarme rosso, ma conviene monitorare fino alla rifinitura.',
  },
  {
    player: 'Calhanoglu',
    club: 'Inter',
    stamp: '28m',
    impact: 'rise',
    headline: 'Provati piazzati e rigori: cresce il suo peso nel pacchetto bonus.',
    body: 'Il floor resta alto, ma in questa giornata ha anche upside premium.',
  },
  {
    player: 'Bremer',
    club: 'Juventus',
    stamp: '44m',
    impact: 'steady',
    headline: 'Allenamento pieno e segnali puliti dal reparto difensivo.',
    body: 'Slot da stabilita: meno picco, piu protezione sul voto base.',
  },
];

const lineupRows = [
  [
    { code: 'DI G', role: 'POR', score: '6.5', club: 'INT', captain: true },
    { code: 'BREM', role: 'DC', score: '6.8', club: 'JUV' },
    { code: 'BAST', role: 'DC', score: '6.4', club: 'INT' },
    { code: 'BELL', role: 'DD', score: '6.2', club: 'TOR' },
  ],
  [
    { code: 'KOOP', role: 'M/C', score: '7.1', club: 'JUV' },
    { code: 'CALH', role: 'M', score: '6.9', club: 'INT' },
    { code: 'PULI', role: 'A', score: '7.4', club: 'MIL' },
  ],
  [
    { code: 'DYB', role: 'A', score: '7.8', club: 'ROM' },
    { code: 'LOOK', role: 'A', score: '8.1', club: 'ATA', hot: true },
    { code: 'OSI', role: 'PC', score: '7.2', club: 'NAP' },
  ],
];

const benchPlayers = [
  { code: 'SVI', role: 'POR', score: '6.0', club: 'TOR' },
  { code: 'THEO', role: 'DS', score: '6.7', club: 'MIL' },
  { code: 'ORSO', role: 'W', score: '6.4', club: 'BOL' },
  { code: 'COLP', role: 'T', score: '6.3', club: 'MON' },
  { code: 'ZACC', role: 'A', score: '6.8', club: 'LAZ' },
  { code: 'GUDM', role: 'A', score: '6.6', club: 'FIO' },
];

const aiInsights = [
  'Passa al 4-3-1-2 se vuoi aumentare il floor del centrocampo.',
  'Lookman e Dybala sono il tuo nucleo premium: non separarli nel match day.',
  'La difesa rende bene ma non ha upside: tieni una slot offensiva in panchina.',
];

function DeviceFrame({ eyebrow, title, children, tone = 'dark' }) {
  return (
    <section className={`lux-device lux-device--${tone}`}>
      <div className="lux-device__notch" />
      <header className="lux-device__header">
        <div>
          <span className="lux-device__eyebrow">{eyebrow}</span>
          <h2 className={`lux-device__title lux-device__title--${tone}`}>{title}</h2>
        </div>
        <div className="lux-device__chip">Premium</div>
      </header>
      <div className="lux-device__body">{children}</div>
      <nav className="lux-device__nav" aria-label="Preview navigazione">
        <span className="active">Home</span>
        <span>Schiera</span>
        <span>Pulse</span>
        <span>AI</span>
      </nav>
    </section>
  );
}

function PlayerCard({ player, bench = false }) {
  return (
    <button
      className={`lux-player-card${bench ? ' lux-player-card--bench' : ''}${player.hot ? ' lux-player-card--hot' : ''}`}
      type="button"
    >
      <span className="lux-player-card__topline">
        <span className="lux-player-card__role">{player.role}</span>
        <span className="lux-player-card__score">{player.score}</span>
      </span>
      <strong className="lux-player-card__code">{player.code}</strong>
      <span className="lux-player-card__club">{player.club}</span>
      {player.captain && <span className="lux-player-card__flag">C</span>}
    </button>
  );
}

export default function LuxurySportsOSPreview() {
  const [selectedModule, setSelectedModule] = useState('4-3-3');

  return (
    <div className="luxury-preview">
      <div className="luxury-preview__backdrop" aria-hidden="true" />

      <header className="luxury-preview__hero">
        <div className="luxury-preview__intro">
          <span className="luxury-preview__kicker">Luxury Sports OS</span>
          <h1>Direzione premium, nuova da zero, pensata per FantaBrain.</h1>
          <p>
            Questo mockup esplora un linguaggio piu deciso: superfici scolpite, tipografia alta
            gamma, forte tensione match-day e UX da mobile app premium.
          </p>
        </div>

        <div className="luxury-preview__tokens">
          <div>
            <span>Palette</span>
            <strong>Obsidian, Ivory, Champagne, Signal Red</strong>
          </div>
          <div>
            <span>Tono</span>
            <strong>Elite sport product, non dashboard MVP</strong>
          </div>
          <div>
            <span>UX</span>
            <strong>Pochi layer, gerarchia netta, momenti teatrali</strong>
          </div>
        </div>
      </header>

      <main className="luxury-preview__grid">
        <DeviceFrame eyebrow="Match Center" title="Home">
          <section className="lux-card lux-card--hero">
            <span className="lux-card__eyebrow">Giornata 28 chiusa</span>
            <div className="lux-card__scoreline">
              <span className="lux-card__score">87</span>
              <span className="lux-card__delta lux-card__delta--positive">+8.4 vs media</span>
            </div>
            <p>
              Bella giornata. La squadra ha tenuto un profilo premium dall&apos;inizio alla fine.
            </p>
          </section>

          <section className="lux-stat-row">
            {homeHighlights.map((item) => (
              <article key={item.label} className="lux-stat">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small className={`lux-stat__meta lux-stat__meta--${item.trend}`}>{item.meta}</small>
              </article>
            ))}
          </section>

          <section className="lux-panel lux-panel--paper">
            <div className="lux-panel__header lux-panel__header--paper">
              <div>
                <span className="lux-device__eyebrow">Rosa Wire</span>
                <strong className="lux-paper__title">News feed dei tuoi giocatori</strong>
              </div>
              <span className="lux-panel__link">Scorri</span>
            </div>

            <div className="lux-paper-feed">
              {squadNews.map((item) => (
                <article key={`${item.player}-${item.stamp}`} className="lux-paper-post">
                  <div className="lux-paper-post__avatar">{item.player.slice(0, 2).toUpperCase()}</div>
                  <div className="lux-paper-post__content">
                    <div className="lux-paper-post__meta">
                      <strong>{item.player}</strong>
                      <span>{item.club}</span>
                      <span>{item.stamp}</span>
                    </div>
                    <p className="lux-paper-post__headline">{item.headline}</p>
                    <p className="lux-paper-post__body">{item.body}</p>
                  </div>
                  <span className={`lux-paper-post__impact lux-paper-post__impact--${item.impact}`}>{item.impact}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="lux-panel">
            <div className="lux-panel__header">
              <span className="lux-device__eyebrow">Ieri in rosa</span>
              <span className="lux-panel__link">Apri Pulse</span>
            </div>
            <article className="lux-day-digest">
              <div className="lux-day-digest__date">
                <span>{previousDayDigest.day}</span>
                <small>{previousDayDigest.updatedAt}</small>
              </div>
              <p>
                {previousDayDigest.events.map((event, index) => (
                  <span key={event}>
                    {event}
                    {index === 0 && <strong> OK</strong>}
                    {index < previousDayDigest.events.length - 1 ? ', ' : '.'}
                  </span>
                ))}
              </p>
            </article>
          </section>
        </DeviceFrame>

        <DeviceFrame eyebrow="Lineup Studio" title="Schiera" tone="light">
          <section className="lux-panel lux-panel--contrast">
            <div className="lux-lineup-top">
              <label className="lux-module-control">
                <span className="lux-device__eyebrow">Modulo attivo</span>
                <select value={selectedModule} onChange={(event) => setSelectedModule(event.target.value)}>
                  {modules.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </label>
              <div className="lux-lineup-top__deadline">
                <span className="lux-device__eyebrow">Deadline</span>
                <strong>1h 24m</strong>
              </div>
            </div>

            <div className="lux-pitch">
              {lineupRows.map((row, index) => (
                <div key={index} className="lux-pitch__row">
                  {row.map((player) => (
                    <PlayerCard key={player.code} player={player} />
                  ))}
                </div>
              ))}
            </div>

            <div className="lux-bench">
              {benchPlayers.map((player) => (
                <PlayerCard key={player.code} player={player} bench />
              ))}
            </div>
          </section>

          <section className="lux-cta-bar">
            <div>
              <strong>1 slot da completare</strong>
              <p>Metti il centravanti premium e chiudi la formazione.</p>
            </div>
            <button type="button">Completa</button>
          </section>
        </DeviceFrame>

        <DeviceFrame eyebrow="Private Analyst" title="AI Coach">
          <section className="lux-chat">
            <article className="lux-chat__bubble lux-chat__bubble--assistant">
              <span className="lux-chat__tag">Coach</span>
              <p>
                Ho rivisto il tuo undici: la squadra ha una base premium, ma il vantaggio vero lo
                ottieni cambiando il profilo del terzo attaccante.
              </p>
            </article>

            <article className="lux-insight">
              <span className="lux-device__eyebrow">Insight Pack</span>
              <ul>
                {aiInsights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="lux-insight__actions">
                <button type="button">Applica</button>
                <button type="button" className="ghost">
                  Approfondisci
                </button>
              </div>
            </article>

            <article className="lux-chat__bubble lux-chat__bubble--user">
              <p>Se vuoi massimizzare il picco, chi tolgo per primo?</p>
            </article>
          </section>

          <section className="lux-input-bar">
            <span>Fai una domanda al tuo coach</span>
            <button type="button">Invia</button>
          </section>
        </DeviceFrame>
      </main>
    </div>
  );
}
