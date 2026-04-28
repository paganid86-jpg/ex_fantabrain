import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { simulateVoto, loadMatchdayVoti } from '../voti.js';
import { SAMPLE_ATTACCANTE, SAMPLE_PORTIERE, SAMPLE_DIFENSORE } from '../__fixtures__/playerSamples.js';

describe('simulateVoto', () => {
  it('è deterministico: stesso (player, matchday) → stesso risultato', () => {
    const a = simulateVoto(SAMPLE_ATTACCANTE, 5);
    const b = simulateVoto(SAMPLE_ATTACCANTE, 5);
    assert.deepEqual(a, b);
  });

  it('player diversi → risultati diversi (almeno il voto)', () => {
    const a = simulateVoto(SAMPLE_ATTACCANTE, 5);
    const b = simulateVoto(SAMPLE_PORTIERE, 5);
    assert.notEqual(a.voto, b.voto);
  });

  it('matchday diversi → risultati diversi', () => {
    const a = simulateVoto(SAMPLE_ATTACCANTE, 5);
    const b = simulateVoto(SAMPLE_ATTACCANTE, 6);
    assert.notEqual(a.voto, b.voto);
  });

  it('voto è sempre nel range [4, 9]', () => {
    for (let m = 1; m <= 38; m++) {
      const r = simulateVoto(SAMPLE_ATTACCANTE, m);
      assert.ok(r.voto >= 4 && r.voto <= 9, `voto out of range: ${r.voto} per md ${m}`);
    }
  });

  it('media campionaria su 100 simulazioni ≈ player.media (±0.5)', () => {
    const samples = [];
    for (let m = 1; m <= 100; m++) samples.push(simulateVoto(SAMPLE_ATTACCANTE, m).voto);
    const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
    const expected = SAMPLE_ATTACCANTE.votoMedia;
    assert.ok(Math.abs(avg - expected) < 0.5, `avg=${avg}, expected=${expected}`);
  });

  it('attaccante segna gol con probabilità maggiore del difensore', () => {
    let golAtt = 0, golDif = 0;
    for (let m = 1; m <= 200; m++) {
      golAtt += simulateVoto(SAMPLE_ATTACCANTE, m).gol;
      golDif += simulateVoto(SAMPLE_DIFENSORE, m).gol;
    }
    assert.ok(golAtt > golDif, `attaccanti ${golAtt} vs difensori ${golDif}`);
  });

  it('shape output completa', () => {
    const r = simulateVoto(SAMPLE_ATTACCANTE, 1);
    for (const k of ['voto', 'gol', 'assist', 'ammonizione', 'espulsione', 'autogol', 'rigoreSegnato', 'rigoreSbagliato', 'rigoreParato', 'golSubiti', 'cleanSheet']) {
      assert.ok(k in r, `manca chiave ${k}`);
    }
  });
});

describe('loadMatchdayVoti', () => {
  it('200 dataset → mode "dataset", merge con player non mappati simulati', async () => {
    const fakeFetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        players: {
          'p-lautaro': { voto: 7.5, gol: 1, assist: 0 },
        },
      }),
    }));
    globalThis.fetch = fakeFetch;

    const players = [SAMPLE_ATTACCANTE, SAMPLE_PORTIERE];
    const r = await loadMatchdayVoti('2025-26', 1, players);

    assert.equal(r.mode, 'dataset');
    assert.equal(r.players[SAMPLE_ATTACCANTE.id].voto, 7.5);
    assert.equal(r.players[SAMPLE_ATTACCANTE.id].gol, 1);
    assert.ok(r.players[SAMPLE_PORTIERE.id]);
    assert.ok('voto' in r.players[SAMPLE_PORTIERE.id]);
  });

  it('404 → mode "simulated", tutti i player simulati', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ error: 'not found' }),
    }));

    const players = [SAMPLE_ATTACCANTE, SAMPLE_PORTIERE];
    const r = await loadMatchdayVoti('2025-26', 99, players);

    assert.equal(r.mode, 'simulated');
    assert.ok(r.players[SAMPLE_ATTACCANTE.id]);
    assert.ok(r.players[SAMPLE_PORTIERE.id]);
  });

  it('network error → mode "simulated"', async () => {
    globalThis.fetch = mock.fn(async () => { throw new Error('ECONNREFUSED'); });

    const r = await loadMatchdayVoti('2025-26', 1, [SAMPLE_ATTACCANTE]);
    assert.equal(r.mode, 'simulated');
    assert.ok(r.players[SAMPLE_ATTACCANTE.id]);
  });

  it('dataset vuoto (zero player mappati) → mode "simulated"', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ players: {} }),
    }));

    const r = await loadMatchdayVoti('2025-26', 1, [SAMPLE_ATTACCANTE]);
    assert.equal(r.mode, 'simulated');
  });
});
