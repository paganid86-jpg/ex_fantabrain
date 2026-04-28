// src/lib/season/calendar.js

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function singleRoundRobin(teams, rng) {
  const n = teams.length;
  if (n % 2 !== 0) throw new Error('round-robin requires even number of teams');

  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const rounds = [];
  const fixed = shuffled[0];
  let rotating = shuffled.slice(1);

  for (let round = 0; round < n - 1; round++) {
    const pairings = [];
    pairings.push({ home: fixed, away: rotating[0] });
    for (let i = 1; i < n / 2; i++) {
      pairings.push({ home: rotating[i], away: rotating[n - 1 - i] });
    }
    rounds.push(pairings);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  return rounds;
}

/**
 * Genera il calendario lega.
 * @param {Array<string>} teamIds — es. ['user', 'bot-1', ..., 'bot-7']
 * @param {string} type — 'andata' | 'andata_ritorno'
 * @param {string} seed — stringa deterministica (es. league.id)
 * @returns {Array<{ matchday: number, pairings: Array<{home,away}> }>}
 */
export function generateRoundRobin(teamIds, type, seed) {
  const rng = mulberry32(hashStr(seed));
  const andata = singleRoundRobin(teamIds, rng);

  const matches = [];
  andata.forEach((round, idx) => matches.push({ matchday: idx + 1, pairings: round }));

  if (type === 'andata_ritorno') {
    andata.forEach((round, idx) => {
      const ritorno = round.map((p) => ({ home: p.away, away: p.home }));
      matches.push({ matchday: andata.length + idx + 1, pairings: ritorno });
    });
  }

  return matches;
}
