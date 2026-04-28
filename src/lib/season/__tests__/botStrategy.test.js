import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { draftBotRoster, BOT_NAME_POOL } from '../botStrategy.js';
import { buildLargePool } from '../__fixtures__/playerSamples.js';

const RUOLI_ATTACCO = ['a', 'pc', 'w', 't'];
const RUOLI_DIFESA = ['por', 'dc', 'dd', 'ds'];
const isAttacco = (r) => RUOLI_ATTACCO.includes((r || '').toLowerCase());
const isDifesa = (r) => RUOLI_DIFESA.includes((r || '').toLowerCase());

describe('draftBotRoster — OffensivePush', () => {
  const pool = buildLargePool(300);

  it('drafta 25 giocatori', () => {
    const r = draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1');
    assert.equal(r.length, 25);
  });

  it('spende > 40% budget su attacco', () => {
    const r = draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1');
    const totalBudget = r.reduce((s, p) => s + p.quotazione, 0);
    const attaccoBudget = r.filter((p) => isAttacco(p.ruoloMantra)).reduce((s, p) => s + p.quotazione, 0);
    assert.ok(attaccoBudget / totalBudget > 0.4, `ratio attacco: ${attaccoBudget / totalBudget}`);
  });
});

describe('draftBotRoster — DefensiveWall', () => {
  const pool = buildLargePool(300);

  it('drafta 25 giocatori', () => {
    const r = draftBotRoster('DefensiveWall', pool, 500, 25, 'seed-1');
    assert.equal(r.length, 25);
  });

  it('spende > 30% budget su difesa+portiere', () => {
    const r = draftBotRoster('DefensiveWall', pool, 500, 25, 'seed-1');
    const totalBudget = r.reduce((s, p) => s + p.quotazione, 0);
    const difesaBudget = r.filter((p) => isDifesa(p.ruoloMantra)).reduce((s, p) => s + p.quotazione, 0);
    assert.ok(difesaBudget / totalBudget > 0.30, `ratio difesa: ${difesaBudget / totalBudget}`);
  });
});

describe('draftBotRoster — vincoli', () => {
  it('determinismo: stesso seed → stessa rosa', () => {
    const pool = buildLargePool(300);
    const a = draftBotRoster('OffensivePush', pool, 500, 25, 'X');
    const b = draftBotRoster('OffensivePush', pool, 500, 25, 'X');
    assert.deepEqual(a.map((p) => p.id), b.map((p) => p.id));
  });

  it('non draft player già esclusi (excludeIds)', () => {
    const pool = buildLargePool(300);
    const exclude = new Set(pool.slice(0, 50).map((p) => p.id));
    const r = draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1', { excludeIds: exclude });
    for (const p of r) {
      assert.ok(!exclude.has(p.id), `player ${p.id} doveva essere escluso`);
    }
  });

  it('throw se pool insufficiente', () => {
    const pool = buildLargePool(10);
    assert.throws(() => draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1'));
  });
});

describe('BOT_NAME_POOL', () => {
  it('contiene almeno 14 nomi', () => {
    assert.ok(BOT_NAME_POOL.length >= 14);
  });

  it('nessun duplicato', () => {
    assert.equal(new Set(BOT_NAME_POOL).size, BOT_NAME_POOL.length);
  });
});

import { pickBotLineup } from '../botStrategy.js';

describe('pickBotLineup', () => {
  const pool = buildLargePool(300);
  const rosterOff = draftBotRoster('OffensivePush', pool, 500, 25, 'L1');
  const botOff = { id: 'bot-1', archetype: 'OffensivePush', roster: rosterOff };

  it('schiera 11 giocatori', () => {
    const r = pickBotLineup(botOff, 1);
    assert.equal(r.lineup.length, 11);
  });

  it('tutti i giocatori sono nella rosa', () => {
    const r = pickBotLineup(botOff, 1);
    const rosterIds = new Set(rosterOff.map((p) => p.id));
    for (const id of r.lineup) assert.ok(rosterIds.has(id), `${id} fuori rosa`);
  });

  it('include sempre 1 portiere', () => {
    const r = pickBotLineup(botOff, 1);
    const portieri = r.lineup.filter((id) => {
      const p = rosterOff.find((x) => x.id === id);
      return (p?.ruoloMantra || '').toLowerCase() === 'por';
    });
    assert.equal(portieri.length, 1);
  });

  it('determinismo per stesso (bot, matchday)', () => {
    const a = pickBotLineup(botOff, 5);
    const b = pickBotLineup(botOff, 5);
    assert.deepEqual(a, b);
  });

  it('OffensivePush usa modulo offensivo (3-4-3 o 4-3-3)', () => {
    const r = pickBotLineup(botOff, 1);
    assert.ok(['3-4-3', '4-3-3'].includes(r.modulo));
  });

  it('DefensiveWall usa modulo difensivo (5-3-2 o 5-4-1)', () => {
    const rosterDef = draftBotRoster('DefensiveWall', pool, 500, 25, 'L2');
    const botDef = { id: 'bot-2', archetype: 'DefensiveWall', roster: rosterDef };
    const r = pickBotLineup(botDef, 1);
    assert.ok(['5-3-2', '5-4-1'].includes(r.modulo));
  });
});
