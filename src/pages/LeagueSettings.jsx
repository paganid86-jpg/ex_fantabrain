// src/pages/LeagueSettings.jsx
import { useState } from 'react';
import useLeagueStore from '../stores/useLeagueStore';

export default function LeagueSettings() {
  // Selettore reattivo: si ri-renderizza quando leagues o currentLeagueId cambiano
  const league = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId) || null
  );
  const updateLeagueSettings = useLeagueStore((s) => s.updateLeagueSettings);
  const removeParticipant = useLeagueStore((s) => s.removeParticipant);
  const [copied, setCopied] = useState(null);
  const [activeSection, setActiveSection] = useState('regolamento');

  if (!league) {
    return (
      <div style={{ padding: 'var(--space-lg)', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Nessuna lega selezionata.
      </div>
    );
  }

  const isAdmin = league.isAdmin;
  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const whatsappMsg = encodeURIComponent(
    `Unisciti alla mia lega su FantaBrain AI! 🧠⚽\nLega: ${league.settings.nome}\nCodice: ${league.inviteCode}\nEntra qui: ${league.inviteUrl}`
  );

  const sections = [
    { id: 'regolamento', label: '📋 Regolamento' },
    { id: 'condividi', label: '🔗 Condividi' },
    { id: 'partecipanti', label: '👥 Partecipanti' },
    { id: 'competizioni', label: '📊 Competizioni' },
  ];

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
        ⚙️ Impostazioni Lega
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
        {league.settings.nome} {!isAdmin && '· Sola lettura'}
      </p>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${activeSection === s.id ? 'var(--border-accent)' : 'var(--border-glass)'}`,
            background: activeSection === s.id ? 'var(--accent-muted)' : 'var(--bg-glass)', color: activeSection === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeSection === s.id ? 600 : 400,
            backdropFilter: 'blur(var(--glass-blur))', transition: 'all 0.2s',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section: Regolamento */}
      {activeSection === 'regolamento' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {[
            { title: 'Opzioni Generali', items: [
              ['Nome lega', league.settings.nome],
              ['Tipo', league.settings.tipo === 'privata' ? 'Privata' : 'Pubblica'],
              ['Partecipanti', `${league.settings.numPartecipanti} squadre`],
              ['Modalità', league.settings.modalitaGioco === 'mantra' ? 'Mantra' : 'Classic'],
            ]},
            { title: 'Rose e Formazioni', items: [
              ['Crediti iniziali', `${league.settings.creditiIniziali}`],
              ['Giocatori per rosa', `${league.settings.numGiocatoriRosa}`],
              ['Panchina', `${league.settings.numeroPanchina}`],
              ['Disponibilità', league.settings.disponibilitaCalciatori === 'singola' ? 'Singola' : 'Multipla'],
            ]},
            { title: 'Calcolo', items: [
              ['Fonte voti', league.settings.fonteVoti],
              ['D-Factor', league.settings.dFactor ? 'Sì' : 'No'],
              ['Mod. Rendimento', league.settings.modificatoreRendimento ? 'Sì' : 'No'],
              ['Fair Play', league.settings.fattoreFairPlay ? 'Sì' : 'No'],
              ['Capitano', league.settings.fattoreCapitano ? 'Sì' : 'No'],
            ]},
            { title: 'Sostituzioni', items: [
              ['Modalità', league.settings.modalitaSostituzioni],
              ['Numero', `${league.settings.numSostituzioni}`],
              ["Riserva d'ufficio", league.settings.riservaUfficio ? `Sì (voto ${league.settings.votoRiserva})` : 'No'],
            ]},
            { title: 'Calendario', items: [
              ['Tipo', league.settings.tipoCalendario === 'andata_ritorno' ? 'Andata e Ritorno' : "All'italiana"],
              ['Fasce gol', league.settings.fasceGol],
            ]},
          ].map((section) => (
            <div key={section.title} className="glass-card" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-sm)' }}>
                {section.title}
              </h3>
              {section.items.map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          ))}
          {!isAdmin && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
              Solo l'admin può modificare le impostazioni
            </p>
          )}
        </div>
      )}

      {/* Section: Condividi */}
      {activeSection === 'condividi' && (
        <div className="glass-card glass-card--accent" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>🔗 Condividi la Lega</h2>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>CODICE INVITO</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                {league.inviteCode}
              </span>
              <button className="btn-secondary" onClick={() => copy(league.inviteCode, 'code')} style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                {copied === 'code' ? '✓ Copiato' : '📋 Copia'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>URL CONDIVISIBILE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px var(--space-md)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {league.inviteUrl}
              </span>
              <button className="btn-secondary" onClick={() => copy(league.inviteUrl, 'url')} style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }}>
                {copied === 'url' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
              💬 WhatsApp
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(league.inviteUrl)}&text=${encodeURIComponent(`Unisciti alla mia lega FantaBrain: ${league.settings.nome}`)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
              ✈️ Telegram
            </a>
            <button className="btn-secondary" onClick={() => copy(league.inviteUrl, 'share')} style={{ padding: '10px 20px' }}>
              {copied === 'share' ? '✓ Copiato' : '🔗 Copia Link'}
            </button>
          </div>
        </div>
      )}

      {/* Section: Partecipanti */}
      {activeSection === 'partecipanti' && (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>👥 Partecipanti</h2>
            <span style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
              {league.participants.length} / {league.settings.numPartecipanti} posti
            </span>
          </div>

          {league.participants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 'var(--space-sm)' }}>Nessun partecipante ancora.</p>
              <p style={{ fontSize: '0.875rem' }}>Condividi il codice invito per invitare i tuoi amici!</p>
            </div>
          ) : (
            league.participants.map((p, i) => (
              <div key={p.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--border-glass)' }}>
                <div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</span>
                  {p.isAdmin && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'var(--accent-muted)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '9999px' }}>ADMIN</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('it-IT') : '—'}
                  </span>
                  {isAdmin && !p.isAdmin && (
                    <button
                      className="btn-danger"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => removeParticipant(league.id, p.id)}
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Posti disponibili</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{league.settings.numPartecipanti - league.participants.length}</span>
          </div>
        </div>
      )}

      {/* Section: Competizioni */}
      {activeSection === 'competizioni' && (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>📊 Competizioni</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>🏆 Campionato</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Competizione principale · Sempre attiva</p>
              </div>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>ATTIVO</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>🥤 Coppa</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Competizione eliminazione diretta · Opzionale</p>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Prossimamente</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
