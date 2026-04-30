// src/lib/season/__fixtures__/leagueSettings.js
export const DEFAULT_BONUS_MALUS = {
  golSegnato: 3,
  golSubitoPortiere: -1,
  assist: 1,
  ammonizione: -0.5,
  espulsione: -1,
  rigoreSegnato: 3,
  rigoreSbagliato: -3,
  rigoreParato: 3,
  autogol: -2,
  cleanSheetPortiere: 1,
  assistDaFermo: 1,
};

export const SETTINGS_CLASSIC = {
  modalitaGioco: 'classic',
  fonteVoti: 'fantabrain',
  dFactor: false,
  dFactorIncludePortiere: false,
  modificatoreRendimento: false,
  fattoreFairPlay: false,
  fattoreCapitano: false,
  bonusMalus: { ...DEFAULT_BONUS_MALUS },
  fasceGol: 'progressive',
  votoRiserva: 4,
};

export const SETTINGS_MANTRA_FULL = {
  modalitaGioco: 'mantra',
  fonteVoti: 'fantabrain',
  dFactor: true,
  dFactorIncludePortiere: true,
  modificatoreRendimento: true,
  fattoreFairPlay: false,
  fattoreCapitano: false,
  bonusMalus: { ...DEFAULT_BONUS_MALUS },
  fasceGol: 'progressive',
  votoRiserva: 4,
};
