// src/store/useLeagueStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLeagueStore = create(
  persist(
    (set) => ({
      currentLeague: null,

      setLeague: (league) => set({ currentLeague: league }),

      clearLeague: () => set({ currentLeague: null }),

      addResult: (result) =>
        set((state) => ({
          currentLeague: state.currentLeague
            ? {
                ...state.currentLeague,
                results: [...state.currentLeague.results, result],
              }
            : null,
        })),
    }),
    { name: 'fantabrain-league' }
  )
);

export default useLeagueStore;
