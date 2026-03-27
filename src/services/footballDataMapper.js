// src/services/footballDataMapper.js
// Trasforma i dati da API-Football (RapidAPI) nel formato interno FantaBrain.
// Questo mapper isola il formato API esterno dai componenti React.

// Converte "Regular Season - 28" → 28
function parseMatchday(roundString) {
  if (!roundString) return null;
  const m = roundString.match(/(\d+)$/);
  return m ? parseInt(m[1]) : null;
}

// Mappa gli status API-Football → formato interno (compatibile con football-data.org)
const STATUS_MAP = {
  NS:   'SCHEDULED',
  TBD:  'SCHEDULED',
  '1H': 'IN_PLAY',
  '2H': 'IN_PLAY',
  HT:   'PAUSED',
  ET:   'IN_PLAY',
  BT:   'PAUSED',
  P:    'IN_PLAY',
  INT:  'PAUSED',
  SUSP: 'SUSPENDED',
  FT:   'FINISHED',
  AET:  'FINISHED',
  PEN:  'FINISHED',
  AWD:  'FINISHED',
  WO:   'FINISHED',
  PST:  'POSTPONED',
  CANC: 'CANCELLED',
  ABD:  'CANCELLED',
};

const POSITION_TO_MANTRA = {
  Goalkeeper: ['Por'],
  Defender:   ['DC', 'DD', 'DS'],
  Midfielder: ['M', 'C'],
  Attacker:   ['A', 'PC'],
};

export function mapStandings(apiResponse) {
  const leagueData = apiResponse.response?.[0]?.league;
  const table = leagueData?.standings?.[0] || [];

  return {
    currentMatchday: null, // derivato dai fixtures in mapMatches
    seasonStart: null,
    seasonEnd: null,
    teams: table.map((row) => ({
      id: row.team.id,
      name: row.team.name,
      shortName: row.team.name,
      crest: row.team.logo,
      position: row.rank,
      points: row.points,
      played: row.all.played,
      won: row.all.win,
      drawn: row.all.draw,
      lost: row.all.lose,
      goalsFor: row.all.goals.for,
      goalsAgainst: row.all.goals.against,
      goalDifference: row.goalsDiff,
    })),
  };
}

export function mapMatches(apiResponse) {
  return (apiResponse.response || []).map((item) => ({
    id: item.fixture.id,
    matchday: parseMatchday(item.league.round),
    date: item.fixture.date,
    status: STATUS_MAP[item.fixture.status.short] || item.fixture.status.short,
    homeTeam: {
      id: item.teams.home.id,
      name: item.teams.home.name,
      shortName: item.teams.home.name,
      crest: item.teams.home.logo,
    },
    awayTeam: {
      id: item.teams.away.id,
      name: item.teams.away.name,
      shortName: item.teams.away.name,
      crest: item.teams.away.logo,
    },
    score: {
      home: item.goals.home,
      away: item.goals.away,
    },
    winner: item.teams.home.winner
      ? 'HOME_TEAM'
      : item.teams.away.winner
      ? 'AWAY_TEAM'
      : item.goals.home != null && item.goals.home === item.goals.away
      ? 'DRAW'
      : null,
  }));
}

// Ricava la giornata corrente dai match mappati (ultima giornata con partite FINISHED)
export function extractCurrentMatchday(mappedMatches) {
  const finishedDays = mappedMatches
    .filter((m) => m.status === 'FINISHED' && m.matchday != null)
    .map((m) => m.matchday);
  return finishedDays.length > 0 ? Math.max(...finishedDays) : null;
}

export function mapScorers(apiResponse) {
  return (apiResponse.response || []).map((item) => ({
    playerId: item.player.id,
    name: item.player.name,
    nationality: item.player.nationality,
    teamId: item.statistics[0]?.team.id,
    teamName: item.statistics[0]?.team.name,
    goals: item.statistics[0]?.goals.total || 0,
    assists: item.statistics[0]?.goals.assists || 0,
    penalties: item.statistics[0]?.penalty?.scored || 0,
    played: item.statistics[0]?.games.appearences || 0,
  }));
}

export function mapTeamsWithSquad(teamsResponse, squadsMap = {}) {
  return (teamsResponse.response || []).map((item) => ({
    id: item.team.id,
    name: item.team.name,
    shortName: item.team.name,
    crest: item.team.logo,
    squad: (squadsMap[item.team.id] || []).map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position,
      ruoliMantra: POSITION_TO_MANTRA[player.position] || ['?'],
      dateOfBirth: player.dateOfBirth || null,
      nationality: player.nationality,
    })),
  }));
}

// Helper: formatta data ISO in italiano
export function formatMatchDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  });
}

// Helper: status interno → etichetta italiana
export function statusLabel(status) {
  const map = {
    SCHEDULED:  'Da giocare',
    TIMED:      'Programmata',
    IN_PLAY:    'In corso',
    PAUSED:     'Intervallo',
    FINISHED:   'Terminata',
    POSTPONED:  'Rinviata',
    CANCELLED:  'Annullata',
    SUSPENDED:  'Sospesa',
  };
  return map[status] || status;
}
