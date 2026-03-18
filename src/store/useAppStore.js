import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Navigazione
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Utente
      user: { name: 'Allenatore', plan: 'pro', league: 'La mia lega' },

      // Rosa (vuota)
      rosa: [],
      giornataCorrente: 1,

      // Lega
      classifica: [],
      calendario: [],

      // Mercato
      offerte: [],
      trattative: [],

      // Schieramento
      modulo: '4-3-3',
      titolariIds: [],

      // AI
      aiCrediti: 12,
      aiConversazioni: {},

      // ── CRUD Rosa ──────────────────────────────────────────────

      addGiocatore: (giocatore) =>
        set((state) => ({
          rosa: [...state.rosa, { ...giocatore, id: Date.now() }],
        })),

      updateGiocatore: (id, updates) =>
        set((state) => ({
          rosa: state.rosa.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      removeGiocatore: (id) =>
        set((state) => ({
          rosa: state.rosa.filter((g) => g.id !== id),
          titolariIds: state.titolariIds.filter((tid) => tid !== id),
        })),

      toggleInfortunato: (id) =>
        set((state) => ({
          rosa: state.rosa.map((g) =>
            g.id === id ? { ...g, infortunato: !g.infortunato } : g
          ),
        })),

      toggleDiffidato: (id) =>
        set((state) => ({
          rosa: state.rosa.map((g) =>
            g.id === id ? { ...g, diffidato: !g.diffidato } : g
          ),
        })),

      // ── Schieramento ───────────────────────────────────────────

      setModulo: (modulo) => set({ modulo }),

      setTitolariIds: (ids) => set({ titolariIds: ids }),

      // ── AI ─────────────────────────────────────────────────────

      decrementaCrediti: () =>
        set((state) => ({
          aiCrediti: Math.max(0, state.aiCrediti - 1),
        })),

      aggiungiMessaggio: (pageId, msg) =>
        set((state) => ({
          aiConversazioni: {
            ...state.aiConversazioni,
            [pageId]: [...(state.aiConversazioni[pageId] || []), msg],
          },
        })),

      resetConversazione: (pageId) =>
        set((state) => ({
          aiConversazioni: {
            ...state.aiConversazioni,
            [pageId]: [],
          },
        })),

      // ── Mercato ────────────────────────────────────────────────

      aggiornaOfferta: (id, nuovoStato) =>
        set((state) => ({
          offerte: state.offerte.map((o) =>
            o.id === id ? { ...o, stato: nuovoStato } : o
          ),
        })),

      addOfferta: (offerta) =>
        set((state) => ({
          offerte: [...state.offerte, offerta],
        })),

      addTrattativa: (trattativa) =>
        set((state) => ({
          trattative: [...state.trattative, trattativa],
        })),

      // ── Utente ─────────────────────────────────────────────────

      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      setGiornataCorrente: (n) => set({ giornataCorrente: n }),

      // ── Classifica ─────────────────────────────────────────────

      setClassifica: (classifica) => set({ classifica }),

      setCalendario: (calendario) => set({ calendario }),
    }),
    {
      name: 'fantabrain-store',
    }
  )
);

export default useAppStore;
