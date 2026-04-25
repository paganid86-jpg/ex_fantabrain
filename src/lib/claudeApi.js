// serieAContext: { currentMatchday, standings, scorers, nextMatches } - opzionale
function buildSystemPrompt(rosa = [], giornata, avversario, serieAContext = null) {
  const rosaJson = JSON.stringify(
    rosa.map((g) => ({
      nome: `${g.nome} ${g.cognome}`,
      squadra: g.squadra,
      ruolo: g.ruoloMantra,
      media: g.votoMedia,
      ultimi5: g.votiUltimi5,
      infortunato: g.infortunato,
      diffidato: g.diffidato,
    }))
  );

  let serieAStr = '';
  if (serieAContext) {
    const { currentMatchday, standings, scorers, nextMatches } = serieAContext;

    if (standings?.length) {
      const top5 = standings.slice(0, 5).map((t) => `${t.position}. ${t.name} (${t.points}pt)`).join(', ');
      serieAStr += `\nClassifica Serie A (G${currentMatchday}): ${top5}`;
    }
    if (scorers?.length) {
      const top5 = scorers.slice(0, 5).map((s) => `${s.name} (${s.teamName}): ${s.goals} gol`).join(', ');
      serieAStr += `\nTop marcatori Serie A: ${top5}`;
    }
    if (nextMatches?.length) {
      const partite = nextMatches.slice(0, 5).map((m) => `${m.homeTeam.name} vs ${m.awayTeam.name}`).join(', ');
      serieAStr += `\nProssime partite Serie A G${currentMatchday}: ${partite}`;
    }
  }

  return `Sei FantaBrain AI, l'assistente intelligente per il Fantacalcio Mantra italiano. Parla sempre in italiano. Sei esperto di Serie A, ruoli Mantra (Por, DD, DS, DC, M/C, C, T/A, W, T, A, PC), e strategie di fantacalcio. Rispondi in modo conciso, diretto, e con consigli pratici e azionabili. Non essere generico: usa i dati reali della rosa che ti vengono forniti.

Rosa attuale dell'utente: ${rosaJson}
Giornata corrente: ${giornata}
Prossimo avversario: ${avversario || 'da definire'}${serieAStr}`;
}

async function getAppStore() {
  const { default: useAppStore } = await import('../store/useAppStore.js');
  return useAppStore.getState();
}

async function callApi({ systemPrompt, messages, maxTokens }) {
  const { user } = await getAppStore();
  const userMessage = messages.find((m) => m.role === 'user')?.content || '';

  const response = await fetch('/api/ai/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`,
    },
    body: JSON.stringify({ systemPrompt, userMessage, maxTokens }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI errore ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content;
}

async function callOrbitalAction(action, payload = {}) {
  const { user, setAiCrediti, setResetAt } = await getAppStore();

  const response = await fetch('/api/ai/orbital-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`,
    },
    body: JSON.stringify({ action, payload }),
  });

  if (response.status === 402) {
    const data = await response.json();
    setAiCrediti(0);
    if (data.resetAt) setResetAt(data.resetAt);
    throw new Error('NO_CREDITS');
  }
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'AI_ERROR');
  }

  const data = await response.json();
  if (data.creditsRemaining != null) setAiCrediti(data.creditsRemaining);
  return data;
}

export async function callClaude({ systemPrompt, userMessage, maxTokens = 500 }) {
  return callApi({ systemPrompt, messages: [{ role: 'user', content: userMessage }], maxTokens });
}

// chatClaude routes to backend /api/ai/chat (Anthropic SDK, credit-gated)
export async function chatClaude({ messages, systemPrompt, maxTokens = 600 }) {
  const { user, setAiCrediti, setResetAt } = await getAppStore();

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
    body: JSON.stringify({ messages, systemPrompt, maxTokens }),
  });

  if (response.status === 402) {
    const data = await response.json();
    setAiCrediti(0);
    if (data.resetAt) setResetAt(data.resetAt);
    throw new Error('NO_CREDITS');
  }
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error('AI_ERROR');

  const data = await response.json();
  if (data.creditsRemaining != null) setAiCrediti(data.creditsRemaining);
  return data.content;
}

export async function analizzaSchieramento(schieramento, rosa, giornata) {
  const systemPrompt = buildSystemPrompt(rosa, giornata, 'avversario della giornata');
  const userMessage = `Analizza questo schieramento per la giornata ${giornata}: ${JSON.stringify(schieramento)}. Considerando i prossimi avversari e le condizioni dei giocatori, suggerisci al massimo 3 modifiche concrete con motivazione breve. Sii diretto e usa i dati della rosa.`;
  return callClaude({ systemPrompt, userMessage, maxTokens: 500 });
}

export async function valutaOfferta(offerta, rosa) {
  const data = await callOrbitalAction('valutaOfferta', { offerta, rosa });
  return data.content;
}

export async function reportScouting(giocatore) {
  const { rosa } = await getAppStore();
  const data = await callOrbitalAction('reportScouting', { giocatore, rosa });
  return data.content;
}

export async function warRoomAnalisi(miaRosa, rosaAvversario, nomeAvversario, giornata) {
  const data = await callOrbitalAction('warRoomAnalisi', {
    miaRosa,
    rosaAvversario,
    nomeAvversario,
    giornata,
  });

  return {
    analisiAvversario: data.analisiAvversario || data.content,
    vantaggi: data.vantaggi || '',
    pianoTattico: data.pianoTattico || '',
  };
}

export async function analizzaGiornata(titolari, partite, giornata) {
  const { rosa } = await getAppStore();
  const data = await callOrbitalAction('analizzaGiornata', { titolari, partite, giornata, rosa });
  return data.content;
}

export async function warRoomShare(token, analysisText, matchContext) {
  const res = await fetch('/api/ai/warroom-share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ analysisText, matchContext }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Errore creazione link');
  }
  return res.json(); // returns { id, url, expiresAt }
}

export { buildSystemPrompt };
