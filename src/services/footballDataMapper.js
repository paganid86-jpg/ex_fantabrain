// src/services/footballDataMapper.js
// Trasforma i dati da football-data.org nel formato interno FantaBrain.
// Questo mapper isola il formato API esterno dai componenti React.

const POSITION_TO_MANTRA = {
  Goalkeeper: ['Por'],
  Defence: ['DC', 'DD', 'DS'],
  Midfield: ['M', 'C'],
  Offence: ['A', 'PC'],
};

export function mapStandings(apiResponse) {
  const season = apiResponse.season || {};
  const table = apiResponse.standings?.[0]?.table || [];

  return {
    currentMatchday: season.currentMatchday,
    seasonStart: season.startDate,
    seasonEnd: season.endDate,
    teams: table.map((row) => ({
      id: row.team.id,
      name: row.team.name,
      shortName: row.team.shortName || row.team.name,
      crest: row.team.crest,
      position: row.position,
      points: row.points,
      played: row.playedGames,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
    })),
  };
}

export function mapMatches(apiResponse) {
  return (apiResponse.matches || []).map((match) => ({
    id: match.id,
    matchday: match.matchday,
    date: match.utcDate,
    status: match.status,
    homeTeam: {
      id: match.homeTeam.id,
      name: match.homeTeam.name,
      shortName: match.homeTeam.shortName || match.homeTeam.name,
      crest: match.homeTeam.crest,
    },
    awayTeam: {
      id: match.awayTeam.id,
      name: match.awayTeam.name,
      shortName: match.awayTeam.shortName || match.awayTeam.name,
      crest: match.awayTeam.crest,
    },
    score: match.score?.fullTime || { home: null, away: null },
    winner: match.score?.winner || null,
  }));
}

export function mapScorers(apiResponse) {
  return (apiResponse.scorers || []).map((s) => ({
    playerId: s.player.id,
    name: s.player.name,
    nationality: s.player.nationality,
    teamId: s.team.id,
    teamName: s.team.name,
    goals: s.goals || 0,
    assists: s.assists || 0,
    penalties: s.penalties || 0,
    played: s.playedMatches || 0,
  }));
}

export function mapTeamsWithSquad(apiResponse) {
  return (apiResponse.teams || []).map((team) => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName || team.name,
    crest: team.crest,
    squad: (team.squad || []).map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position,
      ruoliMantra: POSITION_TO_MANTRA[player.position] || ['?'],
      dateOfBirth: player.dateOfBirth,
      nationality: player.nationality,
    })),
  }));
}

// Helper: formatta data UTC in italiano
export function formatMatchDate(utcDate) {
  if (!utcDate) return '';
  const d = new Date(utcDate);
  return d.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  });
}

// Helper: status partita → etichetta italiana
export function statusLabel(status) {
  const map = {
    SCHEDULED: 'Da giocare',
    TIMED: 'Programmata',
    IN_PLAY: 'In corso',
    PAUSED: 'Intervallo',
    FINISHED: 'Terminata',
    POSTPONED: 'Rinviata',
    CANCELLED: 'Annullata',
    SUSPENDED: 'Sospesa',
  };
  return map[status] || status;
}
