// src/pages/MatchdayDetail.jsx
import { useParams, Link } from 'react-router-dom';
import useLeagueStore from '../stores/useLeagueStore';

export default function MatchdayDetail() {
  const { n } = useParams();
  const md = Number(n);

  const result = useLeagueStore((s) => {
    const l = s.leagues.find((x) => x.id === s.currentLeagueId);
    return l?.matchdayResults?.find((r) => r.matchday === md) || null;
  });
  const bots = useLeagueStore((s) => {
    const l = s.leagues.find((x) => x.id === s.currentLeagueId);
    return l?.bots || [];
  });

  function teamName(id) {
    if (id === 'user') return 'La mia squadra';
    return bots.find((b) => b.id === id)?.name || id;
  }

  if (!result) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Giornata {md}</h2>
        <p>Giornata non ancora giocata.</p>
        <Link to="/">← Torna alla dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ fontSize: 12 }}>← Dashboard</Link>
      <h2>Giornata {md} {result.voteSourceMode === 'simulated' && <small style={{ color: 'var(--text-muted)' }}>(modalità demo)</small>}</h2>

      <h3>Partite</h3>
      <ul>
        {result.matches.map((m, i) => (
          <li key={i}>
            <strong>{teamName(m.home)}</strong> {m.homeGoals} – {m.awayGoals} <strong>{teamName(m.away)}</strong>
            <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
              ({m.homePts}pt vs {m.awayPts}pt)
            </span>
          </li>
        ))}
      </ul>

      <h3>I tuoi voti</h3>
      <ul>
        {result.teams.user?.rawScores?.map((s, i) => (
          <li key={i}>
            {s.riservaUfficio ? '(riserva d\'ufficio)' : s.playerId}
            : voto {s.voto}
            {s.gol > 0 && `, ${s.gol} gol`}
            {s.assist > 0 && `, ${s.assist} assist`}
            {s.ammonizione > 0 && ', ammonizione'}
            {s.espulsione > 0 && ', espulsione'}
          </li>
        ))}
      </ul>
    </div>
  );
}
