// src/stores/useLeagueStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playMatchday as runMatchday, recomputeStandings as engineRecomputeStandings } from '../lib/season/playMatchday.js';
import useAppStore from '../store/useAppStore.js';
import { draftBotRoster, BOT_NAME_POOL } from '../lib/season/botStrategy.js';
import { generateRoundRobin } from '../lib/season/calendar.js';

function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

function hash01(s) {
  let h = 2166136261;
  for (let i = 0; i < (s || '').length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) / 4294967296);
}

function initializeSeason(league, allPlayersPool) {
  const userRoster = useAppStore.getState().rosa || [];
  const usedIds = new Set(userRoster.map((p) => p.id));

  const archetypes = ['OffensivePush', 'DefensiveWall', 'OffensivePush', 'DefensiveWall', 'OffensivePush', 'DefensiveWall', 'OffensivePush'];

  const namesShuffled = [...BOT_NAME_POOL];
  for (let k = namesShuffled.length - 1; k > 0; k--) {
    const j = Math.floor(hash01(`${league.id}:shuffle:${k}`) * (k + 1));
    [namesShuffled[k], namesShuffled[j]] = [namesShuffled[j], namesShuffled[k]];
  }
  namesShuffled.length = Math.min(namesShuffled.length, 7);

  const bots = [];
  for (let i = 0; i < 7; i++) {
    const archetype = archetypes[i];
    const roster = draftBotRoster(
      archetype,
      allPlayersPool,
      league.settings.creditiIniziali ?? 500,
      league.settings.numGiocatoriRosa ?? 25,
      `${league.id}-bot-${i + 1}`,
      { excludeIds: usedIds }
    );
    roster.forEach((p) => usedIds.add(p.id));
    bots.push({
      id: `bot-${i + 1}`,
      name: namesShuffled[i] || `Bot ${i + 1}`,
      archetype,
      roster,
      currentLineup: null,
    });
  }

  const teamIds = ['user', ...bots.map((b) => b.id)];
  const calendar = generateRoundRobin(teamIds, 'andata_ritorno', league.id);

  return { bots, calendar };
}

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

      canPlayNow: (leagueId) => {
        const { leagues } = get();
        const l = leagues.find((x) => x.id === leagueId);
        if (!l) return { ok: false, reason: 'no-league' };
        if (l.seasonStatus === 'completed') return { ok: false, reason: 'season-completed' };
        if (l.isPlayingMatchday) return { ok: false, reason: 'in-progress' };
        if (l.matchdayResults?.find((r) => r.matchday === l.currentMatchday)) {
          return { ok: false, reason: 'already-played' };
        }
        if (l.nextMatchdayUnlocksAt) {
          const t = Date.parse(l.nextMatchdayUnlocksAt);
          if (Number.isFinite(t) && t > Date.now()) {
            return { ok: false, reason: 'cooldown', unlocksAt: l.nextMatchdayUnlocksAt };
          }
        }
        return { ok: true };
      },

      skipCooldown: (leagueId) => {
        const today = todayLocalISO();
        const { leagues } = get();
        const l = leagues.find((x) => x.id === leagueId);
        if (!l) throw new Error('NoLeague');

        const sToday = l.skipsToday?.date === today
          ? l.skipsToday
          : { date: today, count: 0 };

        if (sToday.count >= 3) {
          throw new Error('SkipsExhausted');
        }

        set((state) => ({
          leagues: state.leagues.map((x) =>
            x.id === leagueId
              ? {
                  ...x,
                  nextMatchdayUnlocksAt: new Date().toISOString(),
                  skipsToday: { date: today, count: sToday.count + 1 },
                }
              : x
          ),
        }));
      },

      playMatchday: async (leagueId, opts = {}) => {
        const { leagues } = get();
        const l = leagues.find((x) => x.id === leagueId);
        if (!l) throw new Error('NoLeague');

        if (l.isPlayingMatchday) throw new Error('AlreadyRunning');
        set((state) => ({
          leagues: state.leagues.map((x) =>
            x.id === leagueId ? { ...x, isPlayingMatchday: true } : x
          ),
        }));

        try {
          let league = get().leagues.find((x) => x.id === leagueId);
          if (league.seasonStatus === 'pending') {
            const userRoster = useAppStore.getState().rosa || [];
            if (userRoster.length < 15) throw new Error('RosterTooSmall');
            const playersPool = opts.playersPool;
            if (!playersPool || playersPool.length < 25 * 7 + userRoster.length) {
              throw new Error('PlayerPoolMissing');
            }
            const { bots, calendar } = initializeSeason(league, playersPool);
            set((state) => ({
              leagues: state.leagues.map((x) =>
                x.id === leagueId
                  ? { ...x, bots, calendar, seasonStatus: 'active' }
                  : x
              ),
            }));
            league = get().leagues.find((x) => x.id === leagueId);
          }

          const userRoster = useAppStore.getState().rosa || [];
          const userLineup = useAppStore.getState().titolariIds || [];
          const userModulo = useAppStore.getState().modulo || '4-3-3';

          const snapshot = {
            ...league,
            userRoster,
            userLineup,
            userModulo,
          };

          const { matchdayResult, updatedStandings } = await runMatchday(snapshot);

          const enrichedStandings = updatedStandings.map((s) => {
            if (s.teamId === 'user') {
              return { ...s, name: useAppStore.getState().user?.league || 'La mia squadra', isUser: true };
            }
            const b = league.bots.find((x) => x.id === s.teamId);
            return { ...s, name: b?.name || s.teamId, isUser: false };
          });

          const nextMatchday = league.currentMatchday + 1;
          const seasonCompleted = nextMatchday > league.calendar.length;

          set((state) => ({
            leagues: state.leagues.map((x) =>
              x.id === leagueId
                ? {
                    ...x,
                    matchdayResults: [...(x.matchdayResults || []), matchdayResult],
                    standings: enrichedStandings,
                    currentMatchday: nextMatchday,
                    nextMatchdayUnlocksAt: new Date(Date.now() + (x.cooldownHours ?? 24) * 3600 * 1000).toISOString(),
                    seasonStatus: seasonCompleted ? 'completed' : 'active',
                    isPlayingMatchday: false,
                  }
                : x
            ),
          }));

          return matchdayResult;
        } catch (err) {
          set((state) => ({
            leagues: state.leagues.map((x) =>
              x.id === leagueId ? { ...x, isPlayingMatchday: false } : x
            ),
          }));
          throw err;
        }
      },

      recomputeStandings: (leagueId) => {
        const { leagues } = get();
        const l = leagues.find((x) => x.id === leagueId);
        if (!l) return;
        try {
          const updated = engineRecomputeStandings(l.matchdayResults || [], l.calendar || []);
          set((state) => ({
            leagues: state.leagues.map((x) =>
              x.id === leagueId ? { ...x, standings: updated } : x
            ),
          }));
        } catch (err) {
          console.error('[league-store] recomputeStandings failed', err);
        }
      },

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
