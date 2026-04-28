import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateRoundRobin } from '../calendar.js';

const TEAMS_8 = ['user', 'bot-1', 'bot-2', 'bot-3', 'bot-4', 'bot-5', 'bot-6', 'bot-7'];

describe('generateRoundRobin — 8 squadre andata+ritorno', () => {
  const cal = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'seed-1');

  it('14 giornate', () => {
    assert.equal(cal.length, 14);
  });

  it('ogni giornata ha 4 incontri', () => {
    for (const md of cal) assert.equal(md.pairings.length, 4);
  });

  it('ogni squadra gioca esattamente 1 partita per giornata', () => {
    for (const md of cal) {
      const teams = new Set();
      for (const p of md.pairings) {
        assert.ok(!teams.has(p.home), `${p.home} duplicato in md ${md.matchday}`);
        assert.ok(!teams.has(p.away), `${p.away} duplicato in md ${md.matchday}`);
        teams.add(p.home);
        teams.add(p.away);
      }
      assert.equal(teams.size, 8);
    }
  });

  it('ogni squadra ha 7 home e 7 away nella stagione completa', () => {
    for (const team of TEAMS_8) {
      let homeCount = 0, awayCount = 0;
      for (const md of cal) {
        for (const p of md.pairings) {
          if (p.home === team) homeCount++;
          if (p.away === team) awayCount++;
        }
      }
      assert.equal(homeCount, 7, `${team} home count`);
      assert.equal(awayCount, 7, `${team} away count`);
    }
  });

  it('determinismo: stesso seed → stesso calendario', () => {
    const a = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'seed-x');
    const b = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'seed-x');
    assert.deepEqual(a, b);
  });

  it('seed diversi → almeno una giornata diversa', () => {
    const a = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'A');
    const b = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'B');
    assert.notDeepEqual(a, b);
  });
});

describe('generateRoundRobin — type "andata"', () => {
  it('solo andata = 7 giornate', () => {
    const cal = generateRoundRobin(TEAMS_8, 'andata', 'seed-1');
    assert.equal(cal.length, 7);
  });
});
