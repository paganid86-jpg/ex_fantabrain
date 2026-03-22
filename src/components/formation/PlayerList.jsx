import { useState } from 'react';
import PlayerToken from './PlayerToken';

export default function PlayerList({ rosa, titolariIds, onPlayerClick, highlightedIds }) {
  const [tab, setTab] = useState('rosa'); // 'rosa' | 'panchina'
  const [search, setSearch] = useState('');

  const nonTitolari = rosa.filter((g) => !titolariIds.includes(g.id));
  const titolari = rosa.filter((g) => titolariIds.includes(g.id));
  const displayed = tab === 'rosa' ? nonTitolari : titolari;

  const filtered = displayed.filter((g) => {
    const q = search.toLowerCase();
    return !q || g.nome?.toLowerCase().includes(q) || g.cognome?.toLowerCase().includes(q) || g.squadra?.toLowerCase().includes(q);
  });

  return (
    <div style={{ width: '160px', background: '#0E0E18', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ffffff10' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ffffff10' }}>
        {['rosa', 'panchina'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 4px', fontSize: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: tab === t ? '#F59E0B' : '#64748B',
              borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent',
            }}
          >
            {t === 'rosa' ? `Rosa (${nonTitolari.length})` : `Panchina (${titolari.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '6px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cerca..."
          style={{ width: '100%', background: '#1E1E2E', border: '1px solid #ffffff15', borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: '#94A3B8', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Player list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '10px', paddingTop: '16px' }}>
            {search ? 'Nessun risultato' : 'Nessun giocatore'}
          </div>
        )}
        {filtered.map((g) => (
          <div
            key={g.id}
            onClick={() => onPlayerClick?.(g.id)}
            style={{
              outline: highlightedIds?.includes(g.id) ? '1px solid #F59E0B' : 'none',
              borderRadius: '6px',
            }}
          >
            <PlayerToken giocatore={g} />
          </div>
        ))}
      </div>
    </div>
  );
}
