import { useState, useRef, useEffect, useMemo } from 'react';
import useSerieAStore from '../../stores/useSerieAStore'; // default export — NO parentesi graffe

const POSITION_LABELS = {
  Goalkeeper: 'Portiere',
  Defence: 'Difensore',
  Midfield: 'Centrocampista',
  Offence: 'Attaccante',
};

// Evidenzia la parte matchata nella stringa
function HighlightMatch({ text, query }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: 'var(--accent-primary)' }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default function PlayerSearchInput({ onPlayerSelect, placeholder = 'Cerca giocatore...' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const teams = useSerieAStore((s) => s.teams);
  const fetchTeams = useSerieAStore((s) => s.fetchTeams);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch teams se non ancora caricati
  useEffect(() => {
    if (!teams || teams.length === 0) fetchTeams();
  }, [fetchTeams]);

  // Appiattisci tutti i giocatori da tutti i team
  const allPlayers = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    return teams.flatMap((team) =>
      (team.squad || []).map((player) => ({
        ...player,
        teamName: team.name,
        teamCrest: team.crest,
      }))
    );
  }, [teams]);

  // Filtra per query
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return allPlayers.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allPlayers]);

  // Apri dropdown solo se query >= 2
  useEffect(() => {
    setIsOpen(query.length >= 2);
    setHighlightedIndex(0);
  }, [query]);

  const handleSelect = (player) => {
    onPlayerSelect(player);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[highlightedIndex]) {
      handleSelect(results[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          background: 'var(--bg-glass)',
          border: `1px solid ${isOpen ? 'var(--border-accent)' : 'var(--border-glass)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '10px var(--space-md)',
          backdropFilter: 'blur(var(--glass-blur))',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isOpen ? 'var(--shadow-glow)' : 'none',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-elevated)',
            backdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-md)',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              Nessun giocatore trovato per "{query}"
            </div>
          ) : (
            results.map((player, idx) => (
              <div
                key={player.id}
                onMouseDown={() => handleSelect(player)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: '10px var(--space-md)',
                  cursor: 'pointer',
                  background: idx === highlightedIndex ? 'var(--accent-muted)' : 'transparent',
                  borderBottom: idx < results.length - 1 ? '1px solid var(--border-glass)' : 'none',
                  transition: 'background 0.15s',
                }}
              >
                {/* Crest squadra */}
                {player.teamCrest ? (
                  <img
                    src={player.teamCrest}
                    alt={player.teamName}
                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '1rem' }}>🟡</span>
                )}
                {/* Info giocatore */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                    <HighlightMatch text={player.name} query={query} />
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {player.teamName} · {POSITION_LABELS[player.position] || player.position}
                    {player.nationality && ` · ${player.nationality}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
