import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CLASSIFICA_DEMO = [
  { id: 1, nome: 'FC Drago', punti: 487, ultimoTurno: 78, puntimedia: 81.2 },
  { id: 2, nome: 'La Mia Squadra', punti: 462, ultimoTurno: 74, puntimedia: 77.0, isUser: true },
  { id: 3, nome: 'Guerrieri', punti: 451, ultimoTurno: 65, puntimedia: 75.2 },
  { id: 4, nome: 'FC Fulmine', punti: 438, ultimoTurno: 71, puntimedia: 73.0 },
  { id: 5, nome: 'I Leoni', punti: 420, ultimoTurno: 60, puntimedia: 70.0 },
  { id: 6, nome: 'Aquile Rosse', punti: 405, ultimoTurno: 58, puntimedia: 67.5 },
  { id: 7, nome: 'Tornado FC', punti: 388, ultimoTurno: 62, puntimedia: 64.7 },
  { id: 8, nome: 'Stella Blu', punti: 371, ultimoTurno: 55, puntimedia: 61.8 },
];

const CALENDARIO_DEMO = Array.from({ length: 14 }, (_, i) => ({
  giornata: i + 1,
  giocata: true,
  puntiUser: 58 + Math.round(Math.sin(i) * 18 + Math.random() * 10),
})).concat([{ giornata: 15, giocata: false, puntiUser: null }]);

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
      classifica: CLASSIFICA_DEMO,
      calendario: CALENDARIO_DEMO,
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
