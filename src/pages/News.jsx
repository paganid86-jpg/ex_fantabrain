import { Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

function getPlayerName(player) {
  return player?.cognome || player?.nome || 'Giocatore'
}

function getInitials(player) {
  return getPlayerName(player).slice(0, 2).toUpperCase()
}

function getTone(player) {
  if (player?.infortunato) return 'danger'
  if (player?.diffidato) return 'warning'
  if ((player?.votoMedia || 0) >= 7) return 'rise'
  return 'steady'
}

function buildRosterFeed(players) {
  return players.slice(0, 10).map((player, index) => {
    const name = getPlayerName(player)
    const team = player.squadra || 'Rosa'
    const media = Number.isFinite(player?.votoMedia) ? player.votoMedia.toFixed(1) : null

    if (player?.infortunato) {
      return {
        id: player.id || `injury-${index}`,
        initials: getInitials(player),
        meta: `${team} · ora`,
        title: `${name} da monitorare prima della deadline.`,
        body: 'Il feed consiglia una copertura in panchina e un controllo prima del blocco formazione.',
        tag: 'ALERT',
        tone: 'danger',
      }
    }

    if (player?.diffidato) {
      return {
        id: player.id || `warning-${index}`,
        initials: getInitials(player),
        meta: `${team} · 18m`,
        title: `${name} in diffida: rischio gestione nel finale.`,
        body: 'Profilo ancora utilizzabile, ma il cartellino pesa nelle partite ad alta tensione.',
        tag: 'CHECK',
        tone: 'warning',
      }
    }

    if ((player?.votoMedia || 0) >= 7) {
      return {
        id: player.id || `rise-${index}`,
        initials: getInitials(player),
        meta: `${team} · ${24 + index * 7}m`,
        title: `${name} resta caldo${media ? `: media ${media}` : ''}.`,
        body: 'Segnale positivo per costruire l’undici, soprattutto se il match-up resta favorevole.',
        tag: 'RISE',
        tone: 'rise',
      }
    }

    return {
      id: player.id || `steady-${index}`,
      initials: getInitials(player),
      meta: `${team} · ${32 + index * 6}m`,
      title: `${name}: scenario stabile verso la prossima giornata.`,
      body: 'Buona profondità di rosa: il coach suggerisce di confrontarlo con alternative più offensive.',
      tag: 'STEADY',
      tone: getTone(player),
    }
  })
}

export default function News() {
  const rosa = useAppStore((s) => s.rosa)
  const aiCrediti = useAppStore((s) => s.aiCrediti)

  const feed = buildRosterFeed(rosa)
  const alerts = rosa.filter((player) => player.infortunato || player.diffidato)
  const risers = rosa.filter((player) => (player.votoMedia || 0) >= 7)

  return (
    <div className="ops-page news-page">
      <section className="ops-hero news-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Rosa Wire</span>
          <h1>News room.</h1>
          <p>
            Segnali dalla tua rosa, alert utili e magazine AI in una vista
            coerente con il nuovo layout operativo.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="ops-stat-grid" aria-label="Sintesi news">
        <div className="ops-stat">
          <span>Feed</span>
          <strong>{feed.length}</strong>
          <small>segnali rosa</small>
        </div>
        <div className="ops-stat">
          <span>Alert</span>
          <strong>{alerts.length}</strong>
          <small>da controllare</small>
        </div>
        <div className="ops-stat">
          <span>Crediti AI</span>
          <strong>{aiCrediti}</strong>
          <small>per approfondire</small>
        </div>
      </section>

      <section className="news-layout">
        <div className="ops-panel news-feed-panel">
          <header className="ops-panel__header">
            <div>
              <span className="lux-kicker">Pulse</span>
              <h2>Feed personale</h2>
            </div>
            <Link to="/ai-analisi" className="btn-secondary">Chiedi al coach</Link>
          </header>

          {feed.length === 0 ? (
            <div className="news-page-empty">
              <span className="news-page-empty__mark" aria-hidden="true">FB</span>
              <h3>Feed pronto, rosa mancante.</h3>
              <p>Aggiungi i tuoi giocatori per attivare notizie, alert e segnali personalizzati.</p>
              <Link to="/schieramento?tab=rosa" className="home-lux-hero__cta">Aggiungi rosa</Link>
            </div>
          ) : (
            <div className="news-feed-list" role="feed" aria-label="Notizie dalla rosa">
              {feed.map((item) => (
                <article key={item.id} className={`news-page-card news-page-card--${item.tone}`}>
                  <span className="news-page-avatar" aria-hidden="true">{item.initials}</span>
                  <div className="news-page-card__body">
                    <span className="news-page-meta">{item.meta}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <span className="news-wire-tag">{item.tag}</span>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="news-side-stack" aria-label="Monitor news">
          <section className="ops-panel news-pulse-panel">
            <span className="lux-kicker">Monitor</span>
            <h2>Pulse control</h2>
            <div className="news-signal-list">
              <div>
                <span>Forma alta</span>
                <strong>{risers.length}</strong>
              </div>
              <div>
                <span>Rischi rosa</span>
                <strong>{alerts.length}</strong>
              </div>
              <div>
                <span>Copertura</span>
                <strong>{rosa.length}/25</strong>
              </div>
            </div>
          </section>

          <section className="ops-panel news-magazine-panel">
            <span className="lux-kicker">AI Magazine</span>
            <h2>Prossimi moduli</h2>
            <div className="news-magazine-list">
              <article>
                <span>01</span>
                <strong>Rassegna lega</strong>
                <p>Highlights automatici su classifica, calendario e trend giornata.</p>
              </article>
              <article>
                <span>02</span>
                <strong>Mercato watch</strong>
                <p>Segnali su scambi, occasioni e profili da non perdere.</p>
              </article>
              <article>
                <span>03</span>
                <strong>Coach digest</strong>
                <p>Un recap rapido prima della deadline formazione.</p>
              </article>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}
