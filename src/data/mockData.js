// ============================================================
// FANTABRAIN AI — Dati Mock Centralizzati
// Serie A 2024/25
// ============================================================

export const rosa = [
  // Portieri
  { id: 1, nome: 'Mike', cognome: 'Maignan', squadra: 'Milan', ruoloMantra: 'Por', quotazione: 22, votoMedia: 6.4, votiUltimi5: [6.5, 6, 7, 6.5, 6], infortunato: false, diffidato: false, titolare: true, imgUrl: null },
  { id: 2, nome: 'Guglielmo', cognome: 'Vicario', squadra: 'Tottenham', ruoloMantra: 'Por', quotazione: 10, votoMedia: 6.2, votiUltimi5: [6, 6.5, 6, 6, 6.5], infortunato: false, diffidato: false, titolare: false, imgUrl: null },

  // Difensori Destra
  { id: 3, nome: 'Giovanni', cognome: 'Di Lorenzo', squadra: 'Napoli', ruoloMantra: 'DD', quotazione: 20, votoMedia: 6.5, votiUltimi5: [7, 6.5, 6, 7, 6.5], infortunato: false, diffidato: true, titolare: true, imgUrl: null },
  { id: 4, nome: 'Matteo', cognome: 'Darmian', squadra: 'Inter', ruoloMantra: 'DD/DS', quotazione: 12, votoMedia: 6.1, votiUltimi5: [6, 6.5, 6, 6, 6], infortunato: false, diffidato: false, titolare: false, imgUrl: null },

  // Difensori Centrali
  { id: 5, nome: 'Francesco', cognome: 'Acerbi', squadra: 'Inter', ruoloMantra: 'DC', quotazione: 14, votoMedia: 6.3, votiUltimi5: [6.5, 6, 6, 6.5, 7], infortunato: false, diffidato: false, titolare: true, imgUrl: null },
  { id: 6, nome: 'Gleison', cognome: 'Bremer', squadra: 'Juventus', ruoloMantra: 'DC', quotazione: 16, votoMedia: 6.4, votiUltimi5: [0, 0, 0, 0, 0], infortunato: true, diffidato: false, titolare: false, imgUrl: null },
  { id: 7, nome: 'Alessandro', cognome: 'Bastoni', squadra: 'Inter', ruoloMantra: 'DC/DS', quotazione: 18, votoMedia: 6.6, votiUltimi5: [6.5, 7, 6.5, 6, 7], infortunato: false, diffidato: false, titolare: true, imgUrl: null },

  // Difensori Sinistra
  { id: 8, nome: 'Theo', cognome: 'Hernandez', squadra: 'Milan', ruoloMantra: 'DS', quotazione: 24, votoMedia: 6.7, votiUltimi5: [0, 0, 0, 0, 0], infortunato: true, diffidato: false, titolare: false, imgUrl: null },
  { id: 9, nome: 'Andrea', cognome: 'Cambiaso', squadra: 'Juventus', ruoloMantra: 'DS/M', quotazione: 16, votoMedia: 6.5, votiUltimi5: [7, 6.5, 6, 6.5, 7], infortunato: false, diffidato: false, titolare: true, imgUrl: null },

  // Centrocampisti
  { id: 10, nome: 'Nicolò', cognome: 'Barella', squadra: 'Inter', ruoloMantra: 'M/C', quotazione: 28, votoMedia: 6.8, votiUltimi5: [7, 6.5, 7.5, 7, 6.5], infortunato: false, diffidato: true, titolare: true, imgUrl: null },
  { id: 11, nome: 'Stanislav', cognome: 'Lobotka', squadra: 'Napoli', ruoloMantra: 'C', quotazione: 18, votoMedia: 6.5, votiUltimi5: [6.5, 6, 7, 6.5, 6], infortunato: false, diffidato: false, titolare: false, imgUrl: null },
  { id: 12, nome: 'Marco', cognome: 'Verratti', squadra: 'Al-Khelaifi FC', ruoloMantra: 'C', quotazione: 8, votoMedia: 5.8, votiUltimi5: [6, 5.5, 6, 6, 5.5], infortunato: true, diffidato: false, titolare: false, imgUrl: null },
  { id: 13, nome: 'Khvicha', cognome: 'Kvaratskhelia', squadra: 'PSG', ruoloMantra: 'T/A', quotazione: 12, votoMedia: 6.4, votiUltimi5: [6.5, 6, 7, 6.5, 6], infortunato: false, diffidato: false, titolare: false, imgUrl: null },
  { id: 14, nome: 'Hakan', cognome: 'Calhanoglu', squadra: 'Inter', ruoloMantra: 'M/C', quotazione: 22, votoMedia: 7.0, votiUltimi5: [7.5, 6.5, 7, 7.5, 6.5], infortunato: false, diffidato: false, titolare: true, imgUrl: null },
  { id: 15, nome: 'Luis', cognome: 'Alberto', squadra: 'Lazio', ruoloMantra: 'C/T', quotazione: 14, votoMedia: 6.3, votiUltimi5: [6.5, 6, 6.5, 6, 6.5], infortunato: false, diffidato: false, titolare: false, imgUrl: null },

  // Trequartisti/Ala
  { id: 16, nome: 'Rafael', cognome: 'Leao', squadra: 'Milan', ruoloMantra: 'T/A', quotazione: 30, votoMedia: 6.9, votiUltimi5: [7.5, 6.5, 7, 7.5, 6], infortunato: false, diffidato: false, titolare: true, imgUrl: null },
  { id: 17, nome: 'Federico', cognome: 'Chiesa', squadra: 'Liverpool', ruoloMantra: 'T/A', quotazione: 10, votoMedia: 6.0, votiUltimi5: [6, 5.5, 6.5, 6, 6], infortunato: false, diffidato: false, titolare: false, imgUrl: null },
  { id: 18, nome: 'Ademola', cognome: 'Lookman', squadra: 'Atalanta', ruoloMantra: 'T/A', quotazione: 20, votoMedia: 7.1, votiUltimi5: [7, 7.5, 6.5, 7, 7.5], infortunato: false, diffidato: false, titolare: true, imgUrl: null },

  // Attaccanti/Punte
  { id: 19, nome: 'Lautaro', cognome: 'Martinez', squadra: 'Inter', ruoloMantra: 'PC', quotazione: 38, votoMedia: 7.2, votiUltimi5: [8, 7, 6.5, 7.5, 7], infortunato: false, diffidato: false, titolare: true, imgUrl: null },
  { id: 20, nome: 'Victor', cognome: 'Osimhen', squadra: 'Galatasaray', ruoloMantra: 'PC', quotazione: 28, votoMedia: 7.0, votiUltimi5: [7.5, 6.5, 7, 8, 6.5], infortunato: false, diffidato: false, titolare: false, imgUrl: null },
  { id: 21, nome: 'Dusan', cognome: 'Vlahovic', squadra: 'Juventus', ruoloMantra: 'PC', quotazione: 32, votoMedia: 6.8, votiUltimi5: [7, 6.5, 7.5, 6, 7], infortunato: false, diffidato: true, titolare: false, imgUrl: null },
  { id: 22, nome: 'Marcus', cognome: 'Thuram', squadra: 'Inter', ruoloMantra: 'PC', quotazione: 26, votoMedia: 6.9, votiUltimi5: [7, 7.5, 6.5, 7, 7], infortunato: false, diffidato: false, titolare: false, imgUrl: null },
  { id: 23, nome: 'Matteo', cognome: 'Politano', squadra: 'Napoli', ruoloMantra: 'T/A', quotazione: 14, votoMedia: 6.4, votiUltimi5: [6.5, 6, 7, 6.5, 6], infortunato: false, diffidato: false, titolare: false, imgUrl: null },
];

export const classificaLega = [
  { id: 1, nome: 'Scudetto Dreams FC', punti: 487, vittorie: 18, pareggi: 5, sconfitte: 4, puntimedia: 17.4, ultimoTurno: 62, isUser: false },
  { id: 2, nome: 'Marco R. FantaTeam', punti: 463, vittorie: 16, pareggi: 6, sconfitte: 5, puntimedia: 16.5, ultimoTurno: 58, isUser: true },
  { id: 3, nome: 'Tiki Taka Masters', punti: 441, vittorie: 15, pareggi: 7, sconfitte: 5, puntimedia: 15.8, ultimoTurno: 71, isUser: false },
  { id: 4, nome: 'Nerazzurri United', punti: 428, vittorie: 14, pareggi: 8, sconfitte: 5, puntimedia: 15.3, ultimoTurno: 55, isUser: false },
  { id: 5, nome: 'Juventino Power', punti: 412, vittorie: 13, pareggi: 9, sconfitte: 5, puntimedia: 14.7, ultimoTurno: 48, isUser: false },
  { id: 6, nome: 'Calcio Fantastico', punti: 398, vittorie: 12, pareggi: 10, sconfitte: 5, puntimedia: 14.2, ultimoTurno: 52, isUser: false },
  { id: 7, nome: 'Azzurri Attack', punti: 376, vittorie: 11, pareggi: 9, sconfitte: 7, puntimedia: 13.4, ultimoTurno: 44, isUser: false },
  { id: 8, nome: 'Goleadores FC', punti: 354, vittorie: 10, pareggi: 8, sconfitte: 9, puntimedia: 12.6, ultimoTurno: 39, isUser: false },
];

export const calendarioGiornate = [
  { giornata: 24, avversario: 'Azzurri Attack', data: '2025-02-15', risultato: '67-52', puntiUser: 67, giocata: true },
  { giornata: 25, avversario: 'Calcio Fantastico', data: '2025-02-22', risultato: '58-61', puntiUser: 58, giocata: true },
  { giornata: 26, avversario: 'Nerazzurri United', data: '2025-03-01', risultato: '72-65', puntiUser: 72, giocata: true },
  { giornata: 27, avversario: 'Goleadores FC', data: '2025-03-08', risultato: '55-43', puntiUser: 55, giocata: true },
  { giornata: 28, avversario: 'Juventino Power', data: '2025-03-15', risultato: null, puntiUser: null, giocata: false, inCorso: true },
  { giornata: 29, avversario: 'Tiki Taka Masters', data: '2025-03-22', risultato: null, puntiUser: null, giocata: false, proiezionePunti: 64 },
  { giornata: 30, avversario: 'Scudetto Dreams FC', data: '2025-03-29', risultato: null, puntiUser: null, giocata: false, proiezionePunti: 58 },
  { giornata: 31, avversario: 'Azzurri Attack', data: '2025-04-05', risultato: null, puntiUser: null, giocata: false, proiezionePunti: 69 },
  { giornata: 32, avversario: 'Calcio Fantastico', data: '2025-04-12', risultato: null, puntiUser: null, giocata: false, proiezionePunti: 61 },
];

export const tutteLeGiornate = Array.from({ length: 38 }, (_, i) => {
  const g = i + 1;
  const avversari = ['Scudetto Dreams FC', 'Tiki Taka Masters', 'Nerazzurri United', 'Juventino Power', 'Calcio Fantastico', 'Azzurri Attack', 'Goleadores FC'];
  const avversario = avversari[i % avversari.length];
  if (g < 24) {
    const pUser = Math.floor(Math.random() * 40) + 40;
    const pAvv = Math.floor(Math.random() * 40) + 40;
    return { giornata: g, avversario, data: `2024-${String(9 + Math.floor(g / 4)).padStart(2,'0')}-${String((g % 4) * 7 + 1).padStart(2,'0')}`, risultato: `${pUser}-${pAvv}`, puntiUser: pUser, giocata: true };
  }
  const found = calendarioGiornate.find(c => c.giornata === g);
  if (found) return found;
  return { giornata: g, avversario, data: `2025-${String(3 + Math.floor((g - 28) / 4)).padStart(2,'0')}-01`, risultato: null, puntiUser: null, giocata: false, proiezionePunti: Math.floor(Math.random() * 25) + 50 };
});

export const offerteMercato = [
  {
    id: 1, da: 'Tiki Taka Masters', giocatoreRichiesto: 'Lautaro Martinez',
    giocatoreOfferto: 'Ciro Immobile', quotazioneOfferta: 18, scadenza: '2025-03-20',
    stato: 'in_attesa'
  },
  {
    id: 2, da: 'Nerazzurri United', giocatoreRichiesto: 'Rafael Leao',
    giocatoreOfferto: 'Paulo Dybala', quotazioneOfferta: 22, scadenza: '2025-03-19',
    stato: 'in_attesa'
  },
  {
    id: 3, da: 'Scudetto Dreams FC', giocatoreRichiesto: 'Nicolò Barella',
    giocatoreOfferto: 'Sergej Milinkovic-Savic', quotazioneOfferta: 20, scadenza: '2025-03-21',
    stato: 'in_attesa'
  },
];

export const trattative = [
  { id: 1, tipo: 'proposta', mioGiocatore: 'Dusan Vlahovic', avversario: 'Goleadores FC', giocatoreVoluto: 'Lorenzo Pellegrini', stato: 'rifiutata' },
  { id: 2, tipo: 'proposta', mioGiocatore: 'Stanislav Lobotka', avversario: 'Juventino Power', giocatoreVoluto: 'Ruslan Malinovskyi', stato: 'in_attesa' },
];

export const svincolati = [
  { id: 101, nome: 'Matias', cognome: 'Soulé', squadra: 'Lazio', ruoloMantra: 'T/A', quotazione: 16, votoMedia: 6.6, votiUltimi5: [7, 6.5, 7.5, 6, 7], infortunato: false, diffidato: false },
  { id: 102, nome: 'Riccardo', cognome: 'Orsolini', squadra: 'Bologna', ruoloMantra: 'T/A', quotazione: 14, votoMedia: 6.5, votiUltimi5: [6.5, 7, 6, 7, 6.5], infortunato: false, diffidato: false },
  { id: 103, nome: 'Michael', cognome: 'Folorunsho', squadra: 'Napoli', ruoloMantra: 'M/C', quotazione: 10, votoMedia: 6.2, votiUltimi5: [6.5, 6, 6, 6.5, 6], infortunato: false, diffidato: false },
  { id: 104, nome: 'Valentin', cognome: 'Castellanos', squadra: 'Lazio', ruoloMantra: 'PC', quotazione: 20, votoMedia: 6.7, votiUltimi5: [7, 6.5, 7.5, 6.5, 7], infortunato: false, diffidato: false },
  { id: 105, nome: 'Boulaye', cognome: 'Dia', squadra: 'Lazio', ruoloMantra: 'PC/T', quotazione: 18, votoMedia: 6.8, votiUltimi5: [7, 7.5, 6.5, 7, 7], infortunato: false, diffidato: false },
  { id: 106, nome: 'Samuel', cognome: 'Mbangula', squadra: 'Juventus', ruoloMantra: 'T/A', quotazione: 8, votoMedia: 6.3, votiUltimi5: [6.5, 6, 6.5, 6, 7], infortunato: false, diffidato: false },
  { id: 107, nome: 'David', cognome: 'Neres', squadra: 'Napoli', ruoloMantra: 'T/A', quotazione: 16, votoMedia: 6.7, votiUltimi5: [7.5, 6.5, 7, 6.5, 7], infortunato: false, diffidato: false },
  { id: 108, nome: 'Adam', cognome: 'Marusic', squadra: 'Lazio', ruoloMantra: 'DS/DD', quotazione: 10, votoMedia: 6.1, votiUltimi5: [6, 6.5, 6, 6, 6.5], infortunato: false, diffidato: false },
  { id: 109, nome: 'Pietro', cognome: 'Pellegri', squadra: 'Torino', ruoloMantra: 'PC', quotazione: 10, votoMedia: 6.0, votiUltimi5: [6, 5.5, 6.5, 6, 6], infortunato: true, diffidato: false },
  { id: 110, nome: 'Cyril', cognome: 'Ngonge', squadra: 'Napoli', ruoloMantra: 'T/A', quotazione: 8, votoMedia: 6.2, votiUltimi5: [6, 6.5, 6, 6.5, 6], infortunato: false, diffidato: false },
  { id: 111, nome: 'Andrea', cognome: 'Pinamonti', squadra: 'Genoa', ruoloMantra: 'PC', quotazione: 12, votoMedia: 6.3, votiUltimi5: [6.5, 6, 6.5, 6.5, 6], infortunato: false, diffidato: false },
  { id: 112, nome: 'Yunus', cognome: 'Musah', squadra: 'Milan', ruoloMantra: 'M/C', quotazione: 10, votoMedia: 6.0, votiUltimi5: [6, 6, 5.5, 6.5, 6], infortunato: false, diffidato: false },
  { id: 113, nome: 'Lorenzo', cognome: 'Pellegrini', squadra: 'Roma', ruoloMantra: 'C/T', quotazione: 14, votoMedia: 6.3, votiUltimi5: [6, 6.5, 6.5, 6, 7], infortunato: false, diffidato: false },
  { id: 114, nome: 'Martin', cognome: 'Erlic', squadra: 'Sassuolo', ruoloMantra: 'DC', quotazione: 6, votoMedia: 6.0, votiUltimi5: [6, 5.5, 6.5, 6, 6], infortunato: false, diffidato: false },
  { id: 115, nome: 'Roberto', cognome: 'Piccoli', squadra: 'Cagliari', ruoloMantra: 'PC', quotazione: 12, votoMedia: 6.5, votiUltimi5: [7, 6.5, 6, 7, 6.5], infortunato: false, diffidato: false },
];

export const rosaAvversaria = {
  'Juventino Power': [
    { nome: 'Wojciech Szczesny', squadra: 'Barcellona', ruoloMantra: 'Por', votoMedia: 6.3 },
    { nome: 'Paulo Dybala', squadra: 'Roma', ruoloMantra: 'T/A', votoMedia: 6.8 },
    { nome: 'Ciro Immobile', squadra: 'Besiktas', ruoloMantra: 'PC', votoMedia: 6.5 },
    { nome: 'Rodrigo Bentancur', squadra: 'Tottenham', ruoloMantra: 'M/C', votoMedia: 6.4 },
    { nome: 'Leonardo Bonucci', squadra: 'Union Berlin', ruoloMantra: 'DC', votoMedia: 5.9 },
  ],
  'Tiki Taka Masters': [
    { nome: 'Alex Meret', squadra: 'Napoli', ruoloMantra: 'Por', votoMedia: 6.2 },
    { nome: 'Giacomo Raspadori', squadra: 'Napoli', ruoloMantra: 'PC/T', votoMedia: 6.7 },
    { nome: 'Giorgio Scalvini', squadra: 'Atalanta', ruoloMantra: 'DC', votoMedia: 6.4 },
    { nome: 'Ederson', squadra: 'Atalanta', ruoloMantra: 'M/C', votoMedia: 6.6 },
    { nome: 'Nicolo Zaniolo', squadra: 'Atalanta', ruoloMantra: 'T/A', votoMedia: 6.5 },
  ],
};

export const statisticheStagione = {
  puntiTotali: 463,
  media: 16.5,
  miglioreGiornata: { giornata: 12, punti: 98 },
  peggiorGiornata: { giornata: 7, punti: 28 },
  vittorie: 16,
  pareggi: 6,
  sconfitte: 5,
  andamentoPunti: [52, 67, 45, 71, 58, 62, 28, 74, 65, 57, 69, 98, 55, 63, 72, 48, 59, 66, 51, 74, 60, 82, 55, 67, 58, 72, 55],
};

export const moduli = ['4-3-3', '3-4-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'];

export const schieramentoDefault = {
  modulo: '4-3-3',
  titolari: [1, 3, 5, 7, 9, 10, 14, 18, 16, 18, 19],
};
