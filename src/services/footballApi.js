// src/services/footballApi.js
// Client HTTP per football-data.org API (piano Free — Serie A 2025/2026)
// NOTA SICUREZZA: API key esposta nel frontend solo per MVP.
// Prima di un deploy pubblico, spostare le chiamate dietro un backend/edge function.

const BASE_URL = import.meta.env.DEV
  ? '/api/football'
  : 'https://api.football-data.org/v4';

const getApiKey = () => import.meta.env.VITE_FOOTBALL_DATA_API_KEY;

// Rate limiting: max 10 req/min (piano Free football-data.org)
let requestCount = 0;
let resetTime = Date.now() + 60000;

async function rateLimitedFetch(path) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'la_api_key_qui') {
    throw new Error('VITE_FOOTBALL_DATA_API_KEY non configurata. Aggiungila nel file .env');
  }

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

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': apiKey },
  });

  if (response.status === 429) {
    // Rate limit superato — attendi 60s e riprova
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
