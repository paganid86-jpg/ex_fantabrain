// src/lib/season/voti.js

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

function eventProbs(ruolo) {
  const r = (ruolo || '').toLowerCase();
  if (r === 'por') return { gol: 0.001, assist: 0.005, ammo: 0.05, esp: 0.005, rigPar: 0.02, rigSeg: 0.001, rigSbag: 0.001, autogol: 0.005, golSubitiMu: 1.2, csProb: 0.3 };
  if (['dc', 'dd', 'ds'].includes(r)) return { gol: 0.04, assist: 0.05, ammo: 0.18, esp: 0.01, rigPar: 0, rigSeg: 0.01, rigSbag: 0.005, autogol: 0.01, golSubitiMu: 0, csProb: 0 };
  if (['m', 'c', 't', 'w'].includes(r)) return { gol: 0.12, assist: 0.12, ammo: 0.18, esp: 0.01, rigPar: 0, rigSeg: 0.02, rigSbag: 0.01, autogol: 0.005, golSubitiMu: 0, csProb: 0 };
  return { gol: 0.30, assist: 0.10, ammo: 0.12, esp: 0.005, rigPar: 0, rigSeg: 0.05, rigSbag: 0.02, autogol: 0.001, golSubitiMu: 0, csProb: 0 };
}

export function simulateVoto(player, matchday) {
  const seed = hashStr(`${player.id}|${matchday}`);
  const rng = mulberry32(seed);
  const probs = eventProbs(player.ruoloMantra);

  const u1 = rng() || 1e-9;
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const idBias = ((hashStr(player.id) % 10000) / 10000 - 0.5) * 0.3;
  let voto = (player.votoMedia ?? 6) + z * 0.5 + idBias;
  voto = Math.max(4, Math.min(9, Math.round(voto * 2) / 2));

  const gol = rng() < probs.gol ? 1 : 0;
  const assist = rng() < probs.assist ? 1 : 0;
  const ammonizione = rng() < probs.ammo ? 1 : 0;
  const espulsione = rng() < probs.esp ? 1 : 0;
  const rigoreParato = rng() < probs.rigPar ? 1 : 0;
  const rigoreSegnato = rng() < probs.rigSeg ? 1 : 0;
  const rigoreSbagliato = rng() < probs.rigSbag ? 1 : 0;
  const autogol = rng() < probs.autogol ? 1 : 0;

  let golSubiti = 0;
  let cleanSheet = false;
  if (probs.golSubitiMu > 0) {
    const r = rng();
    if (r < 0.30) { golSubiti = 0; cleanSheet = true; }
    else if (r < 0.65) golSubiti = 1;
    else if (r < 0.88) golSubiti = 2;
    else golSubiti = 3;
  }

  return { voto, gol, assist, ammonizione, espulsione, rigoreParato, rigoreSegnato, rigoreSbagliato, autogol, golSubiti, cleanSheet };
}
