// src/services/footballApi.js
// Client HTTP per API-Football (RapidAPI) — Serie A 2025/2026
// Tutte le chiamate passano dal proxy Express (/api/football) che aggiunge
// i header X-RapidAPI-Key e X-RapidAPI-Host server-side.

const BASE_URL = '/api/football';
const LEAGUE_ID = 135;  // Serie A
const SEASON = 2025;    // stagione 2025/2026

async function apiFetch(path) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (response.status === 429) {
    // Quota giornaliera superata — aspetta 60s e riprova una volta
    await new Promise((resolve) => setTimeout(resolve, 60000));
    return apiFetch(path);
  }

  if (!response.ok) {
    throw new Error(`Football API ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// === ENDPOINT ===

export const getStandings = () =>
  apiFetch(`/standings?league=${LEAGUE_ID}&season=${SEASON}`);

export const getMatches = (params = {}) => {
  const qs = new URLSearchParams({ league: LEAGUE_ID, season: SEASON, ...params }).toString();
  return apiFetch(`/fixtures?${qs}`);
};

export const getMatchesByMatchday = (matchday) =>
  apiFetch(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}&round=Regular+Season+-+${matchday}`);

export const getScorers = (limit = 20) =>
  apiFetch(`/players/topscorers?league=${LEAGUE_ID}&season=${SEASON}`);

export const getTeams = () =>
  apiFetch(`/teams?league=${LEAGUE_ID}&season=${SEASON}`);

export const getTeamSquad = (teamId) =>
  apiFetch(`/players/squads?team=${teamId}`);

export const getTeamMatches = (teamId, params = {}) => {
  const qs = new URLSearchParams({ league: LEAGUE_ID, season: SEASON, team: teamId, ...params }).toString();
  return apiFetch(`/fixtures?${qs}`);
};
