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

## Autenticazione

- JWT con scadenza 30 giorni
- Token in `localStorage` via `useAppStore`
- Route backend protette da middleware `authenticateJWT`
- Crediti AI: reset automatico ogni lunedì 20:45 Europe/Rome via `server/cron/resetCredits.js`

## Sistema leghe

- MVP localStorage-only tramite `useLeagueStore` (Zustand persist, chiave `fantabrain-leagues`)
- **NON fare chiamate backend per le leghe** — è single-user, nessun multiplayer reale
- Il join tramite codice invito tra utenti diversi richiede Supabase (fase futura)

## Pattern generale

- Tutte le chiamate API in try/catch
- Loading state con skeleton UI — mai spinner che bloccano l'intera pagina
- Gestire sempre il caso `data === null` (quota esaurita o errore di rete)
- Errori mostrati come alert non-intrusivi in italiano
- **MAI chiamare API direttamente dai componenti** — usare sempre lo store Zustand
