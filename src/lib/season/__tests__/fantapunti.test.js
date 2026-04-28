import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeFantapunti } from '../fantapunti.js';
import { SETTINGS_CLASSIC, SETTINGS_MANTRA_FULL } from '../__fixtures__/leagueSettings.js';
import { SAMPLE_ATTACCANTE, SAMPLE_PORTIERE } from '../__fixtures__/playerSamples.js';

describe('computeFantapunti — base', () => {
  it('voto puro senza eventi → ritorna il voto', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 6.5 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 6.5);
  });

  it('voto + 1 gol → +3', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 6.5, gol: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 9.5);
  });

  it('voto + 1 assist → +1', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 6.5, assist: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 7.5);
  });

  it('ammonizione → -0.5', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 7, ammonizione: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 6.5);
  });

  it('espulsione → -1', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 7, espulsione: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 6);
  });

  it('combinazione gol+assist+ammo', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 7, gol: 1, assist: 1, ammonizione: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 10.5);
  });

  it('voto 0 (non giocato) → 0', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 0 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 0);
  });
});

describe('computeFantapunti — portiere', () => {
  it('portiere con clean sheet → +1', () => {
    const rs = { player: SAMPLE_PORTIERE, voto: 6.5, cleanSheet: true, golSubiti: 0 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 7.5);
  });

  it('portiere con 2 gol subiti → -2', () => {
    const rs = { player: SAMPLE_PORTIERE, voto: 6, golSubiti: 2 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 4);
  });

  it('portiere con rigore parato → +3', () => {
    const rs = { player: SAMPLE_PORTIERE, voto: 6.5, rigoreParato: 1 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 9.5);
  });

  it('giocatore di movimento NON conta golSubiti', () => {
    const rs = { player: SAMPLE_ATTACCANTE, voto: 7, golSubiti: 5 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 7);
  });
});
