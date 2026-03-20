// src/stores/useSerieAStore.js
// Zustand store per i dati reali della Serie A 2025/2026.
// Gestisce fetch, cache, loading e error states.

import { create } from 'zustand';
import * as api from '../services/footballApi';
import * as mapper from '../services/footballDataMapper';

const CACHE_DURATION = {
  standings: 6 * 60 * 60 * 1000,  // 6 ore
  matches:   1 * 60 * 60 * 1000,  // 1 ora
  scorers:   6 * 60 * 60 * 1000,  // 6 ore
  teams:    24 * 60 * 60 * 1000,  // 24 ore
};

function isCacheValid(lastFetched, type) {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION[type];
}

const useSerieAStore = create((set, get) => ({
  // === STATE ===
  standings: null,         // classifica Serie A (array 20 squadre)
  currentMatchday: null,   // giornata corrente Serie A
  matches: [],             // tutte le partite stagione
  scorers: [],             // top marcatori
  teams: [],               // rose complete 20 squadre

  loading: { standings: false, matches: false, scorers: false, teams: false },
  errors:  { standings: null,  matches: null,  scorers: null,  teams: null  },
  lastFetched: { standings: null, matches: null, scorers: null, teams: null },

  // === ACTIONS ===

  fetchStandings: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.lastFetched.standings, 'standings')) return;

    set((s) => ({
      loading: { ...s.loading, standings: true },
      errors:  { ...s.errors,  standings: null  },
    }));
    try {
      const raw  = await api.getStandings();
      const data = mapper.mapStandings(raw);
      set((s) => ({
        standings:       data.teams,
        currentMatchday: data.currentMatchday,
        loading:         { ...s.loading,     standings: false        },
        lastFetched:     { ...s.lastFetched, standings: Date.now()   },
      }));
    } catch (error) {
      set((s) => ({
        loading: { ...s.loading, standings: false         },
        errors:  { ...s.errors,  standings: error.message },
      }));
    }
  },

  fetchMatches: async (params = {}, force = false) => {
    const state = get();
    if (!force && isCacheValid(state.lastFetched.matches, 'matches')) return;

    set((s) => ({
      loading: { ...s.loading, matches: true },
      errors:  { ...s.errors,  matches: null },
    }));
    try {
      const raw  = await api.getMatches(params);
      const data = mapper.mapMatches(raw);
      set((s) => ({
        matches:     data,
        loading:     { ...s.loading,     matches: false      },
        lastFetched: { ...s.lastFetched, matches: Date.now() },
      }));
    } catch (error) {
      set((s) => ({
        loading: { ...s.loading, matches: false         },
        errors:  { ...s.errors,  matches: error.message },
      }));
    }
  },

  fetchScorers: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.lastFetched.scorers, 'scorers')) return;

    set((s) => ({
      loading: { ...s.loading, scorers: true },
      errors:  { ...s.errors,  scorers: null },
    }));
    try {
      const raw  = await api.getScorers(30);
      const data = mapper.mapScorers(raw);
      set((s) => ({
        scorers:     data,
        loading:     { ...s.loading,     scorers: false      },
        lastFetched: { ...s.lastFetched, scorers: Date.now() },
      }));
    } catch (error) {
      set((s) => ({
        loading: { ...s.loading, scorers: false         },
        errors:  { ...s.errors,  scorers: error.message },
      }));
    }
  },

  fetchTeams: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.lastFetched.teams, 'teams')) return;

    set((s) => ({
      loading: { ...s.loading, teams: true },
      errors:  { ...s.errors,  teams: null },
    }));
    try {
      const raw  = await api.getTeams();
      const data = mapper.mapTeamsWithSquad(raw);
      set((s) => ({
        teams:       data,
        loading:     { ...s.loading,     teams: false      },
        lastFetched: { ...s.lastFetched, teams: Date.now() },
      }));
    } catch (error) {
      set((s) => ({
        loading: { ...s.loading, teams: false         },
        errors:  { ...s.errors,  teams: error.message },
      }));
    }
  },

  // Fetch dati essenziali in parallelo
  fetchAll: async () => {
    const { fetchStandings, fetchMatches, fetchScorers } = get();
    await Promise.allSettled([fetchStandings(), fetchMatches(), fetchScorers()]);
  },

  // === SELECTORS ===

  // Partite di una giornata specifica (o la corrente)
  getMatchesForMatchday: (matchday) => {
    const { matches, currentMatchday } = get();
    const day = matchday ?? currentMatchday;
    if (!day) return [];
    return matches.filter((m) => m.matchday === day);
  },

  // Prossime partite da giocare (prima giornata con match SCHEDULED/TIMED)
  getNextMatchdayMatches: () => {
    const { matches } = get();
    const upcoming = matches.filter((m) =>
      ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'].includes(m.status)
    );
    if (upcoming.length === 0) return [];
    const nextDay = Math.min(...upcoming.map((m) => m.matchday));
    return matches.filter((m) => m.matchday === nextDay);
  },

  // Ultimi risultati (partite già concluse)
  getLastResults: (count = 10) => {
    const { matches } = get();
    return matches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  },
}));

export default useSerieAStore;
