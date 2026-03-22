// ============================================================
// FANTABRAIN AI — Strutture Dati (nessun dato mock)
// ============================================================

export const rosa = [];

export const classificaLega = [];

export const calendarioGiornate = [];

export const offerteMercato = [];

export const trattative = [];

export const svincolati = [];


export const statisticheStagione = {
  puntiTotali: 0,
  media: 0,
  miglioreGiornata: { giornata: null, punti: 0 },
  peggiorGiornata: { giornata: null, punti: 0 },
  vittorie: 0,
  pareggi: 0,
  sconfitte: 0,
  andamentoPunti: [],
};

export const GIOCATORE_VUOTO = {
  id: null,
  nome: '',
  cognome: '',
  squadra: '',
  ruoloMantra: 'M/C',
  quotazione: 1,
  votoMedia: 6.0,
  votiUltimi5: [0, 0, 0, 0, 0],
  infortunato: false,
  diffidato: false,
  titolare: false,
  imgUrl: null,
};

export const RUOLI_MANTRA = ['Por', 'DD', 'DS', 'DC', 'M/C', 'C', 'T/A', 'W', 'T', 'A', 'PC'];

export const SQUADRE_SERIE_A = [
  'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Empoli',
  'Fiorentina', 'Genoa', 'Inter', 'Juventus', 'Lazio',
  'Lecce', 'Milan', 'Monza', 'Napoli', 'Parma',
  'Roma', 'Torino', 'Udinese', 'Venezia', 'Verona',
];

export const rosaAvversaria = {};

export const tutteLeGiornate = [];
