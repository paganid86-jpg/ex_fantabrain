import useAppStore from '../store/useAppStore';

const MODEL = 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildSystemPrompt(rosa, giornata, avversario) {
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

  return `Sei FantaBrain AI, l'assistente intelligente per il Fantacalcio Mantra italiano. Parla sempre in italiano. Sei esperto di Serie A, ruoli Mantra (Por, DD, DS, DC, M/C, C, T/A, W, T, A, PC), e strategie di fantacalcio. Rispondi in modo conciso, diretto, e con consigli pratici e azionabili. Non essere generico: usa i dati reali della rosa che ti vengono forniti.

Rosa attuale dell'utente: ${rosaJson}
Giornata corrente: ${giornata}
Prossimo avversario: ${avversario || 'da definire'}`;
}

async function callApi({ systemPrompt, messages, maxTokens }) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    throw new Error('API key Groq non configurata. Imposta VITE_GROQ_API_KEY nel file .env');
  }

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: groqMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API errore ${response.status}: ${err}`);
  }

  const data = await response.json();
  useAppStore.getState().decrementaCrediti();
  return data.choices[0].message.content;
}

export async function callClaude({ systemPrompt, userMessage, maxTokens = 500 }) {
  return callApi({ systemPrompt, messages: [{ role: 'user', content: userMessage }], maxTokens });
}

export async function chatClaude({ messages, systemPrompt, maxTokens = 600 }) {
  return callApi({ systemPrompt, messages, maxTokens });
}

export async function analizzaSchieramento(schieramento, rosa, giornata) {
  const systemPrompt = buildSystemPrompt(rosa, giornata, 'avversario della giornata');
  const userMessage = `Analizza questo schieramento per la giornata ${giornata}: ${JSON.stringify(schieramento)}. Considerando i prossimi avversari e le condizioni dei giocatori, suggerisci al massimo 3 modifiche concrete con motivazione breve. Sii diretto e usa i dati della rosa.`;
  return callClaude({ systemPrompt, userMessage, maxTokens: 500 });
}

export async function valutaOfferta(offerta, rosa) {
  const systemPrompt = buildSystemPrompt(rosa, 28, null);
  const userMessage = `Valuta questa offerta di mercato: ${JSON.stringify(offerta)}. Conviene accettare? Considera la qualità del giocatore offerto rispetto a quello richiesto, il calendario futuro e le esigenze della rosa. Dammi un consiglio chiaro (ACCETTA / RIFIUTA / CONTROPROPONI) con motivazione breve.`;
  return callClaude({ systemPrompt, userMessage, maxTokens: 400 });
}

export async function reportScouting(giocatore) {
  const systemPrompt = `Sei FantaBrain AI, esperto di Fantacalcio Mantra Serie A. Parla in italiano. Sei conciso e diretto.`;
  const userMessage = `Genera un report scouting per ${giocatore.nome} ${giocatore.cognome} (${giocatore.squadra}, ${giocatore.ruoloMantra}) nel Fantacalcio Mantra. Dati: media voti ${giocatore.votoMedia}, ultimi 5: ${giocatore.votiUltimi5?.join(', ')}. Includi: punti di forza, debolezze, consiglio acquisto (SI/NO/FORSE) con motivazione. Max 150 parole.`;
  return callClaude({ systemPrompt, userMessage, maxTokens: 300 });
}

export async function warRoomAnalisi(miaRosa, rosaAvversario, nomeAvversario, giornata) {
  const systemPrompt = buildSystemPrompt(miaRosa, giornata, nomeAvversario);

  const step1 = await callClaude({
    systemPrompt,
    userMessage: `War Room Giornata ${giornata}. Analizza la rosa avversaria di ${nomeAvversario}: ${JSON.stringify(rosaAvversario?.slice(0, 5))}. Quali sono i loro punti di forza e debolezza principali?`,
    maxTokens: 250,
  });

  const step2 = await callClaude({
    systemPrompt,
    userMessage: `Dato che l'avversario ha queste caratteristiche: "${step1}". Quali miei giocatori hanno i match migliori contro di loro? Considera ruoli e rendimento recente.`,
    maxTokens: 250,
  });

  const step3 = await callClaude({
    systemPrompt,
    userMessage: `Basandoti sull'analisi "${step2}", suggerisci: 1) Il modulo ottimale 2) I 3 giocatori da assolutamente schierare 3) Un rischio da evitare. Sii diretto e pratico.`,
    maxTokens: 250,
  });

  return { analisiAvversario: step1, vantaggi: step2, pianoTattico: step3 };
}

export async function analizzaGiornata(titolari, partite, giornata) {
  const systemPrompt = `Sei FantaBrain AI, esperto di Fantacalcio Mantra. Parla in italiano. Sii conciso.`;
  const userMessage = `Analizza la giornata ${giornata} per questi titolari: ${JSON.stringify(titolari.map(g => `${g.nome} ${g.cognome} (${g.squadra})`))}. Partite della giornata: ${JSON.stringify(partite)}. Dimmi chi ha i match migliori e chi rischia. Max 200 parole.`;
  return callClaude({ systemPrompt, userMessage, maxTokens: 400 });
}

export { buildSystemPrompt };
