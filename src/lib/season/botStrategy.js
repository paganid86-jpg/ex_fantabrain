// src/lib/season/botStrategy.js

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
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

export const BOT_NAME_POOL = [
  'FC Drago', 'Aquile Rosse', 'Tornado FC', 'Stella Blu', 'Guerrieri',
  'FC Fulmine', 'I Leoni', 'Lupi Neri', 'Furia Gialla', 'Cobra United',
  'AC Phoenix', 'Tigri Reali', 'Falchi del Nord', 'Squali FC',
  'Atletico Vortice', 'Scorpioni FC', 'Dragoni Verdi', 'Pantere',
  'Real Cometa', 'Inter Sirius', 'AS Boreale', 'FC Eclissi',
  'Toro Bianco', 'AC Galassia',
];

const ATTACCO = new Set(['a', 'pc', 'w', 't']);
const DIFESA = new Set(['por', 'dc', 'dd', 'ds']);
const PORTIERE = new Set(['por']);
const isRole = (player, set) => set.has((player.ruoloMantra || '').toLowerCase());

const ARCHETYPE_QUOTAS = {
  OffensivePush: { por: 3, difesa: 7, centro: 7, attacco: 8 },
  DefensiveWall: { por: 3, difesa: 10, centro: 8, attacco: 4 },
};

const ATTACK_PRIORITY = {
  OffensivePush: 1.5,
  DefensiveWall: 0.7,
};
const DEFENSE_PRIORITY = {
  OffensivePush: 0.7,
  DefensiveWall: 1.5,
};

export function draftBotRoster(archetype, allPlayers, budget, rosterSize, seed, opts = {}) {
  const exclude = opts.excludeIds || new Set();
  const rng = mulberry32(hashStr(`${seed}|${archetype}`));

  const pool = allPlayers.filter((p) => !exclude.has(p.id));

  const attackPrio = ATTACK_PRIORITY[archetype] ?? 1;
  const defensePrio = DEFENSE_PRIORITY[archetype] ?? 1;
  const scored = pool.map((p) => {
    const isAtk = isRole(p, ATTACCO);
    const isDef = isRole(p, DIFESA);
    // Per i ruoli prioritari l'archetipo cerca top-player (alta quotazione, alto voto).
    // Per i ruoli non prioritari l'archetipo cerca low-cost (alto voto, bassa quotazione)
    // così da concentrare il budget sui ruoli chiave.
    let prio = 1;
    if (isAtk) prio = attackPrio;
    else if (isDef) prio = defensePrio;
    const votoMedia = p.votoMedia ?? 6;
    const quot = p.quotazione ?? 1;
    // quotazione weight è positivo se prio>1 (vogliamo pagare di più) e negativo se prio<1.
    const quotCoef = (prio - 1) * 4; // 1.5 → +2, 1 → 0, 0.7 → -1.2
    let score = votoMedia * 10 + quot * quotCoef;
    score *= prio;
    score += rng() * 5;
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const quotas = ARCHETYPE_QUOTAS[archetype] ?? { por: 3, difesa: 8, centro: 8, attacco: 6 };
  const taken = [];
  const counts = { por: 0, difesa: 0, centro: 0, attacco: 0 };

  function categoryOf(p) {
    if (isRole(p, PORTIERE)) return 'por';
    if (isRole(p, DIFESA)) return 'difesa';
    if (isRole(p, ATTACCO)) return 'attacco';
    return 'centro';
  }

  for (const { p } of scored) {
    if (taken.length >= rosterSize) break;
    const cat = categoryOf(p);
    if (counts[cat] < quotas[cat]) {
      taken.push(p);
      counts[cat]++;
    }
  }

  for (const { p } of scored) {
    if (taken.length >= rosterSize) break;
    if (!taken.includes(p)) taken.push(p);
  }

  if (taken.length < rosterSize) {
    throw new Error(`draftBotRoster: pool insufficiente, ${taken.length}/${rosterSize} draftati`);
  }

  return taken;
}
