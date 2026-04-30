import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      // ── Navigazione ────────────────────────────────────────
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // ── Utente (con auth) ──────────────────────────────────
      user: {
        id: null,
        email: null,
        name: 'Allenatore',
        plan: 'free',
        token: null,
        league: 'La mia lega',
      },
      setUser: (userData) => set({ user: userData }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      logout: () => set({
        user: { id: null, email: null, name: 'Allenatore', plan: 'free', token: null, league: 'La mia lega' },
        aiCrediti: 3,
        resetAt: null,
      }),

      // ── Rosa ───────────────────────────────────────────────
      rosa: [],
      giornataCorrente: 15,

      addGiocatore: (giocatore) =>
        set((state) => ({ rosa: [...state.rosa, { ...giocatore, id: Date.now() }] })),
      updateGiocatore: (id, updates) =>
        set((state) => ({ rosa: state.rosa.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
      removeGiocatore: (id) =>
        set((state) => ({
          rosa: state.rosa.filter((g) => g.id !== id),
          titolariIds: state.titolariIds.filter((tid) => tid !== id),
        })),
      toggleInfortunato: (id) =>
        set((state) => ({ rosa: state.rosa.map((g) => g.id === id ? { ...g, infortunato: !g.infortunato } : g) })),
      toggleDiffidato: (id) =>
        set((state) => ({ rosa: state.rosa.map((g) => g.id === id ? { ...g, diffidato: !g.diffidato } : g) })),

      // ── Lega ───────────────────────────────────────────────
      classifica: [],
      calendario: [],
      setGiornataCorrente: (n) => set({ giornataCorrente: n }),
      setClassifica: (classifica) => set({ classifica }),
      setCalendario: (calendario) => set({ calendario }),

      // ── Mercato ────────────────────────────────────────────
      offerte: [],
      trattative: [],
      aggiornaOfferta: (id, nuovoStato) =>
        set((state) => ({ offerte: state.offerte.map((o) => o.id === id ? { ...o, stato: nuovoStato } : o) })),
      addOfferta: (offerta) => set((state) => ({ offerte: [...state.offerte, offerta] })),
      addTrattativa: (trattativa) => set((state) => ({ trattative: [...state.trattative, trattativa] })),

      // ── Schieramento ───────────────────────────────────────
      modulo: '4-3-3',
      titolariIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      setModulo: (modulo) => set({ modulo }),
      setTitolariIds: (ids) => set({ titolariIds: ids }),

      // ── AI ─────────────────────────────────────────────────
      aiCrediti: 3,
      resetAt: null,
      aiConversazioni: {},

      setAiCrediti: (n) => set({ aiCrediti: Math.max(0, n) }),
      setResetAt: (isoString) => set({ resetAt: isoString }),
      aggiungiMessaggio: (pageId, msg) =>
        set((state) => ({
          aiConversazioni: {
            ...state.aiConversazioni,
            [pageId]: [...(state.aiConversazioni[pageId] || []), msg],
          },
        })),
      resetConversazione: (pageId) =>
        set((state) => ({
          aiConversazioni: { ...state.aiConversazioni, [pageId]: [] },
        })),
    }),
    {
      name: 'fantabrain-store-v4',
      version: 1,
      migrate: (persistedState) => ({ ...persistedState, rosa: [] }),
    }
  )
);

export default useAppStore;
