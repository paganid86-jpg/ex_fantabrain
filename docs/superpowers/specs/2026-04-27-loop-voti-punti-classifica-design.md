# Loop voti → punteggio → classifica (single-player vs bot) — Design

**Data:** 2026-04-27
**Autore:** brainstorming Dante + Claude
**Stato:** approvato in sessione, in attesa di review scritto

## Obiettivo

Chiudere il primo gameplay loop di FantaBrain: l'utente schiera la propria rosa, gioca una giornata contro 7 bot, ottiene fantapunti, vede la classifica aggiornarsi.

Oggi tutto il dominio fantacalcio (leghe, partecipanti, calcolo punti, classifica) è simulato o vuoto: il backend Postgres ha solo `users`, `ai_credits`, `waitlist`, `ai_conversations`; le leghe vivono in localStorage; nessun modulo applica le regole bonus/malus delle settings; la classifica resta inerte.

Questa epica trasforma la modalità "rosa con UI completa" in un gioco vero, **single-player vs 7 bot**, **stagione sintetica 2025/26**, voti **ibridi (dataset statico + fallback simulato)**, calcolo **client**, persistenza **localStorage** (rispettando la regola architetturale corrente).

## Scope dichiarato

### In scope

- Engine di calcolo fantapunti puro, basato sulle settings di lega esistenti (bonus/malus, fasce gol, D-Factor, modificatore portiere)
- Generazione bot: 2 archetipi (`OffensivePush`, `DefensiveWall`), draft della rosa, schieramento giornaliero
- Generazione calendario lega (round-robin andata+ritorno per 8 squadre, 14 giornate)
- Avanzamento giornate ibrido: cooldown 24h con override "Skippa attesa" (max 3/giorno)
- Fonte voti: dataset statico stagione 2025/26 servito dal backend, con fallback simulato deterministico se la giornata non è disponibile
- Persistenza locale (estensione `useLeagueStore` con migrazione `v1 → v2`)
- UI nuova `MatchdayCard` su dashboard, pagina dettaglio giornata, classifica/calendario alimentati da dati reali, pulizia numeri demo
- Smoke test manuali documentati, copertura unit/integration sui moduli puri
- **Opzionale, se avanza tempo**: snapshot lato server per recuperare la lega da altro device (D del Q6)

### Fuori scope (backlog dichiarato)

- Sourcing del dataset voti reali (decisione di prodotto separata)
- Multi-user reale (Postgres dominio, auth multi-tenant, real-time)
- Voti live via API-Football
- Push notification cooldown
- Calciomercato runtime, infortuni dinamici, sospensioni cartellini
- Modalità "Live" ancorata alla Serie A reale corrente
- Bot adattivi (archetipo C esplorato in brainstorming)
- Stagione lunga 38 giornate
- Skip "attesa" Gold-gated
- Replay / annulla giornata già giocata
- Numeri partecipanti diversi da 8 (il wizard li accetta ma producono lega "inattiva" finché non rilasciamo bot per 4/6/10/12)

## Decisioni di prodotto

| Tema | Scelta | Alternative scartate |
|------|--------|----------------------|
| Identità | Single-player vs 7 bot | Multi-user reale subito (rinviato a iter. successiva) |
| Tempo della lega | Stagione sintetica 2025/26 | Live ancorata alla Serie A corrente |
| Fonte voti | Ibrido dataset statico → fallback simulato | Solo simulato; solo API-Football; scraping live |
| Bot — archetipi | 2: `OffensivePush` + `DefensiveWall` | 3-4 archetipi; bot adattivi; bot scheletro identici |
| Avanzamento | Ibrido: cooldown 24h + skip override (cap 3/giorno) | Manuale puro; automatico puro |
| Calcolo | Client (engine puro JS) | Server (richiederebbe schema dominio nuovo, contraddice CLAUDE.md) |
| Persistenza | localStorage Zustand v2 (+ snapshot opzionale server) | Postgres dominio leghe |
| Lunghezza stagione | 14 giornate (A/R con 8 squadre) | 38; configurabile dall'utente |
| Rosa min utente | 15 giocatori per giocare la 1ª giornata | 11; 25 |
| Draft | Utente prima, bot dopo | Bot prima (sarebbe più difficile) |
| Skip cooldown | Cap 3 al giorno reale, gratis | Illimitato; Gold-gated |
| Numero partecipanti | Fisso 8 in MVP | Tutte le dimensioni del wizard subito |

## Architettura

### Vista d'insieme

L'epica si scompone in **moduli puri** (testabili in isolamento), un **orchestrator** che li coordina, un **livello di integrazione** con Zustand, e una **rotta backend read-only** per servire i voti.

```
src/lib/season/
├── voti.js              ← fonte voti unificata: dataset → fallback simulato
├── fantapunti.js        ← engine: voti + bonus/malus + fasceGol → punteggio
├── botStrategy.js       ← draft rosa + schieramento per archetipo bot
├── calendar.js          ← round-robin lega
└── playMatchday.js      ← orchestrator: legge voti, calcola, aggrega

server/data/voti-2025-26/
└── matchday-{N}.json    ← uno per giornata, statico

server/routes/voti.js    ← GET /api/voti/:season/matchday/:n

src/hooks/useCountdown.js               ← ticker condiviso
src/components/dashboard/MatchdayCard.jsx ← nuovo
src/pages/MatchdayDetail.jsx            ← nuovo
```

### Principio di separazione

I moduli sotto `src/lib/season/` sono **funzioni pure**: nessun side effect, nessun I/O, nessuna dipendenza da Zustand o React. Questo significa:

- Test unitari triviali (input → output atteso)
- Riutilizzabili lato server quando passeremo al multi-user
- Debug deterministico (dato lo stesso seed, stesso risultato)

L'unico punto di integrazione con lo store è `useLeagueStore.playMatchday(leagueId)`, che:

1. Recupera la lega corrente
2. Chiama `fetch('/api/voti/...')`
3. Invoca l'orchestrator puro
4. Scrive il risultato (un singolo `set(...)`)

I componenti React **non** contengono logica di gioco: leggono `currentLeague.standings` / `matchdayResults` con selettori reattivi e chiamano `playMatchday()` in risposta a click.

## Modello dati (estensioni a `useLeagueStore`)

### Versioning

Lo store passa da `name: 'fantabrain-leagues'` (v1 implicita) a `version: 2` con `migrate(state, fromVersion)` che inizializza i nuovi campi su leghe esistenti. La migrazione è non distruttiva: leghe legacy ricevono `seasonStatus: 'pending'` e `bots: []` / `calendar: []` vuoti, finché l'utente non avvia la stagione tramite un CTA "Inizializza stagione" sulla dashboard.

### Schema esteso per ogni `league`

```js
{
  // ...campi esistenti (id, inviteCode, settings, myRoster, participants...)

  bots: [
    {
      id: 'bot-1',
      name: 'FC Drago',                  // pool predefinito di 24, 7 estratti
      archetype: 'OffensivePush',        // 'OffensivePush' | 'DefensiveWall'
      roster: [/* ~25 player objects */],
      currentLineup: null,               // transitorio durante playMatchday
    },
  ],

  calendar: [
    {
      matchday: 1,
      pairings: [
        { home: 'user', away: 'bot-3' },
        { home: 'bot-1', away: 'bot-5' },
        { home: 'bot-2', away: 'bot-7' },
        { home: 'bot-4', away: 'bot-6' },
      ],
    },
    // ...14 giornate
  ],

  matchdayResults: [
    {
      matchday: 1,
      playedAt: '2026-04-27T15:00:00Z',
      voteSourceMatchday: 1,             // giornata Serie A storica usata
      voteSourceMode: 'dataset',         // 'dataset' | 'simulated'
      teams: {
        'user': {
          lineup: [/* playerId[] */],
          benchUsedFor: { /* slotPlayerId: substitutePlayerId */ },
          rawScores: [/* { playerId, voto, gol, assist, ammo, esp, ... } */],
          fantapunti: 73.5,
          golFatti: 2,
        },
        'bot-1': { /* idem */ },
      },
      matches: [
        {
          home: 'user', away: 'bot-3',
          homePts: 73.5, awayPts: 68.0,
          homeGoals: 2, awayGoals: 2,
          result: 'X',                    // '1' | 'X' | '2'
        },
      ],
    },
  ],

  standings: [
    {
      teamId: 'user',
      name: 'La mia squadra',
      G: 1, V: 0, N: 1, P: 0,
      GF: 2, GS: 2, DR: 0,
      Pt: 1,
      fantaTotali: 73.5,
      ultimo: 73.5,
      andamento: [73.5],
    },
  ],

  currentMatchday: 1,                    // prossima giornata da giocare (1..14)
  nextMatchdayUnlocksAt: null,           // ISO; null = subito, altrimenti countdown
  cooldownHours: 24,                     // configurabile (env override in dev)
  skipsToday: { date: '2026-04-27', count: 0 },  // resettato a ogni nuovo giorno

  seasonStatus: 'pending',               // 'pending' | 'active' | 'completed'
  isPlayingMatchday: false,              // lock per evitare doppio play
}
```

**Lineup utente — dove vive prima del play:**

Il lineup utente è **già gestito** da `useAppStore.schieramento` (store esistente). `playMatchday` lo legge al momento dell'invocazione (`useAppStore.getState().schieramento`) e ne **congela una copia** in `matchdayResults[].teams.user.lineup`. Conseguenze:

- L'utente può modificare il lineup tutte le volte che vuole finché non clicca "Gioca": l'unica fotografia che conta è quella al momento del play.
- Una volta giocata la giornata, il lineup di quella giornata è immutabile (perché è in `matchdayResults`, append-only).
- Non serve un bottone "Conferma per Giornata X" sulla pagina Schieramento: il punto di "conferma" è il click "Gioca" sulla dashboard.

**Reset di `skipsToday`:**

A ogni accesso ai metodi che leggono/scrivono `skipsToday`, lo store fa un check implicito: se `skipsToday.date !== today` (data locale formato `YYYY-MM-DD`), il record viene resettato a `{ date: today, count: 0 }` prima del check del cap. Niente cron, niente scheduler: lazy reset al primo accesso del giorno nuovo.

**Note sul modello:**

- `bots[].roster` è la fonte di verità della rosa di un bot per tutta la stagione (no calciomercato in MVP).
- I bot vengono draftati al **primo `playMatchday`** (non alla creazione lega), così "utente prima" ha senso: l'utente costruisce la sua rosa, poi i bot pescano dal pool ridotto.
- `matchdayResults` è **append-only** e contiene tutto il necessario per ricostruire una giornata (pagina dettaglio, riepilogo).
- `standings` è derived state: lo persistiamo per evitare ricalcoli, ma esiste `recomputeStandings(leagueId)` che lo rigenera dal log di `matchdayResults`.
- `bots[].currentLineup` è transitorio (dentro `playMatchday`), non persistito.
- Identificatori partecipanti: `'user'` per l'utente, `'bot-1'..'bot-7'` per i bot. Stringhe deterministiche, semplificano calendario e matches.

### Validazioni

- **Rosa utente per giocare la prima giornata**: ≥ 15 giocatori, di cui ≥ 1 portiere e ≥ 1 attaccante. Se < 15 → CTA "Gioca" disabilitato con tooltip in italiano "Aggiungi almeno 15 giocatori".
- **Lineup utente per giornata**: ≥ 0 (la riserva d'ufficio copre slot vuoti col `votoRiserva` delle settings, default 4).
- **Player nel lineup ma non in rosa**: filtrato silenziosamente, slot diventa riserva d'ufficio.

## Componenti / moduli chiave

### `src/lib/season/voti.js`

Responsabilità: caricare i voti per una giornata, con fallback simulato se la fonte è indisponibile o un singolo player non è mappato.

```js
// Pubblica
export async function loadMatchdayVoti(season, matchday, playerIds) {
  // 1. fetch GET /api/voti/{season}/matchday/{matchday}
  // 2. per ogni playerId richiesto: cerca nel dataset
  //    - mappatura primaria: by id
  //    - fallback: by surname + team
  // 3. se non trovato → simulateVoto(player, matchday)
  // 4. ritorna { players: { [playerId]: rawScore }, mode: 'dataset' | 'simulated' }
  //    mode = 'simulated' se la fetch è fallita o se ZERO player erano nel dataset
}

export function simulateVoto(player, matchday) {
  // pseudo-random deterministico (seed = hash(playerId + matchday))
  // - voto base = player.media ± rumore gaussiano (σ=0.5)
  // - gol/assist/cartellini con probabilità coerenti col ruolo
  // - clamp [4.0, 9.0]
}
```

### `src/lib/season/fantapunti.js`

Funzione pura. Applica le regole bonus/malus delle settings di lega.

```js
export function computeFantapunti(rawScore, leagueSettings) {
  // voto + golSegnato*3 + assist*1 + ammo*-0.5 + ...
  // D-Factor (se attivo): bonus difensivo per portiere+difensori
  // Modificatore portiere se attivo
  // ritorna numero (es. 7.5)
}

export function computeFasciaGol(fantapuntiSquadra, fasceConfig) {
  // 'progressive' (66, 72, 77, 82, 87, ...) → numero gol
  // 'fisse' (66 = 1, 72 = 2, ...)
  // 'custom' (legge da settings.fasceCustom se presente)
  // ritorna intero (gol fatti)
}
```

### `src/lib/season/botStrategy.js`

Generazione rosa e schieramento per archetipo.

```js
export function draftBotRoster(archetype, allPlayers, budget, rosterSize, seed) {
  // OffensivePush: spende >50% budget su attaccanti, modulo target 3-4-3
  // DefensiveWall: spende >40% budget su portiere+difensori, modulo target 5-3-2
  // rispetta vincolo "disponibilità singola" delle settings (no overlap rose)
  // ritorna array di rosterSize player objects
}

export function pickBotLineup(bot, matchday, leagueSettings) {
  // - sceglie modulo target (80% target, 20% alternativo, deterministico)
  // - per ogni slot del modulo: prende il player con miglior media nel ruolo
  // - applica errore 5% (sceglie #2 anziché #1) deterministicamente
  // ritorna { lineup: [11 playerId], modulo: '4-3-3' }
}
```

### `src/lib/season/calendar.js`

```js
export function generateRoundRobin(teamIds, type, seed) {
  // 8 teamIds → andata 7 giornate + ritorno 7 = 14 totali
  // algoritmo classico round-robin tournament
  // ritorna [{ matchday: 1, pairings: [...] }, ...]
}
```

### `src/lib/season/playMatchday.js` (orchestrator)

```js
export async function playMatchday(league, voteSource) {
  // 1. valida pre-condizioni (rosa user >= 15, lineup esiste, currentMatchday <= 14, not isPlayingMatchday, cooldown ok)
  // 2. se seasonStatus === 'pending': drafta i bot, genera calendar, status → 'active'
  // 3. colleziona playerIds da utente + 7 bot
  // 4. await loadMatchdayVoti(season, currentMatchday, playerIds)
  // 5. per ogni squadra:
  //    a. resolve lineup (user → user.lineup, bot → pickBotLineup)
  //    b. applica riserva d'ufficio per slot mancanti
  //    c. computeFantapunti per ogni player schierato
  //    d. somma squadra + computeFasciaGol → gol
  // 6. risolve calendar[currentMatchday].pairings → matches
  // 7. ritorna { matchdayResult, updatedStandings }
  //    (lo store applica il set, l'orchestrator non scrive)
}
```

### Backend

**Rotta:** `GET /api/voti/:season/matchday/:n`

- Serve il file statico `server/data/{season}/matchday-{n}.json`
- 200 con shape `{ players: { "<playerId>": { voto, gol, assist, ... } }, source: 'dataset', season, matchday }`
- 404 se il file non esiste → frontend cade su simulato totale (toast "modalità demo")
- Cache headers aggressivi (`Cache-Control: public, max-age=86400`, immutable): è statico
- Niente JWT (fonte voti pubblica per tutti gli utenti, è un dato di stagione)

### UI nuove / modifiche

- **`src/hooks/useCountdown.js`** — hook puro `(targetIso) => 'HH:MM:SS' | null`, riusato da CountdownCard esistente e da MatchdayCard nuovo
- **`src/components/dashboard/MatchdayCard.jsx`** — nuovo, 4 stati: `pending` (lega senza stagione avviata, CTA "Avvia stagione"), `locked` (countdown attivo, CTA "Skippa attesa"), `ready` (CTA "Gioca giornata X"), `completed` (mostra esito ultima giornata, CTA "Vedi dettaglio")
- **`src/components/dashboard/CountdownCard.jsx`** — invariato. Coesiste con `MatchdayCard` (uno informa sulla Serie A reale, l'altro è gameplay lega)
- **`src/pages/Schieramento.jsx`** — invariato per quanto riguarda il lineup utente (già funzionante via `useAppStore.schieramento`). Il "punto di conferma" del lineup è il click "Gioca" sulla dashboard, non un bottone separato qui. Eventuali piccoli aggiustamenti di copy ("Schiera per la prossima giornata") restano confinati a etichette.
- **`src/pages/Classifica.jsx`** — già reattiva su `currentLeague.standings`, va solo verificata
- **`src/pages/Calendario.jsx`** — collegata a `currentLeague.calendar` + risultati da `matchdayResults` (oggi mostra "vs Da definire")
- **`src/pages/MatchdayDetail.jsx` (nuovo)** — rotta `/giornata/:n`, mostra lineup, voti, gol, le 4 partite della giornata
- **`src/pages/Statistiche.jsx`** — pulizia numeri demo (462pt, 64.0, "V/P/S undefined"), tutto da `matchdayResults`, empty state pulito
- **`src/pages/Dashboard.jsx`** — pulizia numeri demo (G14 73pt -4 sulla media 2/8), empty state se stagione non iniziata

### Nuovi metodi su `useLeagueStore`

```js
{
  // ...esistenti...

  // Esegue una giornata. Throws su pre-condizioni non rispettate.
  playMatchday: async (leagueId) => { ... },

  // True se la rosa è valida E (cooldown scaduto OR non c'è cooldown).
  canPlayNow: (leagueId) => { ... },

  // Forza nextMatchdayUnlocksAt = now. Conta verso skipsToday.
  // Throws se skipsToday.count >= 3.
  skipCooldown: (leagueId) => { ... },

  // Rigenera standings da matchdayResults. Utility di robustezza.
  recomputeStandings: (leagueId) => { ... },
}
```

Il lineup utente NON è un metodo dello store leghe: è già in `useAppStore.schieramento` e viene letto da `playMatchday` al momento del play.

## Data flow di una giornata giocata

Sequenza completa per "utente clicca Gioca G15":

```
[UI MatchdayCard] → [useLeagueStore.playMatchday]
  - lock: isPlayingMatchday = true (CTA disabled)
  - validate (rosa ≥ 15, lineup, cooldown, currentMatchday ≤ 14, not already played)
  - if seasonStatus === 'pending': drafta bot, genera calendar, status → 'active'
  - gather playerIds (lineup user + 7 bot rosters flat)
  - fetch GET /api/voti/2025-26/matchday/15
      ├── 200 → loadMatchdayVoti returns { players, mode: 'dataset' }
      └── 404 / network err → tutti i player passano da simulateVoto, mode: 'simulated' + toast
  - playMatchday orchestrator:
      - per ogni team: lineup → riserva d'ufficio se mancanti → computeFantapunti → somma → fascia gol
      - resolve calendar[15].pairings → matches con risultato
  - set:
      - matchdayResults.push(result)
      - standings = recomputed
      - currentMatchday += 1
      - nextMatchdayUnlocksAt = now + cooldownHours
      - if currentMatchday > 14: seasonStatus = 'completed'
      - isPlayingMatchday = false
[UI] → re-render: MatchdayCard mostra "completed" con esito breve, CTA "Vedi dettaglio" → /giornata/15
```

### Casi limite e protezioni

| Caso | Comportamento |
|------|---------------|
| Doppio click su "Gioca" | Lock `isPlayingMatchday` blocca la seconda chiamata |
| Replay stessa giornata | `playMatchday` controlla `matchdayResults.find(r => r.matchday === currentMatchday)` → throw `AlreadyPlayed` |
| Network error fetch voti | Soft fail → fallback simulato totale + toast italiano "Voti reali non disponibili, giornata generata in modalità demo" |
| Lineup vuoto | Tutti gli 11 slot diventano riserva d'ufficio (voto 4) |
| Player nel lineup ma non in rosa | Filtrato silenziosamente |
| Rosa < 15 | CTA disabled prima del click; se forzato, throw `RosterTooSmall` |
| Stagione completata | Throw `SeasonCompleted`, dashboard mostra CTA "Crea nuova lega" |
| Skip esauriti (3/3 oggi) | Bottone "Skippa" disabled con label "Skip esauriti, riprova domani" |

### Cosa NON fa l'engine in MVP

- No calciomercato (rosa fissa per tutta la stagione, sia utente sia bot)
- No infortuni dinamici (il flag `infortunato` esiste ma è informativo, non blocca lo schieramento)
- No sospensioni cartellini (un giocatore espulso può essere schierato la giornata dopo)
- No sostituzioni proattive bot (i bot schierano 11; slot mancanti = riserva d'ufficio)
- No replay / annulla giornata

## Strategia di test

### Unit (moduli puri)

`src/lib/season/__tests__/`

- **`fantapunti.test.js`** — il più critico. Voto + bonus singoli, tutti combinati, D-Factor con/senza portiere, modificatore portiere, fasce gol progressive/fisse/custom, edge case (voto 0, voto < 4, somma negativa). Snapshot rosa fittizia → fantapunti atteso ("ground truth"). Target 100% statements, 95%+ branch.
- **`botStrategy.test.js`** — draft per archetipo (proporzioni budget), determinismo seed, pool ridotto post-utente, pool insufficiente (throw), `pickBotLineup` modulo + errore 5% riproducibile.
- **`calendar.test.js`** — 8 squadre = 14 giornate, ogni coppia 2 volte (home/away invertiti), determinismo, 4/6/10 squadre come estensione futura.
- **`voti.test.js`** (`simulateVoto`) — determinismo, distribuzione (1000 campioni media ≈ player.media ±0.1), clamp [4, 9], probabilità gol coerenti col ruolo.

### Integration

`src/lib/season/__tests__/playMatchday.integration.test.js`

- Scenario felice (lega completa, voti dataset)
- Fallback simulato (fetch 404)
- Doppio play → `AlreadyPlayed`
- Rosa < 15 → `RosterTooSmall`
- Lineup vuoto → tutti riserva d'ufficio
- Player extraneous nel lineup → filtrato
- Stagione completata dopo G14

### Store + persistence

`src/stores/__tests__/useLeagueStore.test.js`

- Lock `isPlayingMatchday` evita race
- `skipCooldown` conta nel giorno reale (mock `Date.now`)
- `skipCooldown` 4ª volta stesso giorno → throw
- Migrazione persist v1→v2: blob legacy → idratazione con `seasonStatus: 'pending'` e campi default

### UI (mirati)

`src/components/dashboard/__tests__/MatchdayCard.test.jsx`

- Snapshot dei 4 stati (`pending` / `locked` / `ready` / `completed`)
- Click "Skippa" chiama `skipCooldown`
- Click "Gioca" chiama `playMatchday` e disabilita CTA durante l'await
- Skip esauriti → disabled con label corretta

### Smoke test manuali (pre-deploy)

1. Crea lega, aggiungi 15 giocatori reali, "Gioca G1" → risultato + classifica + dashboard aggiornata
2. "Gioca G1" di nuovo → errore esplicito, niente duplicati
3. "Skippa" 3 volte oggi, alla 4ª → bloccato
4. DevTools offline → "Gioca G2" → toast "modalità demo", giornata si gioca
5. localStorage v1 manuale → dashboard mostra "Inizializza stagione" e procede
6. Gioca tutte 14 giornate → `seasonStatus: 'completed'`, CTA "Crea nuova lega"

## Rollout — 5 chunk sequenziali

Ogni chunk ha *exit criterion* verificabile, non lascia il sistema in stato rotto. Una branch per chunk, una PR per chunk, naming `claude/chunk-N-<topic>-SESSIONID`.

### Chunk 1 — Engine puro

Scrivere e testare i 4 moduli puri sotto `src/lib/season/`, senza toccare nient'altro.

**Exit:** `npm test src/lib/season` verde, coverage ≥ target. Nessuna modifica visibile in app.

### Chunk 2 — Backend voti

Rotta `/api/voti/:season/matchday/:n`, struttura `server/data/`, fixture di esempio (NON il dataset reale), test backend, `loadMatchdayVoti` lato client con fetch + fallback.

**Exit:** `curl localhost:3000/api/voti/2025-26/matchday/15` → 200 JSON; `.../matchday/99` → 404. `loadMatchdayVoti` testata su entrambi i percorsi.

### Chunk 3 — Store + orchestrator

Modello dati esteso, migrazione persist v2, `playMatchday` orchestrator, lock, skip-counter. Tutti i metodi nuovi su `useLeagueStore`.

**Exit:** in console del browser, `await store.playMatchday(...)` produce risultati coerenti. UI ancora non sa che esiste.

### Chunk 4 — UI gameplay

`useCountdown` hook, `MatchdayCard`, Classifica/Calendario (verifica reattività su dati ora popolati), nuova pagina `/giornata/:n`, toast italiano per fallback simulato e skip esauriti. Schieramento: solo eventuali aggiustamenti di copy.

**Exit:** smoke test 1-4 verdi.

### Chunk 5 — Cleanup, statistiche, snapshot opzionale

Pulizia numeri demo (Statistiche, Dashboard), aggiornamento CLAUDE.md (regola architetturale + endpoint voti), `api-conventions.md`. **Opzionale**: endpoint `POST /api/leagues/:id/snapshot` con tabella `league_snapshots` JSONB minimale + bottone "Salva su account".

**Exit:** smoke test 5-6 verdi. CLAUDE.md riflette il nuovo stato. Snapshot opzionale solo se Chunk 4 chiude in tempo.

### Dipendenze

```
Chunk 1 ─┐
         ├──→ Chunk 3 ──→ Chunk 4 ──→ Chunk 5
Chunk 2 ─┘
```

Chunk 1 e 2 parallelizzabili. 3-4-5 strettamente sequenziali.

## Impatto su CLAUDE.md e regole esistenti

La regola corrente "Sistema leghe: MVP localStorage-only, NO chiamate backend per le leghe" resta valida ma va affinata: le **leghe** continuano a vivere in localStorage, ma i **voti** sono serviti dal backend (read-only, no JWT, statici). L'endpoint `/api/voti/` va aggiunto alla documentazione `api-conventions.md`. Aggiornamenti in Chunk 5.

## Telemetria minima

Console log strutturati in dev, niente in prod (in linea col progetto). Eventi loggati: `playMatchday:start`, `playMatchday:done`, `voti:fetched`, `voti:fallback-simulated`, `bots:drafted`, `season:started`, `season:completed`. Servono per QA, non analytics utente.

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Dataset voti reale non disponibile per data ship | Fallback simulato totale → l'app gira lo stesso. Sourcing dataset trattato come decisione di prodotto separata, non blocca il plan. |
| Bug calcolo fantapunti su edge case | Coverage 100% su `fantapunti.js`, snapshot test con ground truth, `recomputeStandings` come safety net. |
| Migrazione persist v1→v2 corrompe leghe esistenti | Migrazione non distruttiva (campi additivi, default sensati), test specifico, leghe legacy ricevono `seasonStatus: 'pending'`. |
| Bot troppo forti / troppo deboli (squilibrio) | Errore 5% nello schieramento + mix 4/3 archetipi. Tunable post-launch via costanti in `botStrategy.js` senza modifiche allo schema. |
| LocalStorage size limit (5-10MB) con `matchdayResults` | 14 giornate × ~8 squadre × ~25 player × ~50 byte ≈ 140KB. Margine ampio. Monitorato in chunk 3 con un test di sanity. |
| Utente cambia device e perde la lega | Limitazione conscia (esiste già). Snapshot opzionale (D) come follow-up nello stesso plan se avanza tempo. |

## Aperture future (cosa abilita questo design)

- **Multi-user reale**: l'engine essendo puro è pronto per essere chiamato lato server. Sostituire `useLeagueStore.playMatchday` con un `POST /api/leagues/:id/play-matchday` non richiede toccare `fantapunti.js` o `playMatchday.js`.
- **Voti live**: la `loadMatchdayVoti` ha già la shape standardizzata. Sostituire la sorgente da JSON statico a fetch verso API-Football è un solo modulo da modificare.
- **Modalità Live ancorata Serie A reale**: aggiungere un flag `mode: 'live' | 'sintetica'` alla creazione lega; in modalità live il `currentMatchday` segue la giornata Serie A reale conclusa.
- **Bot adattivi**: gli archetipi sono macchina a stati banale; trasformarli in "macchina che impara" significa aggiungere `bot.history` e usarla in `pickBotLineup`.
- **Stagione lunga 38 giornate**: cambiare `generateRoundRobin` per ciclare A/R/A multipli, niente altro.
