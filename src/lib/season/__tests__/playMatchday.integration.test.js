import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { playMatchday } from '../playMatchday.js';
import { draftBotRoster } from '../botStrategy.js';
import { generateRoundRobin } from '../calendar.js';
import { buildLargePool } from '../__fixtures__/playerSamples.js';
import { SETTINGS_CLASSIC } from '../__fixtures__/leagueSettings.js';

function makeLeague(pool) {
  const used = new Set();
  const bots = [];
  for (let i = 1; i <= 7; i++) {
    const archetype = i % 2 === 0 ? 'DefensiveWall' : 'OffensivePush';
    const roster = draftBotRoster(archetype, pool, 500, 25, `bot-${i}`, { excludeIds: used });
    roster.forEach((p) => used.add(p.id));
    bots.push({ id: `bot-${i}`, name: `Bot ${i}`, archetype, roster });
  }

  const remaining = pool.filter((p) => !used.has(p.id)).slice(0, 15);

  const calendar = generateRoundRobin(
    ['user', 'bot-1', 'bot-2', 'bot-3', 'bot-4', 'bot-5', 'bot-6', 'bot-7'],
    'andata_ritorno',
    'L1'
  );

  return {
    id: 'L1',
    settings: SETTINGS_CLASSIC,
    bots,
    calendar,
    matchdayResults: [],
    currentMatchday: 1,
    userRoster: remaining,
    userLineup: remaining.slice(0, 11).map((p) => p.id),
  };
}

describe('playMatchday — happy path', () => {
  globalThis.fetch = mock.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
  const pool = buildLargePool(300);
  const league = makeLeague(pool);

  it('produce un matchdayResult valido', async () => {
    const r = await playMatchday(league);
    assert.equal(r.matchdayResult.matchday, 1);
    assert.ok(r.matchdayResult.teams.user);
    for (let i = 1; i <= 7; i++) assert.ok(r.matchdayResult.teams[`bot-${i}`]);
  });

  it('ogni squadra ha fantapunti numerici', async () => {
    const r = await playMatchday(league);
    for (const teamId of Object.keys(r.matchdayResult.teams)) {
      const t = r.matchdayResult.teams[teamId];
      assert.equal(typeof t.fantapunti, 'number');
      assert.ok(t.fantapunti >= 0);
    }
  });

  it('matches sono coerenti col calendario', async () => {
    const r = await playMatchday(league);
    assert.equal(r.matchdayResult.matches.length, 4);
    for (const m of r.matchdayResult.matches) {
      assert.ok(['1', 'X', '2'].includes(m.result));
    }
  });

  it('updatedStandings ha 8 squadre', async () => {
    const r = await playMatchday(league);
    assert.equal(r.updatedStandings.length, 8);
  });

  it('voteSourceMode = "simulated" quando fetch 404', async () => {
    const r = await playMatchday(league);
    assert.equal(r.matchdayResult.voteSourceMode, 'simulated');
  });
});

describe('playMatchday — errori', () => {
  it('throw se rosa user < 15', async () => {
    const pool = buildLargePool(300);
    const league = makeLeague(pool);
    league.userRoster = league.userRoster.slice(0, 10);
    await assert.rejects(() => playMatchday(league), /RosterTooSmall/);
  });

  it('throw se currentMatchday > calendar.length', async () => {
    const pool = buildLargePool(300);
    const league = makeLeague(pool);
    league.currentMatchday = 99;
    await assert.rejects(() => playMatchday(league), /SeasonCompleted/);
  });

  it('throw se giornata già in matchdayResults', async () => {
    const pool = buildLargePool(300);
    const league = makeLeague(pool);
    league.matchdayResults = [{ matchday: 1, teams: {}, matches: [] }];
    await assert.rejects(() => playMatchday(league), /AlreadyPlayed/);
  });
});
