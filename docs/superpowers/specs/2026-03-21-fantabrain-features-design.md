# FantaBrain — Feature Design Spec
**Data:** 2026-03-21
**Autore:** Dante Pagani
**Stato:** Approvato — v2 (post spec-review)

---

## Contesto

FantaBrain è una SPA React per la gestione del fantacalcio con AI integrata. Stack attuale: React 19, Zustand, Tailwind CSS 4, Vite, Express proxy (`server.js`), football-data.org API, Groq API (llama-3.3-70b).

Questo documento specifica due nuove feature:
- **Feature A**: Editor Formazione stile FIFA (sezione Schieramento)
- **Feature B**: Analisi AI con sistema Gold (sezione Analisi AI)

Entrambe richiedono l'aggiunta di auth e gestione piani utente tramite backend Express + PostgreSQL + Passport.js.

---

## Architettura Generale

### Strategia backend: estendere `server.js` esistente

Le nuove route auth, crediti e AI proxy vengono aggiunte al **`server.js` esistente** (unico servizio su Render). Non si crea un servizio separato.

**Vincolo critico**: il fallback SPA `app.get('*', ...)` (attualmente riga 52) deve restare **sempre per ultimo** dopo tutte le nuove route. Nell'implementazione, tutte le route vengono registrate prima del blocco dei file statici e del fallback.

**Ordine di registrazione in server.js:**
```
1. express.json() middleware
2. cors()
3. /api/football/* proxy (esistente)
4. /auth/* route (nuovo)
5. /api/credits/* route (nuovo)
6. /api/ai/chat route (nuovo)
7. /api/admin/* route (nuovo)
8. express.static('dist')          ← file statici React
9. app.get('*') fallback SPA       ← SEMPRE ULTIMO
```

### Nuovi componenti

| Layer | Componente | Note |
|-------|-----------|------|
| Frontend | `FormationEditor.jsx` + slot/token/list | Nuovo, estratto da Schieramento.jsx |
| Frontend | `Login.jsx`, `Register.jsx` | Nuove pagine auth |
| Frontend | `src/data/moduli.js` | Sostituisce definizioni in Schieramento.jsx e mockData.js |
| Backend | `server.js` esteso | Nuove route auth, crediti, AI proxy |
| Backend | `src/db/schema.sql` | Schema PostgreSQL |
| DB | PostgreSQL (Render) | 3 tabelle: users, ai_credits, ai_conversations |

### Autenticazione
- **Passport.js** con strategia `passport-local` (email + password)
- **bcrypt** per hashing password
- **JWT** (`jsonwebtoken`) per sessioni

**JWT flow:**
1. Login → backend ritorna `{ token, user: { id, email, name, plan } }`
2. Frontend salva `token` nel Zustand store (persistito in localStorage via `persist`)
3. Ogni richiesta protetta invia `Authorization: Bearer <token>`
4. Middleware `authenticateJWT` su tutte le route protette:
   ```js
   // Se token mancante o invalido → 401 { error: 'Unauthorized' }
   // Se token valido → req.user = { id, email, plan }
   ```

### Deployment — aggiornamento `render.yaml`
```yaml
services:
  - type: web
    name: fantabrain-ai
    env: node
    buildCommand: npm install && npm run build
    startCommand: node server.js
    envVars:
      - key: NODE_VERSION
        value: "20"
      - key: FOOTBALL_DATA_API_KEY
        sync: false
      - key: VITE_GROQ_API_KEY
        sync: false
      - key: DATABASE_URL        # nuovo
        sync: false
      - key: JWT_SECRET          # nuovo
        sync: false
      - key: ANTHROPIC_API_KEY   # nuovo
        sync: false
      - key: ADMIN_SECRET        # nuovo — per endpoint admin
        sync: false

databases:
  - name: fantabrain-db
    plan: free
```

---

## Feature A — Editor Formazione

### Obiettivo
Sostituire l'editor click-only di `Schieramento.jsx` con un editor fullscreen drag & drop, portando i moduli da 6 a 15.

### Layout (approvato: Layout B)
- **Toolbar** in cima: dropdown modulo, punteggio atteso, "Ottimizza AI", "Salva"
- **Campo verticale** (flex 1.5): giocatori draggabili con nome, voto medio, badge infortuni/diffide
- **Pannello laterale** (160px): tab **Rosa** / **Panchina** + campo ricerca

### Libreria D&D
**`@dnd-kit/core`** — leggera (8kb), touch-friendly, accessibile.

### Interazione
| Azione | Comportamento |
|--------|--------------|
| Drag rosa → slot vuoto | Schiera il giocatore |
| Drag rosa → slot occupato | Scambio automatico |
| Drag slot → slot | Scambio tra titolari |
| Click su slot vuoto | Evidenzia giocatori compatibili nella lista |
| Click su giocatore evidenziato | Lo schiera (fallback mobile) |
| Ruolo incompatibile | Warning non bloccante (bordo rosso, non blocca il drop) |

### 15 Moduli
`4-3-3`, `4-4-2`, `4-4-2 diamond`, `3-4-3`, `3-5-2`, `5-3-2`, `4-2-3-1`, `4-3-2-1`, `4-1-4-1`, `4-5-1`, `3-4-2-1`, `5-4-1`, `3-6-1`, `4-6-0`, `5-2-3`

### Migrazione definizioni moduli

**Vecchio formato** (Schieramento.jsx righe 8–58, mockData.js):
```js
'4-3-3': { righe: [[{ruolo:'PC', label:'PC'}], [{ruolo:'T/A'}, ...], ...] }
moduli: ['4-3-3', '3-4-3', ...] // array semplice in mockData.js
```

**Nuovo formato** (`src/data/moduli.js`):
```js
export const MODULI = {
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { id: 'por', ruoli: ['Por'], row: 0 },
      { id: 'dd',  ruoli: ['DD', 'DC'], row: 1 },
      { id: 'dc1', ruoli: ['DC'], row: 1 },
      { id: 'dc2', ruoli: ['DC'], row: 1 },
      { id: 'ds',  ruoli: ['DS', 'DC'], row: 1 },
      { id: 'm1',  ruoli: ['M', 'C'], row: 2 },
      { id: 'm2',  ruoli: ['M', 'C'], row: 2 },
      { id: 'm3',  ruoli: ['M', 'C'], row: 2 },
      { id: 'a1',  ruoli: ['T/A', 'W', 'A'], row: 3 },
      { id: 'pc',  ruoli: ['PC', 'A'], row: 3 },
      { id: 'a2',  ruoli: ['T/A', 'W', 'A'], row: 3 },
    ]
  },
  // ... tutti i 15 moduli
}
export const MODULI_LIST = Object.keys(MODULI) // ['4-3-3', '4-4-2', ...]
```

**Nota notazione ruoli**: si usa array di stringhe semplici `['M', 'C']` (non `'M/C'`).
La funzione `isCompatibile(giocatore, slot)` in `FormationEditor` confronta:
```js
slot.ruoli.some(r => giocatore.ruoloMantra.split('/').includes(r))
```
Questo gestisce entrambi i formati del campo `ruoloMantra` nel DB (es. `'M/C'`, `'T/A'`).

**Aggiornamenti richiesti:**
- `src/data/mockData.js`: rimuovere `moduli` array (non più usato)
- `Schieramento.jsx` righe 1–58: rimuovere `MODULO_SLOTS`, importare da `src/data/moduli.js`
- Tutti gli import di `moduli` da `mockData` → aggiornare a `moduli.js`

### Struttura componenti
```
src/components/formation/
  FormationEditor.jsx   — componente principale (@dnd-kit DndContext)
  FormationSlot.jsx     — slot droppable (useDroppable)
  PlayerToken.jsx       — token draggabile (useDraggable) — sostituisce ui/PlayerToken.jsx
  PlayerList.jsx        — lista laterale con tab Rosa/Panchina + ricerca
src/data/
  moduli.js             — definizioni tutti i 15 moduli (nuovo file)
```

`Schieramento.jsx` diventa wrapper:
```jsx
// Legge: useAppStore (rosa, modulo, titolariIds)
// Renderizza: <FormationEditor /> + sidebar AI esistente
// Salva: setModulo(), setTitolariIds() su store
```

---

## Feature B — Analisi AI con Sistema Gold

### Obiettivo
Differenziare l'accesso al chatbot AI tra utenti Gold (illimitato) e non-Gold (3 crediti/giornata), con reset automatico e badge visivo.

### Piani utente

| Piano | Crediti AI/giornata | Chatbot |
|-------|-------------------|---------|
| free | 3 | Sì, limitato |
| silver | 3 | Sì, limitato |
| gold | Illimitato | Sì, illimitato |

> Il piano Gold viene attivato dall'admin con `UPDATE users SET plan='gold' WHERE id=X` oppure via `POST /api/admin/set-plan`.

### Badge Navbar
Badge dorato "GOLD" affianco a "Analisi AI" in `Sidebar.jsx`. Sempre visibile a tutti gli utenti.

### Refactor `claudeApi.js` — confine preciso

| Funzione | Destinazione | Dettaglio |
|----------|-------------|---------|
| `chatClaude()` | **Backend** (`POST /api/ai/chat`) | Migra ad Anthropic SDK. Frontend chiama il backend. |
| `analizzaSchieramento()` | **Rimane su Groq** (frontend) | Nessuna modifica |
| `valutaOfferta()` | **Rimane su Groq** (frontend) | Nessuna modifica |
| `reportScouting()` | **Rimane su Groq** (frontend) | Nessuna modifica |
| `warRoomAnalisi()` | **Rimane su Groq** (frontend) | Nessuna modifica |
| `buildSystemPrompt()` | **Rimane frontend** | Costruisce il system prompt prima di inviare al backend |

**Modifica a `claudeApi.js`:**
```js
// chatClaude() aggiornata — chiama backend invece di Groq
export async function chatClaude({ messages, systemPrompt, maxTokens = 600 }) {
  const token = useAppStore.getState().user.token;
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ messages, systemPrompt, maxTokens })
  });
  if (response.status === 402) throw new Error('NO_CREDITS');
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error('AI_ERROR');
  const data = await response.json();
  return data.content; // string
}
// decrementaCrediti() NON viene più chiamata da claudeApi.js
// Il decremento avviene server-side. Il frontend ricarica i crediti dopo ogni risposta.
```

### Sincronizzazione crediti frontend/backend

**Strategia: optimistic update + refresh post-risposta**

```
1. Utente invia messaggio
2. Frontend chiama chatClaude() → POST /api/ai/chat
3. Backend verifica crediti nel DB:
   - Se Gold → procede senza limitazioni
   - Se crediti = 0 → risponde 402 { error: 'NO_CREDITS', resetAt: '...' }
   - Altrimenti → chiama Anthropic, decrementa DB, risponde con content
4. Frontend riceve risposta:
   - Success → chiama GET /api/credits → aggiorna aiCrediti in Zustand
   - 402 → mostra schermata "crediti esauriti", imposta aiCrediti = 0
5. UI aggiornata con il valore reale dal DB
```

`decrementaCrediti()` in Zustand viene **rimossa**. Al suo posto: `setAiCrediti(n)`.

### Schema DB

```sql
-- Utenti
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free','silver','gold')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crediti AI (una riga per utente, aggiornata ad ogni reset)
CREATE TABLE ai_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  credits_remaining INTEGER DEFAULT 3 CHECK (credits_remaining >= 0),
  reset_at TIMESTAMP DEFAULT NOW()
  -- matchday rimosso: non viene usato come chiave, il reset è basato su timestamp
);

-- Conversazioni AI (persistenza server-side opzionale)
CREATE TABLE ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  page_id VARCHAR(50),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Nota**: `UNIQUE(user_id)` — ogni utente ha esattamente una riga in `ai_credits`. Il reset aggiorna `credits_remaining` e `reset_at` in-place (nessun insert per giornata).

### API Endpoints Backend

```
POST /auth/register
  body: { email, password, name }
  response 201: { token, user: { id, email, name, plan } }
  response 409: { error: 'Email già registrata' }

POST /auth/login
  body: { email, password }
  response 200: { token, user: { id, email, name, plan }, credits: { remaining, resetAt } }
  response 401: { error: 'Credenziali non valide' }

GET  /auth/me                         [JWT required]
  response 200: { user, credits }

GET  /api/credits                     [JWT required]
  response 200: { remaining: 2, resetAt: '2026-03-25T19:45:00Z', plan: 'free' }

POST /api/ai/chat                     [JWT required]
  body: { messages: [...], systemPrompt: '...', maxTokens: 600 }
  response 200: { content: '...', creditsRemaining: 1 }
  response 402: { error: 'NO_CREDITS', resetAt: '2026-03-25T19:45:00Z' }
  response 401: { error: 'Unauthorized' }

POST /api/admin/set-plan              [ADMIN_SECRET required]
  header: X-Admin-Secret: <ADMIN_SECRET>
  body: { userId: 123, plan: 'gold' }
  response 200: { ok: true }

POST /api/admin/reset-credits         [ADMIN_SECRET required]
  header: X-Admin-Secret: <ADMIN_SECRET>
  body: { userId: 123 } | {} (tutti)
  response 200: { updated: 45 }
```

**JWT Middleware:**
```js
function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}
```

**Admin Middleware:**
```js
function authenticateAdmin(req, res, next) {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET)
    return res.status(403).json({ error: 'Forbidden' });
  next();
}
```

### Logica Reset Crediti — Cron Job

```js
// node-cron: ogni lunedì alle 20:45 (Europe/Rome)
cron.schedule('45 20 * * 1', async () => {
  // 1. Verifica football-data.org: ci sono partite non FINISHED nella giornata corrente?
  const res = await fetch('https://api.football-data.org/v4/competitions/SA/matches?status=IN_PLAY,PAUSED,TIMED,SCHEDULED', {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY }
  });
  const data = await res.json();
  const partiteAttive = data.matches?.filter(m =>
    ['IN_PLAY', 'PAUSED'].includes(m.status)
  ) ?? [];

  if (partiteAttive.length > 0) {
    console.log(`[cron] Reset saltato: ${partiteAttive.length} partite ancora in corso`);
    return;
  }

  // 2. Giornata completata → reset crediti per tutti gli utenti non-Gold
  const result = await db.query(`
    UPDATE ai_credits
    SET credits_remaining = 3, reset_at = NOW()
    WHERE user_id IN (SELECT id FROM users WHERE plan != 'gold')
  `);
  console.log(`[cron] Reset crediti completato: ${result.rowCount} utenti aggiornati`);
}, { timezone: 'Europe/Rome' });
```

**Condizione "giornata completata"**: nessuna partita con status `IN_PLAY` o `PAUSED` nell'endpoint `/competitions/SA/matches?status=IN_PLAY,PAUSED,TIMED,SCHEDULED`. Se ci sono partite rinviate ancora `SCHEDULED` per la settimana in corso, il cron salta e ritenta la settimana successiva.

### Zustand Store — Aggiornamenti

```js
// useAppStore.js — stato aggiornato
user: {
  id: null,
  email: null,
  name: 'Allenatore',
  plan: 'free',      // 'free' | 'silver' | 'gold'
  token: null,       // JWT, persistito in localStorage via Zustand persist
  league: 'La mia lega',  // mantenuto
},
aiCrediti: 3,         // aggiornato dal backend al login e dopo ogni chiamata AI
resetAt: null,        // ISO string data prossimo reset (dal backend)

// Azioni aggiornate
setUser(userData),           // setta id, email, name, plan, token
setAiCrediti(n),             // sostituisce decrementaCrediti()
setResetAt(isoString),       // setta la data prossimo reset
logout(),                    // azzera user, token, crediti

// decrementaCrediti() → RIMOSSA (decremento ora server-side)
```

### UI Chatbot

**Utente non-Gold:**
- Header: pallini crediti (`●●○` = 2/3), CTA "Diventa Gold"
- Input attivo se `aiCrediti > 0`, testo placeholder "N crediti rimasti"
- Footer: "🔄 Crediti si resettano [data] alle 20:45"
- Stato esaurito: schermata lock con data reset + CTA upgrade

**Utente Gold:**
- Header dorato "✦ GOLD — Illimitato"
- Input sempre attivo
- Footer: "✦ Accesso illimitato"

---

## Ordine di Implementazione

1. **Backend**: `npm install` dipendenze, schema PostgreSQL, Passport.js auth, JWT middleware, endpoint `/auth/*` e `/api/credits/*`
2. **Backend**: route `/api/ai/chat` con Anthropic SDK, cron reset, endpoint `/api/admin/*`
3. **Backend**: aggiornamento `render.yaml`
4. **Frontend**: pagine Login/Register, gestione JWT in Zustand (setUser, logout), redirect se non autenticato
5. **Frontend Feature A**: `src/data/moduli.js` con 15 moduli, componenti `FormationEditor`, refactor `Schieramento.jsx`
6. **Frontend Feature B**: badge GOLD in `Sidebar.jsx`, refactor `chatClaude()` in `claudeApi.js`, UI crediti in `AIAnalisi.jsx`

---

## Dipendenze da aggiungere

### Backend (package.json)
```
passport passport-local jsonwebtoken bcrypt pg node-cron @anthropic-ai/sdk cors
```

### Frontend (package.json)
```
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Variabili d'ambiente

```env
# Backend (Render env vars)
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=<stringa casuale lunga 64 char>
ANTHROPIC_API_KEY=sk-ant-...
FOOTBALL_DATA_API_KEY=...        # già esistente
ADMIN_SECRET=<stringa casuale>   # per endpoint admin

# Frontend (Vite — solo chiavi non segrete)
VITE_API_URL=http://localhost:3000   # in dev; in prod è relativo (stesso origin)
VITE_GROQ_API_KEY=...               # già esistente, rimane per Groq
```

**Nota**: `ANTHROPIC_API_KEY` è **solo backend** — mai nel frontend, mai con prefisso `VITE_`.

---

## Non in scope

- Pagamento / Stripe (Gold attivato manualmente via admin)
- Piani Silver con funzionalità differenziate (struttura DB pronta, UI upgrade non implementata)
- Test automatici
- `ai_conversations` persistenza server-side (rimane localStorage per ora, tabella pronta per future implementazioni)
