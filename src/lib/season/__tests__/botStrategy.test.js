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
