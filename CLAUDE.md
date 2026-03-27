# FantaBrain AI — Claude Code Context

Repo: `paganid86-jpg/ex_fantabrain` (privata)
Deploy: https://webapp-fantabrain.onrender.com/ (Render, auto-deploy da `main`)

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 19, React Router v6 (HashRouter) |
| State | Zustand 4.5 con persist middleware |
| Styling | Tailwind CSS v4 + CSS custom properties (glassmorphism) |
| Build | Vite 5 + @vitejs/plugin-react |
| Backend | Express.js (proxy API + auth JWT + serve static) |
| AI principale | Groq `llama-3.3-70b-versatile` via backend `/api/ai/groq` |
| AI chatbot Gold | Anthropic `claude-sonnet-4-6` via backend `/api/ai/chat` |
| Dati calcio | football-data.org v4 (Serie A 2025/2026, piano Free) |
| Deploy | Render.com (Node web service) |

## Regole critiche

1. **Branch**: sempre `claude/descrizione-SESSIONID` — mai pushare su `main` direttamente
2. **Store Zustand**: tutti e tre usano **default export** — importare SEMPRE senza `{}`
3. **Sistema leghe**: MVP localStorage-only (`fantabrain-leagues`) — NO chiamate backend per le leghe
4. **AI calls**: ogni chiamata client deve passare da backend (`/api/ai/groq` o `/api/ai/chat`) — mai Groq o Anthropic direttamente dal frontend
5. **Proxy calcio**: tutte le chiamate a football-data.org passano da `/api/football/` (Vite proxy in dev, Express in prod)
6. **CSS**: usare classi e custom properties già definite in `src/styles/design-system.css` — non inventarne di nuove
7. **Lingua UI**: sempre italiano (labels, messaggi, placeholder, tooltip)
8. **Lingua codice**: inglese (variabili, funzioni, commenti tecnici)
9. **Dati rosa**: non reinserire mock data — la rosa è vuota di default, l'utente inserisce i propri giocatori
10. **Store version**: se si modifica la struttura dati persistita, incrementare la versione in `persist({ name: 'fantabrain-store-vN' })` e aggiungere `migrate`

## Stores Zustand

- `src/store/useAppStore.js` — auth, rosa, schieramento, crediti AI (`fantabrain-store-v*`)
- `src/stores/useSerieAStore.js` — dati Serie A reali (standings, matches, teams, scorers)
- `src/stores/useLeagueStore.js` — sistema leghe MVP localStorage (`fantabrain-leagues`)

⚠️ Selettori reattivi **inline** nei componenti. Non chiamare getter non-reattivi fuori da Zustand.

## Environment variables

```env
# .env locale (non committare)
DATABASE_URL=postgresql://localhost/fantabrain_dev
JWT_SECRET=<segreto>
ANTHROPIC_API_KEY=<chiave anthropic>
GROQ_API_KEY=<chiave groq>
FOOTBALL_DATA_API_KEY=<chiave football-data.org>
ADMIN_SECRET=<segreto admin>
```

## Route disponibili

`/` → Dashboard · `/la-rosa` · `/schieramento` · `/classifica` · `/calendario`
`/mercato` · `/scouting` · `/war-room` · `/statistiche`
`/crea-lega` · `/impostazioni-lega` · `/ai-analisi`

## File chiave

- `server.js` — entry point backend + SPA fallback
- `server/routes/` — auth.js, credits.js, ai.js, admin.js
- `server/cron/resetCredits.js` — reset lunedì 20:45 Europe/Rome
- `src/lib/claudeApi.js` — client AI (Groq via /api/ai/groq, Anthropic via /api/ai/chat)
- `src/services/footballApi.js` — fetch football-data.org via proxy
- `src/store/useAppStore.js` — store principale
- `src/stores/useLeagueStore.js` — leghe MVP
- `src/components/formation/` — FormationEditor, FormationSlot, PlayerToken
- `src/components/ui/PlayerSearchInput.jsx` — autocomplete giocatori reali Serie A
- `src/pages/LeagueCreation.jsx` — form multi-step creazione lega
- `src/styles/design-system.css` — CSS variables glassmorphism

## Regole dettagliate

@.claude/rules/code-style.md
@.claude/rules/api-conventions.md
@.claude/rules/testing.md
