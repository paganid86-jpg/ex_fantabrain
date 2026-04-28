// src/lib/season/__fixtures__/playerSamples.js
// Player samples per i test del season engine.
// Shape allineata a useAppStore.rosa[] e ai dati Scouting.

export const SAMPLE_PORTIERE = {
  id: 'p-maignan',
  cognome: 'Maignan',
  nome: 'Mike',
  ruoloMantra: 'Por',
  squadra: 'Milan',
  quotazione: 14,
  votoMedia: 6.4,
};

export const SAMPLE_DIFENSORE = {
  id: 'p-bastoni',
  cognome: 'Bastoni',
  nome: 'Alessandro',
  ruoloMantra: 'DC',
  squadra: 'Inter',
  quotazione: 14,
  votoMedia: 6.6,
};

export const SAMPLE_CENTROCAMPISTA = {
  id: 'p-barella',
  cognome: 'Barella',
  nome: 'Nicolò',
  ruoloMantra: 'M',
  squadra: 'Inter',
  quotazione: 19,
  votoMedia: 6.8,
};

export const SAMPLE_ATTACCANTE = {
  id: 'p-lautaro',
  cognome: 'Martínez',
  nome: 'Lautaro',
  ruoloMantra: 'Pc',
  squadra: 'Inter',
  quotazione: 30,
  votoMedia: 7.2,
};

export function buildLargePool(extraCount = 200) {
  const ruoli = ['Por', 'Dc', 'Ds', 'Dd', 'M', 'C', 'T', 'A', 'W', 'Pc'];
  const squadre = ['Milan', 'Inter', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Bologna'];
  const out = [];
  for (let i = 0; i < extraCount; i++) {
    out.push({
      id: `p-pool-${i}`,
      cognome: `Player${i}`,
      nome: 'Test',
      ruoloMantra: ruoli[i % ruoli.length],
      squadra: squadre[i % squadre.length],
      quotazione: 5 + (i % 25),
      votoMedia: 5.5 + ((i % 30) / 10),
    });
  }
  return out;
}

export const FOUR_PLAYERS = [
  SAMPLE_PORTIERE,
  SAMPLE_DIFENSORE,
  SAMPLE_CENTROCAMPISTA,
  SAMPLE_ATTACCANTE,
];
