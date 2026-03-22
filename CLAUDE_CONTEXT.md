# FANTABRAIN AI — Contesto Completo per Claude Code

## CHI SEI E DOVE SEI

Stai lavorando sulla repository **`paganid86-jpg/ex_fantabrain`** su GitHub (repository privata).
La webapp è deployata su Render: **https://webapp-fantabrain.onrender.com/**

Branch di lavoro: crea sempre branch con prefisso `claude/` seguito da descrizione e session ID.
Esempio: `claude/nome-feature-XXXXX`

---

## COS'È FANTABRAIN

**FantaBrain AI** è una web app per la gestione del **Fantacalcio** (Serie A italiana), pensata per
fantallenatori che vogliono un vantaggio competitivo grazie all'intelligenza artificiale.

### Obiettivo del prodotto
Offrire uno strumento premium, visivamente raffinato (stile Dark Glassmorphism) con funzionalità AI
che aiutino l'utente in:
- Gestione della rosa personale
- Scelta dello schieramento ottimale
- Analisi degli avversari
- Scouting di nuovi giocatori
- Analisi di mercato
- Statistiche stagionali

### Target utente
Appassionati di Fantacalcio Serie A, che giocano in leghe private, livello intermedio-avanzato.

---

## STACK TECNOLOGICO

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 19 + React Router v6 (HashRouter) |
| State | Zustand 4.5 con persist middleware |
| Styling | TailwindCSS v4 + CSS custom properties (glassmorphism) |
| Build | Vite 5.4 + @vitejs/plugin-react |
| Backend | Express.js (proxy API + serve static) |
| AI | Groq API — modello `llama-3.3-70b-versatile` |
| Dati calcio | football-data.org v4 (Serie A 2025/2026, piano Free) |
| Deploy | Render.com (Node web service) |

---

## STRUTTURA REPOSITORY

```
ex_fantabrain/
├── index.html              # Entry HTML
├── package.json            # deps: react, react-dom, react-router-dom, zustand, express
├── vite.config.js          # Vite + proxy dev per /api/football
├── render.yaml             # Config Render (buildCommand, startCommand, envVars)
├── server.js               # Express: proxy football-data.org + serve /dist
├── src/
│   ├── main.jsx            # Entry React
│   ├── App.jsx             # HashRouter + layout + routing
│   ├── index.css           # Stili globali (CSS custom properties, glassmorphism)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Nav laterale + crediti AI + info utente
│   │   │   └── Topbar.jsx          # Header + hamburger mobile + giornata
│   │   └── ui/
│   │       ├── AddPlayerModal.jsx  # Form aggiunta/modifica giocatore
│   │       ├── AlertItem.jsx       # Componente alert (infortuni/diffide)
│   │       ├── KpiCard.jsx         # Card statistica
│   │       ├── PlayerToken.jsx     # Token circolare giocatore
│   │       └── RankItem.jsx        # Row classifica
│   ├── data/
│   │   └── mockData.js     # Costanti: RUOLI_MANTRA, SQUADRE_SERIE_A, moduli, template vuoti
│   ├── lib/
│   │   └── claudeApi.js    # Client Groq API (callClaude, chatClaude, analizzaSchieramento, ecc.)
│   ├── pages/              # (vedi sezione PAGINE)
│   ├── services/
│   │   ├── footballApi.js          # Fetch football-data.org via proxy /api/football
│   │   └── footballDataMapper.js   # Mapper risposta API → formato interno
│   ├── store/
│   │   └── useAppStore.js  # Store principale (rosa, classifica, calendario, AI crediti...)
│   └── stores/
│       └── useSerieAStore.js  # Store dati Serie A real-time (standings, matches, scorers)
```

---

## PAGINE (src/pages/)

| Route | File | Descrizione |
|-------|------|-------------|
| `/` o `/dashboard` | Dashboard.jsx | Hub principale: KPI, campo schieramento, classifica lega, alert, Serie A live |
| `/la-rosa` | LaRosa.jsx | CRUD giocatori: tabella con filtri, ordinamento, dettaglio, modifica/rimozione |
| `/schieramento` | Schieramento.jsx | Editor modulo tattico con trascinamento titolari + AI suggerisce formazione |
| `/ai-analisi` | AIAnalisi.jsx | Chat libera con AI per analisi rosa, mercato, tattica |
| `/classifica` | Classifica.jsx | Classifica lega demo + classifica Serie A reale (top 20) |
| `/calendario` | Calendario.jsx | Storico giornate con punti utente + analisi AI giornata |
| `/mercato` | Mercato.jsx | Offerte ricevute + trattative attive + valutazione AI |
| `/scouting` | Scouting.jsx | Ricerca giocatori Serie A reali con report AI |
| `/war-room` | WarRoom.jsx | Analisi tattica avversario in 3 step con AI |
| `/statistiche` | Statistiche.jsx | Stats stagione personali, grafici, top marcatori |

---

## STATE MANAGEMENT — useAppStore (Zustand)

Store persistito in `localStorage` con chiave **`fantabrain-store-v3`**.

### Stato
```js
{
  user: { name, plan, league },   // Profilo utente
  rosa: [],                        // Array giocatori (VUOTO di default — l'utente inserisce i propri)
  giornataCorrente: 15,
  classifica: [...],               // 8 squadre demo (isUser: true per la squadra dell'utente)
  calendario: [...],               // 15 giornate demo con puntiUser
  offerte: [],                     // Offerte mercato
  trattative: [],
  modulo: '4-3-3',
  titolariIds: [1..11],            // IDs dei titolari schierati
  aiCrediti: 12,                   // Crediti AI disponibili (decrementati ad ogni chiamata)
  aiConversazioni: {},             // Storico chat per pagina
}
```

### Schema giocatore (rosa[])
```js
{
  id: number,           // Date.now() al momento dell'inserimento
  nome: string,
  cognome: string,
  squadra: string,      // Es. 'Inter', 'Milan', 'Napoli'
  ruoloMantra: string,  // 'Por' | 'DD' | 'DS' | 'DC' | 'M/C' | 'C' | 'T/A' | 'W' | 'T' | 'A' | 'PC'
  quotazione: number,   // In milioni
  votoMedia: number,    // Media voti stagione
  votiUltimi5: number[], // Ultimi 5 voti (0 = SV)
  infortunato: boolean,
  diffidato: boolean,
}
```

### Azioni principali
- `addGiocatore(giocatore)` — aggiunge alla rosa
- `updateGiocatore(id, updates)` — modifica giocatore
- `removeGiocatore(id)` — rimuove dalla rosa e dai titolariIds
- `toggleInfortunato(id)` / `toggleDiffidato(id)`
- `setModulo(modulo)` / `setTitolariIds(ids)`
- `decrementaCrediti()` — chiamata da claudeApi.js ad ogni analisi AI
- `aggiungiMessaggio(pageId, msg)` — aggiunge messaggio alla chat AI

---

## DATI SERIE A REALI — useSerieAStore (Zustand)

Dati real-time da **football-data.org** (piano Free, max 10 req/min).

```js
{
  standings: [...],       // Classifica Serie A (20 squadre)
  currentMatchday: number,
  matches: [...],         // Partite della stagione
  scorers: [...],         // Marcatori top
  teams: [...],           // Anagrafica squadre
  loading: { standings, matches, scorers, teams },
  errors: { ... },
  lastFetched: { ... },   // Timestamp cache (standings: 6h, matches: 1h, teams: 24h)
}
```

**Selectors utili:**
- `getNextMatchdayMatches()` — prossime partite
- `getLastResults(n)` — ultimi n risultati

---

## AI INTEGRATION — claudeApi.js (Groq)

**Modello:** `llama-3.3-70b-versatile` via `https://api.groq.com/openai/v1`

**Funzioni esportate:**
```js
callClaude(prompt)                      // Risposta singola
chatClaude(messages)                    // Conversazione
analizzaSchieramento(rosa, modulo, ...)  // Suggerisce formazione ottimale
valutaOfferta(offerta, rosa)             // Analisi offerta mercato
reportScouting(giocatore, serieAData)    // Report completo giocatore
warRoomAnalisi(step, avversario, ...)    // Analisi avversario (3 step)
analizzaGiornata(giornata, punti, ...)   // Recap giornata
```

**Chiave API:** `VITE_GROQ_API_KEY` (in `.env`, non committata)

---

## BACKEND — server.js (Express)

Serve tre scopi:
1. **Proxy** `/api/football/*` → `https://api.football-data.org/v4/*` (aggiunge `X-Auth-Token`)
2. **Serve** il build React statico da `/dist`
3. **Fallback SPA** — ogni rotta non trovata restituisce `index.html`

**Variabili d'ambiente in produzione (Render):**
- `FOOTBALL_DATA_API_KEY` — chiave server-side per football-data.org
- `VITE_GROQ_API_KEY` — chiave Groq per le chiamate AI (se usata lato server)
- `PORT` — porta assegnata da Render (default 3000)

---

## DESIGN SYSTEM

**Tema:** Dark Premium Glassmorphism

### CSS Custom Properties principali
```css
--bg-deep: #050810          /* Sfondo principale quasi nero */
--bg-surface: #0a0f1e       /* Card di base */
--bg-elevated: #111827      /* Elementi elevati */
--bg-glass: rgba(255,255,255,0.04)
--accent-primary: #00d4ff   /* Ciano elettrico */
--gold: #f5c518             /* Oro / highlight */
--success: #22c55e
--danger: #ef4444
--amber: #f59e0b
--blue: #3b82f6
--text-primary: #f1f5f9
--text-secondary: #94a3b8
--text-muted: #64748b
--font-display: 'Syne', sans-serif   /* Titoli e numeri */
--font-body: 'Inter', sans-serif     /* Testo normale */
```

### Classi CSS utili
- `.glass-card` — card glassmorphism standard
- `.glass-card--accent` — card con bordo ciano
- `.glass-elevated` — pannello elevato (dettaglio giocatore)
- `.btn-primary` / `.btn-secondary` / `.btn-danger`
- `.badge-gold` / `.badge-green` / `.badge-red` / `.badge-amber` / `.badge-muted`
- `.input-field` — input/select stilizzato
- `.data-table` — tabella con header sticky
- `.pitch` — campo da calcio verde con texture
- `.empty-state` / `.empty-state-icon` / `.empty-state-title` / `.empty-state-desc`
- `.section-title` / `.section-subtitle`
- `.app-layout` / `.main-content` / `.page-content`

---

## STATO ATTUALE DELLA WEBAPP (Marzo 2026)

### Funzionalità completate ✅
- **Dashboard** — KPI (posizione, punti, crediti AI, infortuni), campo con schieramento,
  pannello AI suggerimenti, classifica lega, alert infortuni/diffide, Serie A live
  (classifica, prossime partite, ultimi risultati), grafico andamento punti
- **La Rosa** — CRUD completo giocatori, filtri per ruolo/squadra/stato/ricerca,
  ordinamento colonne, pannello dettaglio laterale, empty state con CTA
- **Schieramento** — editor modulo, selezione titolari, visualizzazione campo, integrazione AI
- **AI Analisi** — chat libera con AI, storico conversazioni per pagina
- **Classifica** — lega demo + Serie A reale
- **Calendario** — storico giornate + analisi AI
- **Mercato** — offerte + trattative + AI
- **Scouting** — ricerca giocatori Serie A + report AI
- **War Room** — analisi tattica avversario 3 step
- **Statistiche** — stats stagione + grafici
- **Proxy Express** — risolve CORS per football-data.org in produzione
- **Rosa vuota di default** — l'utente inserisce i propri giocatori reali
  (store v3, localStorage resettato automaticamente all'aggiornamento)

### Comportamento chiave ⚠️
- La **rosa è sempre vuota** al primo accesso o dopo un reset del localStorage.
  L'utente deve aggiungere manualmente i propri giocatori dalla pagina `/la-rosa`.
- La **Dashboard mostra la struttura completa** anche con rosa vuota —
  solo il campo schieramento mostra "Nessun giocatore in rosa" con link a La Rosa.
- I dati **Serie A sono reali** e aggiornati tramite API (con cache).
- I dati di **classifica lega e calendario** sono demo (placeholder).

### Architettura routing
```
HashRouter: url tipo /#/la-rosa
Route /              → Dashboard
Route /dashboard     → Dashboard
Route /la-rosa       → LaRosa
Route /schieramento  → Schieramento
Route /ai-analisi    → AIAnalisi
Route /classifica    → Classifica
Route /calendario    → Calendario
Route /mercato       → Mercato
Route /scouting      → Scouting
Route /war-room      → WarRoom
Route /statistiche   → Statistiche
```

---

## REGOLE DI SVILUPPO

1. **Branch**: sempre `claude/descrizione-feature-SESSIONID`
2. **Push**: `git push -u origin <branch>` — mai su main direttamente
3. **CSS**: usare le classi e custom properties già definite in `index.css`, non inventarne di nuove
4. **Dati rosa**: non reinserire dati demo — la rosa deve restare vuota di default
5. **AI calls**: ogni chiamata deve decrementare `aiCrediti` via `decrementaCrediti()`
6. **Responsive**: la sidebar collassa su mobile con hamburger (Topbar)
7. **Store version**: se si modifica struttura dati persistita, incrementare la versione
   in `persist({ name: 'fantabrain-store-vN' })` e aggiungere una `migrate` function
8. **Proxy**: tutte le chiamate a football-data.org passano da `/api/football/...`
   (Vite proxy in dev, Express proxy in prod) — mai chiamare l'API direttamente dal frontend

---

## ENVIRONMENT VARIABLES

```env
# .env (sviluppo locale — non committare)
VITE_FOOTBALL_DATA_API_KEY=<chiave_football_data_org>
VITE_GROQ_API_KEY=<chiave_groq>

# Render (produzione)
FOOTBALL_DATA_API_KEY=<chiave_football_data_org>   # server-side, senza VITE_
VITE_GROQ_API_KEY=<chiave_groq>
```

---

## COMANDI UTILI

```bash
npm run dev        # Avvia Vite dev server (http://localhost:5173)
npm run build      # Build produzione in /dist
npm run start      # Avvia server Express (serve /dist + proxy)
```

---

## WEBAPP LIVE

URL: **https://webapp-fantabrain.onrender.com/**
(Deploy automatico su Render ad ogni push/merge su `main`)
