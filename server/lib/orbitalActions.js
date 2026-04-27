export const AI_ORBITAL_ACTIONS = [
  'valutaOfferta',
  'reportScouting',
  'warRoomAnalisi',
  'analizzaGiornata',
];

export const AI_ORBITAL_ACTION_COSTS = {
  valutaOfferta: 1,
  reportScouting: 1,
  warRoomAnalisi: 3,
  analizzaGiornata: 1,
};

const DEFAULT_SYSTEM_PROMPT = [
  'Sei FantaBrain AI, assistente esperto di Fantacalcio Mantra italiano.',
  'Parla sempre in italiano, con tono diretto e operativo.',
  'Usa solo il contesto fornito. Se un dato manca, dichiaralo brevemente e ragiona con prudenza.',
].join(' ');

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactPlayer(player = {}) {
  return {
    nome: [player.nome, player.cognome].filter(Boolean).join(' ').trim() || player.name || player.nome || null,
    squadra: player.squadra || player.team || null,
    ruolo: player.ruoloMantra || player.ruolo || player.position || null,
    media: player.votoMedia ?? player.media ?? null,
    ultimi5: player.votiUltimi5 || player.ultimi5 || null,
    quotazione: player.quotazione ?? null,
    infortunato: Boolean(player.infortunato),
    diffidato: Boolean(player.diffidato),
  };
}

function compactRoster(roster) {
  return safeArray(roster).slice(0, 40).map(compactPlayer);
}

function asJson(value, maxLength = 5000) {
  return JSON.stringify(value ?? null).slice(0, maxLength);
}

function buildBaseSystemPrompt(payload = {}) {
  const giornata = payload.giornata || payload.giornataCorrente || 'da definire';
  const rosa = compactRoster(payload.rosa || payload.miaRosa);

  return [
    DEFAULT_SYSTEM_PROMPT,
    `Giornata fantacalcio: ${giornata}.`,
    `Rosa utente: ${asJson(rosa, 6000)}.`,
  ].join('\n');
}

function buildTradeOffer(payload) {
  return {
    action: 'valutaOfferta',
    maxTokens: 450,
    systemPrompt: buildBaseSystemPrompt(payload),
    userMessage: [
      'Valuta questa offerta di mercato fantacalcio.',
      `Offerta: ${asJson(payload.offerta, 3000)}.`,
      'Analizza giocatori coinvolti, bisogni della rosa, ruoli Mantra, copertura reparti, rendimento e contesto della prossima giornata.',
      'Rispondi con questo formato:',
      'Verdetto: ACCETTA | RIFIUTA | CONTROPROPONI',
      'Motivazione: massimo 5 righe concrete.',
      'Controproposta: solo se il verdetto e CONTROPROPONI.',
    ].join('\n'),
  };
}

function buildScoutingReport(payload) {
  return {
    action: 'reportScouting',
    maxTokens: 400,
    systemPrompt: buildBaseSystemPrompt(payload),
    userMessage: [
      'Genera un report scouting per questo giocatore.',
      `Giocatore: ${asJson(compactPlayer(payload.giocatore || payload.player), 2000)}.`,
      'Considera valore fantacalcio, ruolo Mantra, continuita, bonus, rischi e fit con la rosa utente.',
      'Rispondi con questo formato:',
      'Forze: elenco breve.',
      'Debolezze: elenco breve.',
      'Verdetto: SI | NO | FORSE',
      'Motivazione: massimo 4 righe.',
    ].join('\n'),
  };
}

function buildWarRoomAnalysis(payload) {
  return {
    action: 'warRoomAnalisi',
    maxTokens: 900,
    responseFormat: 'json',
    systemPrompt: buildBaseSystemPrompt(payload),
    userMessage: [
      `Prepara una War Room pre-partita contro: ${payload.nomeAvversario || payload.avversario || 'avversario da definire'}.`,
      `Rosa avversario nota: ${asJson(compactRoster(payload.rosaAvversario), 5000)}.`,
      'Produci esattamente 3 step: avversario, vantaggi, piano tattico.',
      'Rispondi solo in JSON valido con chiavi: "analisiAvversario", "vantaggi", "pianoTattico".',
      'Ogni valore deve essere testo italiano breve, pratico e leggibile.',
    ].join('\n'),
  };
}

function buildMatchdayAnalysis(payload) {
  return {
    action: 'analizzaGiornata',
    maxTokens: 500,
    systemPrompt: buildBaseSystemPrompt(payload),
    userMessage: [
      'Analizza la prossima giornata per i titolari indicati.',
      `Titolari: ${asJson(compactRoster(payload.titolari), 4000)}.`,
      `Partite/contesto: ${asJson(payload.partite || payload.matches, 5000)}.`,
      'Indica match migliori e rischi per i titolari.',
      'Rispondi con sezioni: Match migliori, Rischi, Mosse consigliate. Massimo 180 parole.',
    ].join('\n'),
  };
}

const builders = {
  valutaOfferta: buildTradeOffer,
  reportScouting: buildScoutingReport,
  warRoomAnalisi: buildWarRoomAnalysis,
  analizzaGiornata: buildMatchdayAnalysis,
};

const verdictPatterns = {
  valutaOfferta: ['ACCETTA', 'RIFIUTA', 'CONTROPROPONI'],
  reportScouting: ['SI', 'NO', 'FORSE'],
};

export function buildOrbitalActionRequest(action, payload = {}) {
  const builder = builders[action];
  if (!builder) {
    throw new Error('Azione AI non supportata');
  }
  return builder(payload || {});
}

function parseJsonObject(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export function parseOrbitalActionResponse(action, content) {
  const text = String(content || '').trim();
  const parsed = { action, content: text };

  const allowedVerdicts = verdictPatterns[action];
  if (allowedVerdicts) {
    const upper = text.toUpperCase();
    parsed.verdict = allowedVerdicts.find((verdict) => upper.includes(verdict)) || null;
  }

  if (action === 'warRoomAnalisi') {
    const json = parseJsonObject(text);
    if (json) {
      parsed.analisiAvversario = String(json.analisiAvversario || '').trim();
      parsed.vantaggi = String(json.vantaggi || '').trim();
      parsed.pianoTattico = String(json.pianoTattico || '').trim();
    }
  }

  return parsed;
}
