import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ROSA_DEMO = [
  { id: 1, cognome: 'Maignan', nome: 'Mike', ruoloMantra: 'Por', squadra: 'Milan', votoMedia: 6.8, quotazione: 25, votiUltimi5: [7, 6, 7.5, 6.5, 7], infortunato: false, diffidato: false },
  { id: 2, cognome: 'Di Lorenzo', nome: 'Giovanni', ruoloMantra: 'DD', squadra: 'Napoli', votoMedia: 6.6, quotazione: 18, votiUltimi5: [6.5, 7, 6, 6.5, 7], infortunato: false, diffidato: true },
  { id: 3, cognome: 'Bastoni', nome: 'Alessandro', ruoloMantra: 'DC', squadra: 'Inter', votoMedia: 6.7, quotazione: 22, votiUltimi5: [6, 7, 6.5, 7, 6.5], infortunato: false, diffidato: false },
  { id: 4, cognome: 'Theo', nome: 'Hernandez', ruoloMantra: 'DS', squadra: 'Milan', votoMedia: 7.1, quotazione: 30, votiUltimi5: [7.5, 8, 6.5, 7, 7], infortunato: false, diffidato: false },
  { id: 5, cognome: 'Calhanoglu', nome: 'Hakan', ruoloMantra: 'M/C', squadra: 'Inter', votoMedia: 7.2, quotazione: 28, votiUltimi5: [7, 8, 7.5, 6.5, 7.5], infortunato: false, diffidato: false },
  { id: 6, cognome: 'Barella', nome: 'Nicolò', ruoloMantra: 'C', squadra: 'Inter', votoMedia: 6.9, quotazione: 26, votiUltimi5: [7, 6.5, 7, 7, 7], infortunato: true, diffidato: false },
  { id: 7, cognome: 'Koopmeiners', nome: 'Teun', ruoloMantra: 'M/C', squadra: 'Juventus', votoMedia: 6.8, quotazione: 24, votiUltimi5: [6.5, 7, 7, 6.5, 7], infortunato: false, diffidato: false },
  { id: 8, cognome: 'Kvara', nome: 'Khvicha', ruoloMantra: 'T/A', squadra: 'Napoli', votoMedia: 7.3, quotazione: 32, votiUltimi5: [7.5, 8, 7, 7.5, 7], infortunato: false, diffidato: false },
  { id: 9, cognome: 'Lautaro', nome: 'Martínez', ruoloMantra: 'PC', squadra: 'Inter', votoMedia: 7.5, quotazione: 40, votiUltimi5: [8, 7.5, 8.5, 7, 8], infortunato: false, diffidato: false },
  { id: 10, cognome: 'Osimhen', nome: 'Victor', ruoloMantra: 'PC', squadra: 'Napoli', votoMedia: 7.4, quotazione: 38, votiUltimi5: [7, 8, 7.5, 8, 7.5], infortunato: false, diffidato: false },
  { id: 11, cognome: 'Darmian', nome: 'Matteo', ruoloMantra: 'DD', squadra: 'Inter', votoMedia: 6.3, quotazione: 10, votiUltimi5: [6, 6.5, 6, 6.5, 6], infortunato: false, diffidato: false },
  { id: 12, cognome: 'Tomori', nome: 'Fikayo', ruoloMantra: 'DC', squadra: 'Milan', votoMedia: 6.5, quotazione: 15, votiUltimi5: [6.5, 7, 6, 6.5, 6.5], infortunato: false, diffidato: false },
  { id: 13, cognome: 'Frattesi', nome: 'Davide', ruoloMantra: 'C', squadra: 'Inter', votoMedia: 6.7, quotazione: 16, votiUltimi5: [6, 7, 7, 6.5, 7], infortunato: false, diffidato: false },
  { id: 14, cognome: 'Politano', nome: 'Matteo', ruoloMantra: 'T/A', squadra: 'Napoli', votoMedia: 6.6, quotazione: 14, votiUltimi5: [6.5, 6, 7, 6.5, 7], infortunato: false, diffidato: false },
  { id: 15, cognome: 'Zielinski', nome: 'Piotr', ruoloMantra: 'M/C', squadra: 'Inter', votoMedia: 6.5, quotazione: 12, votiUltimi5: [6.5, 6, 7, 6, 7], infortunato: false, diffidato: false },
];

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
    (set, get) => ({
      // Navigazione
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Utente
      user: { name: 'Allenatore', plan: 'pro', league: 'La mia lega' },

      // Rosa
      rosa: ROSA_DEMO,
      giornataCorrente: 15,

      // Lega
      classifica: CLASSIFICA_DEMO,
      calendario: CALENDARIO_DEMO,

      // Mercato
      offerte: [],
      trattative: [],

      // Schieramento
      modulo: '4-3-3',
      titolariIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],

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
      name: 'fantabrain-store-v2',
    }
  )
);

export default useAppStore;
