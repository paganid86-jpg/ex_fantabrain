// src/stores/useLeagueStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateInviteCode = () =>
  'FBRAIN-' + Math.random().toString(36).substring(2, 8).toUpperCase();

const DEFAULT_BONUS_MALUS = {
  golSegnato: 3,
  golSubitoPortiere: -1,
  assist: 1,
  ammonizione: -0.5,
  espulsione: -1,
  rigoreSegnato: 3,
  rigoreSbagliato: -3,
  rigoreParato: 3,
  autogol: -2,
  cleanSheetPortiere: 1,
  assistDaFermo: 1,
};

const DEFAULT_SETTINGS = {
  // Step 1
  nome: '',
  tipo: 'privata',          // 'privata' | 'pubblica'
  descrizione: '',
  numPartecipanti: 8,
  modalitaGioco: 'mantra',  // 'mantra' | 'classic'
  // Step 2
  creditiIniziali: 500,
  disponibilitaCalciatori: 'singola', // 'singola' | 'multipla'
  numGiocatoriRosa: 25,
  numeroPanchina: 12,
  // Step 3
  fonteVoti: 'fantabrain',
  dFactor: true,
  dFactorIncludePortiere: true,
  modificatoreRendimento: false,
  fattoreFairPlay: false,
  fattoreCapitano: false,
  bonusMalus: { ...DEFAULT_BONUS_MALUS },
  // Step 4
  tipoCalendario: 'andata_ritorno',
  fasceGol: 'progressive',
  modalitaSostituzioni: 'basic',
  numSostituzioni: 5,
  riservaUfficio: true,
  votoRiserva: 4,
};

const DEFAULT_LEAGUE_DOMAIN = {
  bots: [],
  calendar: [],
  matchdayResults: [],
  currentMatchday: 1,
  nextMatchdayUnlocksAt: null,
  cooldownHours: Number(import.meta.env.VITE_MATCHDAY_COOLDOWN_HOURS ?? 24),
  skipsToday: { date: null, count: 0 },
  seasonStatus: 'pending',           // 'pending' | 'active' | 'completed'
  isPlayingMatchday: false,
};

const useLeagueStore = create(
  persist(
    (set, get) => ({
      leagues: [],        // tutte le leghe dell'utente
      currentLeagueId: null,

      // ---- Actions ----
      createLeague: (settingsData) => {
        const id = crypto.randomUUID();
        const inviteCode = generateInviteCode();
        const newLeague = {
          id,
          inviteCode,
          inviteUrl: `https://fantabrain.app/lega/${inviteCode}`,
          createdAt: new Date().toISOString(),
          isAdmin: true,
          participants: [],
          myRoster: [],
          standings: [],
          settings: { ...DEFAULT_SETTINGS, ...settingsData },
          ...DEFAULT_LEAGUE_DOMAIN,
        };
        set((state) => ({
          leagues: [...state.leagues, newLeague],
          currentLeagueId: id,
        }));
        return newLeague;
      },

      joinLeague: (inviteCode) => {
        const { leagues } = get();
        const existing = leagues.find(
          (l) => l.inviteCode === inviteCode.trim().toUpperCase()
        );
        if (existing) {
          set({ currentLeagueId: existing.id });
          return { success: true, league: existing };
        }
        return { success: false, error: 'Codice non valido. Verifica e riprova.' };
      },

      setCurrentLeague: (id) => set({ currentLeagueId: id }),

      updateLeagueSettings: (leagueId, settings) =>
        set((state) => ({
          leagues: state.leagues.map((l) =>
            l.id === leagueId
              ? { ...l, settings: { ...l.settings, ...settings } }
              : l
          ),
        })),

      addPlayerToRoster: (leagueId, player) =>
        set((state) => ({
          leagues: state.leagues.map((l) =>
            l.id === leagueId
              ? { ...l, myRoster: [...l.myRoster, { ...player, addedAt: new Date().toISOString() }] }
              : l
          ),
        })),

      removePlayerFromRoster: (leagueId, playerId) =>
        set((state) => ({
          leagues: state.leagues.map((l) =>
            l.id === leagueId
              ? { ...l, myRoster: l.myRoster.filter((p) => p.id !== playerId) }
              : l
          ),
        })),

      removeParticipant: (leagueId, participantId) =>
        set((state) => ({
          leagues: state.leagues.map((l) =>
            l.id === leagueId
              ? { ...l, participants: l.participants.filter((p) => p.id !== participantId) }
              : l
          ),
        })),

      removeLeague: (leagueId) =>
        set((state) => ({
          leagues: state.leagues.filter((l) => l.id !== leagueId),
          currentLeagueId:
            state.currentLeagueId === leagueId ? null : state.currentLeagueId,
        })),
    }),
    {
      name: 'fantabrain-leagues',
      version: 2,
      migrate: (persistedState, fromVersion) => {
        if (!persistedState) return persistedState;
        if (fromVersion < 2) {
          const leagues = (persistedState.leagues || []).map((l) => ({
            ...DEFAULT_LEAGUE_DOMAIN,
            ...l,
          }));
          return { ...persistedState, leagues };
        }
        return persistedState;
      },
    }
  )
);

export default useLeagueStore;
