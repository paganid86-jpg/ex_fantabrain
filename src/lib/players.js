// src/lib/players.js
// Helper per costruire il pool flat dei giocatori Serie A da useSerieAStore.teams.
// Estratto da Scouting.jsx — single source of truth.

const POSITION_TO_MANTRA = {
  Goalkeeper: 'Por',
  Defence:    'DC',
  Midfield:   'C',
  Offence:    'A',
};

const QUOTA_RANGE = {
  Goalkeeper: [8,  22],
  Defence:    [6,  20],
  Midfield:   [8,  26],
  Offence:    [12, 40],
};

const MEDIA_RANGE = {
  Goalkeeper: [6.1, 6.9],
  Defence:    [6.0, 6.8],
  Midfield:   [6.2, 7.1],
  Offence:    [6.4, 7.5],
};

function stimaStats(player) {
  const seed = (player.id * 7 + 13) % 100;
  const pos  = player.position || 'Midfield';

  const [minQ, maxQ] = QUOTA_RANGE[pos] || [8, 20];
  const [minM, maxM] = MEDIA_RANGE[pos] || [6.2, 6.9];

  const quota = minQ + Math.round((seed / 100) * (maxQ - minQ));
  const media = +(minM + (seed / 100) * (maxM - minM)).toFixed(1);

  const votiUltimi5 = Array.from({ length: 5 }, (_, i) => {
    const raw = media + ((seed * (i + 3)) % 20) * 0.05 - 0.5;
    return Math.round(Math.max(5.0, Math.min(8.5, raw)) * 10) / 10;
  });

  return {
    votoMedia:    media,
    quotazione:   quota,
    votiUltimi5,
    infortunato:  seed % 16 === 0,
    diffidato:    seed % 9  === 0,
  };
}

function splitName(fullName = '') {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return { nome: '', cognome: parts[0] };
  return {
    nome:    parts.slice(0, -1).join(' '),
    cognome: parts[parts.length - 1],
  };
}

/**
 * Trasforma `useSerieAStore.teams` in un array flat di player objects
 * con la shape consumata da useAppStore.rosa, draftBotRoster, ecc.
 */
export function flattenSerieAPlayers(teams) {
  return (teams || []).flatMap((team) =>
    (team.squad || []).map((player) => {
      const stats = stimaStats(player);
      const { nome, cognome } = splitName(player.name);
      return {
        id: player.id,
        nome, cognome,
        ruoloMantra: POSITION_TO_MANTRA[player.position] || 'C',
        squadra: team.shortName || team.name,
        ...stats,
      };
    })
  );
}
