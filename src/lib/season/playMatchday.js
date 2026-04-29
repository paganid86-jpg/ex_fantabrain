// src/lib/season/playMatchday.js
import { computeFantapunti, computeFasciaGol } from './fantapunti.js';
import { loadMatchdayVoti } from './voti.js';
import { pickBotLineup } from './botStrategy.js';

/**
 * Orchestrator puro. Prende lo stato lega + lineup utente, ritorna il risultato della giornata.
 * NON modifica nulla: lo store applica il `set()` con il valore di ritorno.
 */
export async function playMatchday(league) {
  const md = league.currentMatchday;

  if (!league.calendar || md > league.calendar.length) {
    throw new Error(`SeasonCompleted: matchday ${md} > calendar length ${league.calendar?.length ?? 0}`);
  }
  if ((league.userRoster?.length ?? 0) < 15) {
    throw new Error('RosterTooSmall: user roster < 15');
  }
  if (league.matchdayResults?.find((r) => r.matchday === md)) {
    throw new Error(`AlreadyPlayed: matchday ${md} già giocato`);
  }

  const userLineupIds = (league.userLineup || []).filter((id) =>
    league.userRoster.some((p) => p.id === id)
  );
  const botLineups = {};
  for (const bot of league.bots) {
    botLineups[bot.id] = pickBotLineup(bot, md);
  }

  const allPlayersForFetch = [];
  const seen = new Set();
  for (const p of league.userRoster) { if (!seen.has(p.id)) { allPlayersForFetch.push(p); seen.add(p.id); } }
  for (const bot of league.bots) {
    for (const p of bot.roster) { if (!seen.has(p.id)) { allPlayersForFetch.push(p); seen.add(p.id); } }
  }

  const season = league.settings?.stagione ?? '2025-26';
  const voti = await loadMatchdayVoti(season, md, allPlayersForFetch);

  const teams = {};

  function computeTeam(teamId, lineupIds, roster, modulo) {
    const playedScores = [];
    const expectedSize = 11;

    const validLineup = lineupIds.filter((id) => roster.some((p) => p.id === id));

    for (const pid of validLineup) {
      const player = roster.find((p) => p.id === pid);
      const raw = voti.players[pid];
      if (!raw) continue;
      playedScores.push({ playerId: pid, player, ...raw });
    }

    const missingSlots = expectedSize - validLineup.length;
    const votoRiserva = league.settings?.votoRiserva ?? 4;
    for (let i = 0; i < missingSlots; i++) {
      playedScores.push({
        playerId: `__riserva-${teamId}-${i}`,
        player: { ruoloMantra: 'C' },
        voto: votoRiserva,
        gol: 0, assist: 0, ammonizione: 0, espulsione: 0,
        autogol: 0, rigoreSegnato: 0, rigoreSbagliato: 0, rigoreParato: 0,
        golSubiti: 0, cleanSheet: false,
        riservaUfficio: true,
      });
    }

    const rawScores = playedScores.map((s) => ({
      playerId: s.playerId,
      voto: s.voto, gol: s.gol, assist: s.assist,
      ammonizione: s.ammonizione, espulsione: s.espulsione,
      autogol: s.autogol, rigoreSegnato: s.rigoreSegnato,
      rigoreSbagliato: s.rigoreSbagliato, rigoreParato: s.rigoreParato,
      golSubiti: s.golSubiti, cleanSheet: s.cleanSheet,
      riservaUfficio: !!s.riservaUfficio,
    }));

    const fp = playedScores.reduce((sum, s) => {
      return sum + computeFantapunti(s, league.settings);
    }, 0);
    const fantapunti = Math.round(fp * 10) / 10;
    const golFatti = computeFasciaGol(fantapunti, league.settings?.fasceGol ?? 'progressive');

    teams[teamId] = {
      lineup: validLineup,
      modulo,
      rawScores,
      fantapunti,
      golFatti,
    };
  }

  computeTeam('user', userLineupIds, league.userRoster, league.userModulo ?? '4-3-3');
  for (const bot of league.bots) {
    computeTeam(bot.id, botLineups[bot.id].lineup, bot.roster, botLineups[bot.id].modulo);
  }

  const matchdayCalendar = league.calendar.find((c) => c.matchday === md);
  const matches = matchdayCalendar.pairings.map((p) => {
    const homeT = teams[p.home];
    const awayT = teams[p.away];
    const homePts = homeT.fantapunti;
    const awayPts = awayT.fantapunti;
    const homeGoals = homeT.golFatti;
    const awayGoals = awayT.golFatti;
    let result;
    if (homeGoals > awayGoals) result = '1';
    else if (homeGoals < awayGoals) result = '2';
    else result = 'X';
    return { home: p.home, away: p.away, homePts, awayPts, homeGoals, awayGoals, result };
  });

  const matchdayResult = {
    matchday: md,
    playedAt: new Date().toISOString(),
    voteSourceMatchday: md,
    voteSourceMode: voti.mode,
    teams,
    matches,
  };

  const updatedStandings = recomputeStandings(
    [...(league.matchdayResults || []), matchdayResult],
    league.calendar
  );

  return { matchdayResult, updatedStandings };
}

/**
 * Ricalcola le standings dal log completo dei risultati.
 */
export function recomputeStandings(allResults, calendar) {
  const teamSet = new Set();
  for (const md of calendar) for (const p of md.pairings) { teamSet.add(p.home); teamSet.add(p.away); }
  const standings = {};
  for (const tid of teamSet) {
    standings[tid] = { teamId: tid, name: tid, G: 0, V: 0, N: 0, P: 0, GF: 0, GS: 0, DR: 0, Pt: 0, fantaTotali: 0, ultimo: 0, andamento: [] };
  }

  for (const r of allResults) {
    for (const m of r.matches) {
      const h = standings[m.home], a = standings[m.away];
      h.G++; a.G++;
      h.GF += m.homeGoals; h.GS += m.awayGoals;
      a.GF += m.awayGoals; a.GS += m.homeGoals;
      if (m.result === '1') { h.V++; h.Pt += 3; a.P++; }
      else if (m.result === '2') { a.V++; a.Pt += 3; h.P++; }
      else { h.N++; a.N++; h.Pt++; a.Pt++; }
    }
    for (const tid of teamSet) {
      const tFp = r.teams[tid]?.fantapunti ?? 0;
      standings[tid].fantaTotali += tFp;
      standings[tid].ultimo = tFp;
      standings[tid].andamento.push(tFp);
    }
  }

  for (const s of Object.values(standings)) s.DR = s.GF - s.GS;

  return Object.values(standings).sort((a, b) =>
    b.Pt - a.Pt || b.DR - a.DR || b.fantaTotali - a.fantaTotali
  );
}
