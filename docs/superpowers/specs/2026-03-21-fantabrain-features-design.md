# FantaBrain — Feature Design Spec
**Data:** 2026-03-21
**Autore:** Dante Pagani
**Stato:** Approvato

---

## Contesto

FantaBrain è una SPA React per la gestione del fantacalcio con AI integrata. Stack attuale: React 19, Zustand, Tailwind CSS 4, Vite, Express proxy, football-data.org API, Groq API (llama-3.3-70b).

Questo documento specifica due nuove feature da implementare:
- **Feature A**: Editor Formazione stile FIFA (sezione Schieramento)
- **Feature B**: Analisi AI con sistema Gold (sezione Analisi AI)

Entrambe richiedono l'aggiunta di un **backend Express + PostgreSQL + Passport.js** per auth e gestione piani utente.

---

## Architettura Generale

### Nuovi componenti

| Layer | Componente | Note |
|-------|-----------|------|
| Frontend | `FormationEditor.jsx` | Nuovo componente estratto da Schieramento.jsx |
| Frontend | `Login.jsx`, `Register.jsx` | Nuove pagine auth |
| Backend | `server.js` esteso | Nuove route auth, crediti, AI proxy |
| DB | PostgreSQL | 3 tabelle: users, ai_credits, ai_conversations |

### Autenticazione
- **Passport.js** con strategia local (email + password)
- **bcrypt** per hashing password
- **JWT** per sessioni — token salvato in `localStorage` del frontend
- Al login: carica `user.plan` e `aiCrediti` nel Zustand store

### Deployment
- Backend Express su Render (stesso servizio o nuovo)
- PostgreSQL su Render (piano free)
- Frontend Vite build statica invariata

---

## Feature A — Editor Formazione

### Obiettivo
Sostituire l'attuale editor click-only di `Schieramento.jsx` con un editor fullscreen drag & drop, espandendo i moduli da 6 a 15.

### Layout (approvato: Layout B)
- **Toolbar** in cima: dropdown modulo, punteggio atteso, bottone "Ottimizza AI", bottone "Salva"
- **Campo verticale** (flex 1.5): giocatori draggabili con nome, voto medio, badge infortuni/diffide
- **Pannello laterale** (160px): tab **Rosa** / **Panchina** con campo ricerca, ogni card mostra ruolo + squadra + voto

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
| Ruolo incompatibile | Warning non bloccante (bordo rosso lampeggiante) |

### 15 Moduli implementati
`4-3-3`, `4-4-2`, `4-4-2 diamond`, `3-4-3`, `3-5-2`, `5-3-2`, `4-2-3-1`, `4-3-2-1`, `4-1-4-1`, `4-5-1`, `3-4-2-1`, `5-4-1`, `3-6-1`, `4-6-0`, `5-2-3`

### Struttura dati modulo
```js
// Esempio 4-2-3-1
'4-2-3-1': {
  label: '4-2-3-1',
  slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD','DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS','DC'], row: 1 },
    { id: 'm1', ruoli: ['M','C'], row: 2 },
    { id: 'm2', ruoli: ['M','C'], row: 2 },
    { id: 'ta1', ruoli: ['T/A','W','A'], row: 3 },
    { id: 'trq', ruoli: ['T/A','C','M'], row: 3 },
    { id: 'ta2', ruoli: ['T/A','W','A'], row: 3 },
    { id: 'pc', ruoli: ['PC','A'], row: 4 },
  ]
}
```

### Componente
- `src/components/formation/FormationEditor.jsx` — componente principale
- `src/components/formation/FormationSlot.jsx` — slot droppable
- `src/components/formation/PlayerToken.jsx` — token draggabile (upgrade di `ui/PlayerToken.jsx`)
- `src/components/formation/PlayerList.jsx` — lista laterale con tab + ricerca
- `src/data/moduli.js` — definizioni tutti i 15 moduli

### Aggiornamento Schieramento.jsx
`Schieramento.jsx` diventa un wrapper che:
1. Legge dati da `useAppStore` (rosa, modulo, titolariIds)
2. Renderizza `<FormationEditor />` + sidebar AI esistente
3. Gestisce salvataggio formazione via API (se loggato)

---

## Feature B — Analisi AI con Sistema Gold

### Obiettivo
Differenziare l'accesso al chatbot AI tra utenti Gold (illimitato) e non-Gold (3 crediti/giornata), con reset automatico e badge visivo.

### Piani utente

| Piano | Crediti AI/giornata | Chatbot |
|-------|-------------------|---------|
| Free | 3 | Sì, limitato |
| Silver | 3 | Sì, limitato |
| Gold | Illimitato | Sì, illimitato |

> Il piano Gold viene attivato manualmente dall'admin aggiornando `users.plan = 'gold'` nel DB.

### Badge Navbar
- Affianco alla voce "Analisi AI" nella Sidebar: badge dorato `GOLD`
- Badge sempre visibile a tutti gli utenti (promuove l'upgrade)
- Implementato in `Sidebar.jsx`

### UI Chatbot — Utente non-Gold
- **Header**: pallini crediti (es. `●●○` = 2/3 rimasti), CTA "Diventa Gold"
- **Input**: attivo finché crediti > 0, mostra "N crediti rimasti"
- **Crediti esauriti**: schermata lock con data prossimo reset + CTA upgrade
- **Footer**: "🔄 Crediti si resettano [data] alle 20:45"

### UI Chatbot — Utente Gold
- Header con banner dorato "✦ GOLD — Illimitato"
- Input sempre attivo, nessun contatore
- Footer: "✦ Accesso illimitato · claude-sonnet-4-6"

### AI Provider
- Il chatbot `AIAnalisi.jsx` chiama **`POST /api/ai/chat`** (backend)
- Il backend chiama **Anthropic SDK** (`claude-sonnet-4-6`) server-side
- API key `ANTHROPIC_API_KEY` solo nel backend (mai esposta al frontend)
- Il resto dell'app (Schieramento, WarRoom, Scouting) mantiene Groq

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

-- Crediti AI per giornata
CREATE TABLE ai_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 3 CHECK (credits_remaining >= 0),
  matchday INTEGER,
  reset_at TIMESTAMP,
  UNIQUE(user_id)
);

-- Conversazioni AI (opzionale, per persistenza server-side)
CREATE TABLE ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  page_id VARCHAR(50),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints Backend

```
POST /auth/register        → crea utente, ritorna JWT
POST /auth/login           → verifica credenziali, ritorna JWT + user info
GET  /auth/me              → ritorna profilo utente dal JWT

GET  /api/credits          → crediti rimasti per utente autenticato
POST /api/credits/use      → decrementa 1 credito (verifica Gold prima)
POST /api/admin/reset-credits → reset manuale (admin only)

POST /api/ai/chat          → proxy Anthropic SDK (verifica crediti, chiama Claude, decrementa)
```

### Logica Reset Crediti

Il reset avviene tramite **cron job** nel backend:

```
Scheduling: ogni lunedì alle 20:45 (Europe/Rome)
Condizione:  verifica football-data.org → giornata completata?
  - Sì → UPDATE ai_credits SET credits_remaining=3, reset_at=NOW()
           WHERE user_id IN (SELECT id FROM users WHERE plan != 'gold')
  - No → skip (partite ancora in corso o rinviate)
Fallback:    endpoint POST /api/admin/reset-credits per reset manuale
```

**Spiegazione intuitiva**: il cron si sveglia ogni lunedì sera. Controlla se la giornata è davvero finita (nessuna partita in corso). Se sì, ricarica i 3 crediti a tutti gli utenti non-Gold per la giornata successiva. Se ci sono partite rinviate, aspetta.

### Zustand Store — Aggiornamenti
```js
// useAppStore.js — nuovi campi
user: {
  id,
  email,
  name,
  plan,        // 'free' | 'silver' | 'gold'
  token,       // JWT
}
aiCrediti: 3,            // caricato dal backend al login
resetAt: null,           // data prossimo reset (dal backend)

// Nuove action
setUser(userData),
setAiCrediti(n),
logout(),
```

---

## Ordine di Implementazione

1. **Backend**: schema PostgreSQL + Passport.js auth + endpoint crediti
2. **Backend**: route `/api/ai/chat` con Anthropic SDK + cron reset
3. **Frontend**: pagine Login/Register + gestione JWT in Zustand
4. **Frontend Feature A**: FormationEditor con @dnd-kit + 15 moduli
5. **Frontend Feature B**: badge GOLD in Sidebar + UI crediti in AIAnalisi.jsx

---

## Dipendenze da aggiungere

### Backend (package.json o server/package.json)
```
passport passport-local jsonwebtoken bcrypt
pg node-cron @anthropic-ai/sdk cors dotenv
```

### Frontend (package.json)
```
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Variabili d'ambiente

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
ANTHROPIC_API_KEY=...
FOOTBALL_DATA_API_KEY=...   # già esistente

# Frontend (Vite)
VITE_API_URL=http://localhost:3001   # backend URL
VITE_GROQ_API_KEY=...               # già esistente
```

---

## Non in scope

- Pagamento / Stripe (il piano Gold è attivato manualmente dall'admin)
- Piani Silver (struttura DB pronta, ma UI upgrade non implementata)
- Persistenza conversazioni server-side (rimane localStorage per ora)
- Test automatici (fuori scope per questo sprint)
