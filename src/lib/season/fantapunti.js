// src/lib/season/fantapunti.js

/**
 * Calcola i fantapunti per un singolo player schierato.
 * @param {Object} rawScore — { player, voto, gol?, assist?, ammonizione?, espulsione?, autogol?, rigoreSegnato?, rigoreSbagliato?, rigoreParato?, golSubiti?, cleanSheet? }
 * @param {Object} leagueSettings — settings.bonusMalus + flags D-Factor / modificatori
 * @returns {number} fantapunti (può essere negativo)
 */
export function computeFantapunti(rawScore, leagueSettings) {
  const v = rawScore.voto || 0;
  if (v === 0) return 0;

  const bm = leagueSettings.bonusMalus || {};
  let pts = v;

  pts += (rawScore.gol || 0) * (bm.golSegnato ?? 3);
  pts += (rawScore.assist || 0) * (bm.assist ?? 1);
  pts += (rawScore.ammonizione || 0) * (bm.ammonizione ?? -0.5);
  pts += (rawScore.espulsione || 0) * (bm.espulsione ?? -1);
  pts += (rawScore.rigoreSegnato || 0) * (bm.rigoreSegnato ?? 3);
  pts += (rawScore.rigoreSbagliato || 0) * (bm.rigoreSbagliato ?? -3);
  pts += (rawScore.rigoreParato || 0) * (bm.rigoreParato ?? 3);
  pts += (rawScore.autogol || 0) * (bm.autogol ?? -2);

  const isPortiere = rawScore.player?.ruoloMantra === 'Por';
  if (isPortiere) {
    pts += (rawScore.golSubiti || 0) * (bm.golSubitoPortiere ?? -1);
    if (rawScore.cleanSheet) pts += (bm.cleanSheetPortiere ?? 1);
  }

  return Math.round(pts * 10) / 10;
}
