// src/services/footballApi.js
// Client HTTP per football-data.org API (piano Free — Serie A 2025/2026)
// Le chiamate passano dal proxy Express (/api/football) che aggiunge X-Auth-Token.
// In sviluppo Vite proxy /api → localhost:3000, che poi chiama football-data.org.

const BASE_URL = '/api/football';

// Rate limiting: max 10 req/min (piano Free football-data.org)
let requestCount = 0;
let resetTime = Date.now() + 60000;

async function rateLimitedFetch(path) {
  const now = Date.now();
  if (now > resetTime) {
    requestCount = 0;
    resetTime = now + 60000;
  }
  if (requestCount >= 9) {
    const waitTime = resetTime - now;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    requestCount = 0;
    resetTime = Date.now() + 60000;
  }
  requestCount++;

  const response = await fetch(`${BASE_URL}${path}`);

  if (response.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 60000));
    return rateLimitedFetch(path);
  }

  if (!response.ok) {
    throw new Error(`Football API ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// === ENDPOINT ===

export const getStandings = () =>
  rateLimitedFetch('/competitions/SA/standings');

export const getMatches = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return rateLimitedFetch(`/competitions/SA/matches${qs ? `?${qs}` : ''}`);
};

export const getMatchesByMatchday = (matchday) =>
  rateLimitedFetch(`/competitions/SA/matches?matchday=${matchday}`);

export const getScorers = (limit = 20) =>
  rateLimitedFetch(`/competitions/SA/scorers?limit=${limit}`);

export const getTeams = () =>
  rateLimitedFetch('/competitions/SA/teams');

export const getTeamDetail = (teamId) =>
  rateLimitedFetch(`/teams/${teamId}`);

export const getTeamMatches = (teamId, params = {}) => {
  const qs = new URLSearchParams({ competitions: 'SA', ...params }).toString();
  return rateLimitedFetch(`/teams/${teamId}/matches?${qs}`);
};
