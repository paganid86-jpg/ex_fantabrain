// src/components/patterns/NewsPreviewStub.jsx

import { Link } from 'react-router-dom';

function getPlayerName(player) {
  return player?.cognome || player?.nome || 'Giocatore';
}

function getInitials(player) {
  return getPlayerName(player).slice(0, 2).toUpperCase();
}

function getNewsTone(player) {
  if (player?.infortunato) return 'danger';
  if (player?.diffidato) return 'warning';
  if ((player?.votoMedia || 0) >= 7) return 'rise';
  return 'steady';
}

function buildRosterNews(players) {
  return players.slice(0, 8).map((player, index) => {
    const name = getPlayerName(player);
    const media = Number.isFinite(player?.votoMedia) ? player.votoMedia.toFixed(1) : null;

    if (player?.infortunato) {
      return {
        id: player.id || `injury-${index}`,
        initials: getInitials(player),
        name,
        meta: `${player.squadra || 'Rosa'} · ora`,
        title: `${name} da monitorare: gestione fisica prima della deadline.`,
        body: 'Valuta una copertura in panchina e non forzare lo slot se hai alternative sane.',
        tag: 'ALERT',
        tone: 'danger',
      };
    }

    if (player?.diffidato) {
      return {
        id: player.id || `warning-${index}`,
        initials: getInitials(player),
        name,
        meta: `${player.squadra || 'Rosa'} · 18m`,
        title: `${name} in diffida: rischio gestione nel finale.`,
        body: 'Il profilo resta utile, ma pesa il cartellino se la tua giornata è già fragile.',
        tag: 'CHECK',
        tone: 'warning',
      };
    }

    if ((player?.votoMedia || 0) >= 7) {
      return {
        id: player.id || `form-${index}`,
        initials: getInitials(player),
        name,
        meta: `${player.squadra || 'Rosa'} · ${24 + index * 7}m`,
        title: `${name} resta caldo: media ${media} e peso bonus alto.`,
        body: 'Profilo premium per costruire il tuo undici, soprattutto se il match-up resta favorevole.',
        tag: 'RISE',
        tone: 'rise',
      };
    }

    return {
      id: player.id || `steady-${index}`,
      initials: getInitials(player),
      name,
      meta: `${player.squadra || 'Rosa'} · ${32 + index * 6}m`,
      title: `${name}: scenario stabile verso la prossima giornata.`,
      body: 'Buona profondità di rosa, ma il coach suggerisce di confrontarlo con alternative più offensive.',
      tag: 'STEADY',
      tone: getNewsTone(player),
    };
  });
}

export default function NewsPreviewStub({ players = [] }) {
  const rosterNews = buildRosterNews(players);

  return (
    <section className="news-preview news-wire" aria-label="Rosa Wire">
      <header className="news-preview-header">
        <div>
          <span className="news-wire-kicker">Rosa Wire</span>
          <h2 className="section-title">News dalla tua rosa</h2>
        </div>
        <Link to="/news" className="news-preview-cta">Tutte</Link>
      </header>

      {rosterNews.length === 0 ? (
        <Link to="/schieramento?tab=rosa" className="news-preview-card news-wire-empty">
          <span className="news-preview-kicker">ROSA · SETUP</span>
          <span className="news-preview-title">Aggiungi i tuoi giocatori per attivare il feed personale.</span>
          <span className="news-wire-body">Le notizie verranno costruite sui profili presenti nella tua rosa.</span>
        </Link>
      ) : (
        <div className="news-wire-scroll" role="feed" aria-label="Notizie giocatori">
          {rosterNews.map((item) => (
            <Link key={item.id} to="/news" className={`news-wire-card news-wire-card--${item.tone}`}>
              <span className="news-wire-avatar" aria-hidden="true">{item.initials}</span>
              <span className="news-wire-content">
                <span className="news-wire-meta">
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </span>
                <span className="news-preview-title">{item.title}</span>
                <span className="news-wire-body">{item.body}</span>
              </span>
              <span className="news-wire-tag">{item.tag}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
