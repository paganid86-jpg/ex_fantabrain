import { create } from 'zustand';
import { rosa, classificaLega, calendarioGiornate, offerteMercato, trattative } from '../data/mockData';

const useAppStore = create((set, get) => ({
  // Navigazione
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Dati utente
  user: { name: 'Marco R.', plan: 'pro', league: 'Serie A Fantasy Monza' },

  // Rosa
  rosa,
  giornataCorrente: 28,

  // Lega
  classifica: classificaLega,
  calendario: calendarioGiornate,

  // Mercato
  offerte: offerteMercato,
  trattative,

  // Schieramento corrente
  modulo: '4-3-3',
  setModulo: (modulo) => set({ modulo }),
  titolariIds: [1, 3, 5, 7, 9, 10, 14, 16, 18, 19, 22],
  setTitolariIds: (ids) => set({ titolariIds: ids }),

  // AI
  aiCrediti: 12,
  aiConversazioni: {},

  decrementaCrediti: () => set((state) => ({
    aiCrediti: Math.max(0, state.aiCrediti - 1),
  })),

  aggiungiMessaggio: (pageId, msg) => set((state) => ({
    aiConversazioni: {
      ...state.aiConversazioni,
      [pageId]: [...(state.aiConversazioni[pageId] || []), msg],
    },
  })),

  resetConversazione: (pageId) => set((state) => ({
    aiConversazioni: {
      ...state.aiConversazioni,
      [pageId]: [],
    },
  })),

  // Aggiorna stato offerta
  aggiornaOfferta: (id, nuovoStato) => set((state) => ({
    offerte: state.offerte.map((o) => o.id === id ? { ...o, stato: nuovoStato } : o),
  })),
}));

export default useAppStore;
