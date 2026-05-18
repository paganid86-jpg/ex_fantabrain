// src/pages/LeagueSettings.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLeagueStore from '../stores/useLeagueStore';

const SECTIONS = [
  { id: 'regolamento', label: 'Regolamento' },
  { id: 'condividi', label: 'Condividi' },
  { id: 'partecipanti', label: 'Partecipanti' },
  { id: 'competizioni', label: 'Competizioni' },
];

function boolLabel(value) {
  return value ? 'Si' : 'No';
}

function SettingList({ title, items }) {
  return (
    <section className="ops-panel league-settings-card">
      <span className="lux-kicker">{title}</span>
      <dl className="league-setting-list">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function LeagueSettings() {
  const league = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId) || null
  );
  const removeParticipant = useLeagueStore((s) => s.removeParticipant);
  const [copied, setCopied] = useState(null);
  const [activeSection, setActiveSection] = useState('regolamento');

  if (!league) {
    return (
      <div className="ops-page league-page">
        <section className="ops-empty">
          <span className="lux-kicker">Lega</span>
          <h1>Nessuna lega selezionata.</h1>
          <p>Crea una nuova lega o unisciti con un codice invito per attivare la control room.</p>
          <div className="ops-empty__actions">
            <Link to="/crea-lega" className="btn-primary">Crea lega</Link>
            <Link to="/" className="btn-secondary">Torna alla Home</Link>
          </div>
        </section>
      </div>
    );
  }

  const settings = league.settings || {};
  const participants = league.participants || [];
  const isAdmin = !!league.isAdmin;
  const availableSeats = Math.max((settings.numPartecipanti || 0) - participants.length, 0);
  const shareText = `Unisciti alla mia lega su FantaBrain AI!\nLega: ${settings.nome}\nCodice: ${league.inviteCode}\nEntra qui: ${league.inviteUrl}`;
  const whatsappMsg = encodeURIComponent(shareText);

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const settingSections = [
    {
      title: 'Opzioni generali',
      items: [
        ['Nome lega', settings.nome || 'Senza nome'],
        ['Tipo', settings.tipo === 'privata' ? 'Privata' : 'Pubblica'],
        ['Partecipanti', `${settings.numPartecipanti || 0} squadre`],
        ['Modalita', settings.modalitaGioco === 'mantra' ? 'Mantra' : 'Classic'],
      ],
    },
    {
      title: 'Rose e formazione',
      items: [
        ['Crediti iniziali', settings.creditiIniziali ?? '--'],
        ['Giocatori rosa', settings.numGiocatoriRosa ?? '--'],
        ['Panchina', settings.numeroPanchina ?? '--'],
        ['Calciatori', settings.disponibilitaCalciatori === 'singola' ? 'Singola' : 'Multipla'],
      ],
    },
    {
      title: 'Calcolo',
      items: [
        ['Fonte voti', settings.fonteVoti || '--'],
        ['D-Factor', boolLabel(settings.dFactor)],
        ['Mod. rendimento', boolLabel(settings.modificatoreRendimento)],
        ['Fair Play', boolLabel(settings.fattoreFairPlay)],
        ['Capitano', boolLabel(settings.fattoreCapitano)],
      ],
    },
    {
      title: 'Sostituzioni',
      items: [
        ['Modalita', settings.modalitaSostituzioni || '--'],
        ['Numero', settings.numSostituzioni ?? '--'],
        ["Riserva d'ufficio", settings.riservaUfficio ? `Si, voto ${settings.votoRiserva}` : 'No'],
      ],
    },
    {
      title: 'Calendario',
      items: [
        ['Tipo', settings.tipoCalendario === 'andata_ritorno' ? 'Andata e ritorno' : "All'italiana"],
        ['Fasce gol', settings.fasceGol || '--'],
      ],
    },
  ];

  return (
    <div className="ops-page league-page">
      <section className="ops-hero league-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">Lega Control Room</span>
          <h1>{settings.nome || 'La tua lega'}</h1>
          <p>
            Regole, inviti, partecipanti e competizioni in una console mobile-first
            pensata per la gestione rapida.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="ops-stat-grid" aria-label="Sintesi lega">
        <div className="ops-stat">
          <span>Posti</span>
          <strong>{participants.length}/{settings.numPartecipanti || 0}</strong>
          <small>{availableSeats} disponibili</small>
        </div>
        <div className="ops-stat">
          <span>Codice</span>
          <strong>{league.inviteCode}</strong>
          <small>{isAdmin ? 'admin attivo' : 'sola lettura'}</small>
        </div>
        <div className="ops-stat">
          <span>Formato</span>
          <strong>{settings.modalitaGioco === 'mantra' ? 'Mantra' : 'Classic'}</strong>
          <small>{settings.tipoCalendario === 'andata_ritorno' ? 'andata/ritorno' : "all'italiana"}</small>
        </div>
      </section>

      <nav className="ops-tabs" aria-label="Sezioni impostazioni lega">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`ops-tab${activeSection === section.id ? ' is-active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {activeSection === 'regolamento' && (
        <div className="ops-section-grid">
          {settingSections.map((section) => (
            <SettingList key={section.title} title={section.title} items={section.items} />
          ))}
          {!isAdmin && (
            <p className="ops-note">Solo l'admin puo modificare le impostazioni della lega.</p>
          )}
        </div>
      )}

      {activeSection === 'condividi' && (
        <section className="ops-panel league-share-panel">
          <div>
            <span className="lux-kicker">Invito privato</span>
            <h2>Porta dentro la tua lega.</h2>
            <p>Il codice vive in localStorage per l'MVP: funziona nello stesso ambiente/browser.</p>
          </div>

          <div className="league-code-card">
            <span>Codice invito</span>
            <strong>{league.inviteCode}</strong>
            <button type="button" className="btn-secondary" onClick={() => copy(league.inviteCode, 'code')}>
              {copied === 'code' ? 'Copiato' : 'Copia codice'}
            </button>
          </div>

          <div className="league-url-row">
            <span>{league.inviteUrl}</span>
            <button type="button" className="btn-secondary" onClick={() => copy(league.inviteUrl, 'url')}>
              {copied === 'url' ? 'Ok' : 'Copia'}
            </button>
          </div>

          <div className="league-share-actions">
            <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(league.inviteUrl)}&text=${encodeURIComponent(`Unisciti alla mia lega FantaBrain: ${settings.nome}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Telegram
            </a>
            <button type="button" className="btn-secondary" onClick={() => copy(league.inviteUrl, 'share')}>
              {copied === 'share' ? 'Link copiato' : 'Copia link'}
            </button>
          </div>
        </section>
      )}

      {activeSection === 'partecipanti' && (
        <section className="ops-panel">
          <header className="ops-panel__header">
            <div>
              <span className="lux-kicker">Partecipanti</span>
              <h2>{participants.length} squadre registrate</h2>
            </div>
            <strong>{availableSeats} posti liberi</strong>
          </header>

          {participants.length === 0 ? (
            <div className="ops-inline-empty">
              <strong>Nessun partecipante ancora.</strong>
              <span>Condividi il codice invito per aprire la lega agli amici.</span>
            </div>
          ) : (
            <div className="league-participant-list">
              {participants.map((participant, index) => (
                <article key={participant.id || index} className="league-participant">
                  <div className="league-participant__avatar">{participant.name?.slice(0, 2).toUpperCase() || 'FB'}</div>
                  <div>
                    <strong>{participant.name || 'Squadra'}</strong>
                    <span>{participant.joinedAt ? new Date(participant.joinedAt).toLocaleDateString('it-IT') : 'Data non disponibile'}</span>
                  </div>
                  {participant.isAdmin && <span className="ops-badge ops-badge--gold">Admin</span>}
                  {isAdmin && !participant.isAdmin && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => removeParticipant(league.id, participant.id)}
                    >
                      Rimuovi
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === 'competizioni' && (
        <section className="ops-competition-grid">
          <article className="ops-panel league-competition is-active">
            <span className="lux-kicker">Competizione principale</span>
            <h2>Campionato</h2>
            <p>Calendario, classifica e giornata corrente restano il cuore operativo della lega.</p>
            <strong>Attivo</strong>
          </article>
          <article className="ops-panel league-competition">
            <span className="lux-kicker">Formato extra</span>
            <h2>Coppa</h2>
            <p>Eliminazione diretta e bracket possono arrivare dopo il motore stagione.</p>
            <strong>Prossimamente</strong>
          </article>
        </section>
      )}
    </div>
  );
}
