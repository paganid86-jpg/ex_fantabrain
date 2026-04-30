# Convenzioni API — FantaBrain

## Regola fondamentale di sicurezza

**MAI esporre chiavi API nel codice client (frontend).** Tutto passa dal backend Express con JWT.

## AI — Groq (principale)

- Tutte le chiamate AI (tranne chatClaude) → `/api/ai/groq` (backend JWT-gated)
- Client centralizzato: `src/lib/claudeApi.js`
- Modello: `llama-3.3-70b-versatile`
- Env var backend: `GROQ_API_KEY` (NON `VITE_GROQ_API_KEY` — rinominata il 25/03/2026)
- La chiave non deve mai apparire nel bundle frontend

## AI — Anthropic Claude (chatbot Gold)

- Solo per `chatClaude` → `/api/ai/chat` (backend JWT-gated)
- Modello: `claude-sonnet-4-6`
- Env var backend: `ANTHROPIC_API_KEY`
- La chiave non deve mai apparire nel bundle frontend
- Ogni chiamata deve avere `max_tokens: 1000` salvo eccezioni documentate

## Dati calcio — football-data.org (attuale)

- Client: `src/services/footballApi.js`
- Tutte le chiamate passano da `/api/football/` (Vite proxy in dev, Express in prod)
- **MAI chiamare api.football-data.org direttamente dai componenti** — usare sempre lo store
- Cache TTL: standings 6h, teams 24h, matches 1h
- Env var backend: `FOOTBALL_DATA_API_KEY`
- Rate limit piano Free: 10 req/min — gestire sempre il caso di quota esaurita

> ⚠️ Migrazione pianificata → API-Football (RapidAPI) nella sessione corrente.
> Quando completata: aggiornare questo file con i nuovi endpoint e header (`X-RapidAPI-Key`).

## Voti stagionali — endpoint statico

- Rotta: `GET /api/voti/:season/matchday/:n`
- Read-only, no JWT (è un dataset di stagione pubblico)
- Cache `Cache-Control: public, max-age=86400, immutable`
- 200 con shape `{ season, matchday, source, players: { [playerId]: rawScore } }`
- 404 se la giornata non esiste sul filesystem → frontend cade su `simulateVoto`
- 400 su season non whitelistata o n fuori range
- File serviti da `server/data/voti-{season}/matchday-{n}.json`
- Sourcing del dataset reale è una decisione di prodotto separata

## Autenticazione

- JWT con scadenza 30 giorni
- Token in `localStorage` via `useAppStore`
- Route backend protette da middleware `authenticateJWT`
- Crediti AI: reset automatico ogni lunedì 20:45 Europe/Rome via `server/cron/resetCredits.js`

## Sistema leghe

- MVP localStorage-only tramite `useLeagueStore` (Zustand persist, chiave `fantabrain-leagues`, version 2)
- **NON fare chiamate backend per le leghe** — è single-user, nessun multiplayer reale
- Schema persistito v2: oltre a `myRoster`/`participants`/`settings`, include `bots`, `calendar`, `matchdayResults`, `currentMatchday`, `nextMatchdayUnlocksAt`, `cooldownHours`, `skipsToday`, `seasonStatus`, `isPlayingMatchday`
- Migration v1→v2 non distruttiva: i campi mancanti vengono inizializzati ai default; le leghe legacy partono da `seasonStatus: 'pending'`
- Engine puro in `src/lib/season/`: `playMatchday`, `recomputeStandings`, `simulateVoto`, `loadMatchdayVoti`, `draftBotRoster`, `pickBotLineup`, `generateRoundRobin`
- Il join tramite codice invito tra utenti diversi richiede Supabase (fase futura)

## Pattern generale

- Tutte le chiamate API in try/catch
- Loading state con skeleton UI — mai spinner che bloccano l'intera pagina
- Gestire sempre il caso `data === null` (quota esaurita o errore di rete)
- Errori mostrati come alert non-intrusivi in italiano
- **MAI chiamare API direttamente dai componenti** — usare sempre lo store Zustand
