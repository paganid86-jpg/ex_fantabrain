# FantaBrain — Frontend Auth + Formation Editor + AI Gold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Login/Register pages, refactor Schieramento into a full-featured FormationEditor with @dnd-kit and 15 modules, and update AIAnalisi with Gold badge + per-giornata credits UI.

**Architecture:** Pure frontend changes extending the existing React + Zustand + Tailwind app. Zustand store gains user auth state (JWT) and proper credits management. `claudeApi.js`'s `chatClaude()` is rerouted to the backend proxy — all other Groq functions unchanged.

**Tech Stack:** React 19, @dnd-kit/core + sortable + utilities, Zustand persist, Tailwind CSS 4, Vite

**Prerequisite:** Backend plan (`2026-03-21-fantabrain-backend-auth-credits-ai.md`) must be complete and running.

**Spec:** `docs/superpowers/specs/2026-03-21-fantabrain-features-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `package.json` | Add @dnd-kit deps |
| Modify | `src/store/useAppStore.js` | Add user auth state, setUser, setAiCrediti, setResetAt, logout; remove decrementaCrediti |
| Create | `src/pages/Login.jsx` | Login form — POST /auth/login |
| Create | `src/pages/Register.jsx` | Register form — POST /auth/register |
| Modify | `src/App.jsx` | Add /login and /register routes; auth guard on AppLayout |
| Create | `src/data/moduli.js` | 15 module definitions (new format with slot arrays) |
| Modify | `src/data/mockData.js` | Remove `moduli` export |
| Create | `src/components/formation/PlayerToken.jsx` | Draggable player circle (@dnd-kit useDraggable) |
| Create | `src/components/formation/FormationSlot.jsx` | Droppable field slot (@dnd-kit useDroppable) |
| Create | `src/components/formation/PlayerList.jsx` | Lateral panel: tabs Rosa/Panchina + search |
| Create | `src/components/formation/FormationEditor.jsx` | Main editor: DndContext, toolbar, field, lateral panel |
| Modify | `src/pages/Schieramento.jsx` | Slim wrapper: reads store, renders FormationEditor + AI sidebar |
| Modify | `src/components/layout/Sidebar.jsx` | Add GOLD badge next to "Analisi AI" |
| Modify | `src/lib/claudeApi.js` | Reroute chatClaude() to /api/ai/chat; remove decrementaCrediti call |
| Modify | `src/pages/AIAnalisi.jsx` | Credits display, reset info, lock screen on 0 credits |

---

### Task 1: Install frontend dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install @dnd-kit**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Verify**

```bash
node -e "import('@dnd-kit/core').then(() => console.log('dnd-kit OK'))"
```
Expected: `dnd-kit OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit dependencies"
```

---

### Task 2: Update Zustand store

**Files:**
- Modify: `src/store/useAppStore.js`

The current store has `user: { name, plan, league }` and `aiCrediti: 12` with `decrementaCrediti()`.

- [ ] **Step 1: Replace useAppStore.js**

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CLASSIFICA_DEMO = [
  { id: 1, nome: 'FC Drago', punti: 487, ultimoTurno: 78, puntimedia: 81.2 },
  { id: 2, nome: 'La Mia Squadra', punti: 462, ultimoTurno: 74, puntimedia: 77.0, isUser: true },
  { id: 3, nome: 'Guerrieri', punti: 451, ultimoTurno: 65, puntimedia: 75.2 },
  { id: 4, nome: 'FC Fulmine', punti: 438, ultimoTurno: 71, puntimedia: 73.0 },
  { id: 5, nome: 'I Leoni', punti: 420, ultimoTurno: 60, puntimedia: 70.0 },
  { id: 6, nome: 'Aquile Rosse', punti: 405, ultimoTurno: 58, puntimedia: 67.5 },
  { id: 7, nome: 'Tornado FC', punti: 388, ultimoTurno: 62, puntimedia: 64.7 },
  { id: 8, nome: 'Stella Blu', punti: 371, ultimoTurno: 55, puntimedia: 61.8 },
];

const CALENDARIO_DEMO = Array.from({ length: 14 }, (_, i) => ({
  giornata: i + 1,
  giocata: true,
  puntiUser: 58 + Math.round(Math.sin(i) * 18 + Math.random() * 10),
})).concat([{ giornata: 15, giocata: false, puntiUser: null }]);

const useAppStore = create(
  persist(
    (set) => ({
      // ── Navigazione ────────────────────────────────────────
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // ── Utente (con auth) ──────────────────────────────────
      user: {
        id: null,
        email: null,
        name: 'Allenatore',
        plan: 'free',
        token: null,
        league: 'La mia lega',
      },
      setUser: (userData) => set({ user: userData }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      logout: () => set({
        user: { id: null, email: null, name: 'Allenatore', plan: 'free', token: null, league: 'La mia lega' },
        aiCrediti: 3,
        resetAt: null,
      }),

      // ── Rosa ───────────────────────────────────────────────
      rosa: [],
      giornataCorrente: 15,

      addGiocatore: (giocatore) =>
        set((state) => ({ rosa: [...state.rosa, { ...giocatore, id: Date.now() }] })),
      updateGiocatore: (id, updates) =>
        set((state) => ({ rosa: state.rosa.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
      removeGiocatore: (id) =>
        set((state) => ({
          rosa: state.rosa.filter((g) => g.id !== id),
          titolariIds: state.titolariIds.filter((tid) => tid !== id),
        })),
      toggleInfortunato: (id) =>
        set((state) => ({ rosa: state.rosa.map((g) => g.id === id ? { ...g, infortunato: !g.infortunato } : g) })),
      toggleDiffidato: (id) =>
        set((state) => ({ rosa: state.rosa.map((g) => g.id === id ? { ...g, diffidato: !g.diffidato } : g) })),

      // ── Lega ───────────────────────────────────────────────
      classifica: CLASSIFICA_DEMO,
      calendario: CALENDARIO_DEMO,
      setGiornataCorrente: (n) => set({ giornataCorrente: n }),
      setClassifica: (classifica) => set({ classifica }),
      setCalendario: (calendario) => set({ calendario }),

      // ── Mercato ────────────────────────────────────────────
      offerte: [],
      trattative: [],
      aggiornaOfferta: (id, nuovoStato) =>
        set((state) => ({ offerte: state.offerte.map((o) => o.id === id ? { ...o, stato: nuovoStato } : o) })),
      addOfferta: (offerta) => set((state) => ({ offerte: [...state.offerte, offerta] })),
      addTrattativa: (trattativa) => set((state) => ({ trattative: [...state.trattative, trattativa] })),

      // ── Schieramento ───────────────────────────────────────
      modulo: '4-3-3',
      titolariIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      setModulo: (modulo) => set({ modulo }),
      setTitolariIds: (ids) => set({ titolariIds: ids }),

      // ── AI ─────────────────────────────────────────────────
      aiCrediti: 3,
      resetAt: null,
      aiConversazioni: {},

      setAiCrediti: (n) => set({ aiCrediti: Math.max(0, n) }),
      setResetAt: (isoString) => set({ resetAt: isoString }),
      aggiungiMessaggio: (pageId, msg) =>
        set((state) => ({
          aiConversazioni: {
            ...state.aiConversazioni,
            [pageId]: [...(state.aiConversazioni[pageId] || []), msg],
          },
        })),
      resetConversazione: (pageId) =>
        set((state) => ({
          aiConversazioni: { ...state.aiConversazioni, [pageId]: [] },
        })),
    }),
    {
      name: 'fantabrain-store-v4',
      version: 1,
      migrate: (persistedState) => ({ ...persistedState, rosa: [] }),
    }
  )
);

export default useAppStore;
```

**Note:** Store key bumped to `v4` to force a fresh state (removes old `aiCrediti: 12` and `plan: 'pro'`).

- [ ] **Step 2: Verify app still starts**

```bash
npm run dev
```
Expected: Vite dev server starts, no console errors about missing store actions.

- [ ] **Step 3: Commit**

```bash
git add src/store/useAppStore.js
git commit -m "feat: update Zustand store with auth state and credits management"
```

---

### Task 3: Login and Register pages

**Files:**
- Create: `src/pages/Login.jsx`
- Create: `src/pages/Register.jsx`

- [ ] **Step 1: Create Login.jsx**

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setAiCrediti = useAppStore((s) => s.setAiCrediti);
  const setResetAt = useAppStore((s) => s.setResetAt);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Errore login'); return; }
      setUser({ ...data.user, token: data.token, league: 'La mia lega' });
      setAiCrediti(data.credits.remaining);
      setResetAt(data.credits.resetAt);
      navigate('/');
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
      <div className="glass-card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2">FantaBrain</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Accedi al tuo account</p>
        {error && <div className="text-red-400 text-sm mb-4 p-3 rounded bg-red-900/20">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
        <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
          Non hai un account?{' '}
          <Link to="/register" style={{ color: 'var(--gold)' }}>Registrati</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Register.jsx**

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setAiCrediti = useAppStore((s) => s.setAiCrediti);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Errore registrazione'); return; }
      setUser({ ...data.user, token: data.token, league: 'La mia lega' });
      setAiCrediti(3);
      navigate('/');
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
      <div className="glass-card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2">FantaBrain</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Crea il tuo account</p>
        {error && <div className="text-red-400 text-sm mb-4 p-3 rounded bg-red-900/20">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="input-field" type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" type="password" placeholder="Password (min 8 caratteri)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          <button className="btn-primary" disabled={loading}>{loading ? 'Registrazione...' : 'Registrati'}</button>
        </form>
        <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
          Hai già un account? <Link to="/login" style={{ color: 'var(--gold)' }}>Accedi</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Login.jsx src/pages/Register.jsx
git commit -m "feat: add Login and Register pages"
```

---

### Task 4: Update App.jsx routing

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Read current App.jsx**

```bash
cat src/App.jsx
```

- [ ] **Step 2: Add /login and /register routes**

In `src/App.jsx`, import the new pages and add routes. The existing `AppLayout` wrapper should redirect to `/login` if `user.token` is null. Add these imports at the top:

```jsx
import Login from './pages/Login';
import Register from './pages/Register';
import useAppStore from './store/useAppStore';
import { Navigate } from 'react-router-dom';
```

Add inside the `<Routes>` block (before the existing `<Route path="*" element={<AppLayout />}>`):
```jsx
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```

Wrap `AppLayout` with an auth guard — replace the catch-all route with:
```jsx
<Route
  path="*"
  element={
    useAppStore.getState().user.token
      ? <AppLayout />
      : <Navigate to="/login" replace />
  }
/>
```

**Important:** The Navigate check must be reactive. Use a wrapper component instead of calling getState() directly:

```jsx
function RequireAuth({ children }) {
  const token = useAppStore((s) => s.user.token);
  return token ? children : <Navigate to="/login" replace />;
}

// Then in Routes:
<Route path="*" element={<RequireAuth><AppLayout /></RequireAuth>} />
```

- [ ] **Step 3: Test login flow in browser**

```bash
npm run dev
```
1. Navigate to `http://localhost:5173` — should redirect to `/login`
2. Register with a new email
3. Should redirect to `/` (Dashboard)
4. Refresh page — should stay on Dashboard (token persisted)

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add auth routing and RequireAuth guard"
```

---

### Task 5: Create moduli.js data file

**Files:**
- Create: `src/data/moduli.js`
- Modify: `src/data/mockData.js`

- [ ] **Step 1: Create src/data/moduli.js**

```js
// Slot role notation: array of simple strings
// isCompatibile() in FormationEditor handles ruoloMantra like 'M/C' by splitting on '/'

export const MODULI = {
  '4-3-3': { label: '4-3-3', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'a1', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 3 },
    { id: 'a2', ruoli: ['T/A', 'W', 'A'], row: 3 },
  ]},
  '4-4-2': { label: '4-4-2', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'c1', ruoli: ['T/A', 'W', 'M', 'C'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'c2', ruoli: ['T/A', 'W', 'M', 'C'], row: 2 },
    { id: 'pc1', ruoli: ['PC', 'A'], row: 3 },
    { id: 'pc2', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '4-4-2 diamond': { label: '4-4-2 ◆', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'mdi', ruoli: ['M', 'C'], row: 2 },
    { id: 'mc1', ruoli: ['M', 'C', 'T/A'], row: 2 },
    { id: 'mc2', ruoli: ['M', 'C', 'T/A'], row: 2 },
    { id: 'trq', ruoli: ['T/A', 'A', 'C'], row: 2 },
    { id: 'pc1', ruoli: ['PC', 'A'], row: 3 },
    { id: 'pc2', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '3-4-3': { label: '3-4-3', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'W', 'T/A'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'dd', ruoli: ['DD', 'W', 'T/A'], row: 2 },
    { id: 'a1', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 3 },
    { id: 'a2', ruoli: ['T/A', 'W', 'A'], row: 3 },
  ]},
  '3-5-2': { label: '3-5-2', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'W', 'T/A'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'dd', ruoli: ['DD', 'W', 'T/A'], row: 2 },
    { id: 'pc1', ruoli: ['PC', 'A'], row: 3 },
    { id: 'pc2', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '5-3-2': { label: '5-3-2', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'ds', ruoli: ['DS', 'W', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'dd', ruoli: ['DD', 'W', 'DC'], row: 1 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'pc1', ruoli: ['PC', 'A'], row: 3 },
    { id: 'pc2', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '4-2-3-1': { label: '4-2-3-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'ta1', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'trq', ruoli: ['T/A', 'C', 'M', 'A'], row: 3 },
    { id: 'ta2', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 4 },
  ]},
  '4-3-2-1': { label: '4-3-2-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'ta1', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'ta2', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 4 },
  ]},
  '4-1-4-1': { label: '4-1-4-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'mdi', ruoli: ['M', 'C'], row: 2 },
    { id: 'c1', ruoli: ['T/A', 'W', 'M', 'C'], row: 3 },
    { id: 'm1', ruoli: ['M', 'C'], row: 3 },
    { id: 'm2', ruoli: ['M', 'C'], row: 3 },
    { id: 'c2', ruoli: ['T/A', 'W', 'M', 'C'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 4 },
  ]},
  '4-5-1': { label: '4-5-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'c1', ruoli: ['T/A', 'W', 'M'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'c2', ruoli: ['T/A', 'W', 'M'], row: 2 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '3-4-2-1': { label: '3-4-2-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'W', 'T/A'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'dd', ruoli: ['DD', 'W', 'T/A'], row: 2 },
    { id: 'ta1', ruoli: ['T/A', 'A', 'C'], row: 3 },
    { id: 'ta2', ruoli: ['T/A', 'A', 'C'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 4 },
  ]},
  '5-4-1': { label: '5-4-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'ds', ruoli: ['DS', 'W', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'dd', ruoli: ['DD', 'W', 'DC'], row: 1 },
    { id: 'c1', ruoli: ['T/A', 'W', 'M'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'c2', ruoli: ['T/A', 'W', 'M'], row: 2 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '3-6-1': { label: '3-6-1', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'c1', ruoli: ['T/A', 'W', 'M', 'DS'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'm4', ruoli: ['M', 'C'], row: 2 },
    { id: 'c2', ruoli: ['T/A', 'W', 'M', 'DD'], row: 2 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 3 },
  ]},
  '4-6-0': { label: '4-6-0', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'dd', ruoli: ['DD', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'ds', ruoli: ['DS', 'DC'], row: 1 },
    { id: 'c1', ruoli: ['T/A', 'W', 'M'], row: 2 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'm3', ruoli: ['M', 'C'], row: 2 },
    { id: 'm4', ruoli: ['M', 'C'], row: 2 },
    { id: 'c2', ruoli: ['T/A', 'W', 'M'], row: 2 },
  ]},
  '5-2-3': { label: '5-2-3', slots: [
    { id: 'por', ruoli: ['Por'], row: 0 },
    { id: 'ds', ruoli: ['DS', 'W', 'DC'], row: 1 },
    { id: 'dc1', ruoli: ['DC'], row: 1 },
    { id: 'dc2', ruoli: ['DC'], row: 1 },
    { id: 'dc3', ruoli: ['DC'], row: 1 },
    { id: 'dd', ruoli: ['DD', 'W', 'DC'], row: 1 },
    { id: 'm1', ruoli: ['M', 'C'], row: 2 },
    { id: 'm2', ruoli: ['M', 'C'], row: 2 },
    { id: 'a1', ruoli: ['T/A', 'W', 'A'], row: 3 },
    { id: 'pc', ruoli: ['PC', 'A'], row: 3 },
    { id: 'a2', ruoli: ['T/A', 'W', 'A'], row: 3 },
  ]},
};

export const MODULI_LIST = Object.keys(MODULI);

// isCompatibile: checks if a giocatore's ruoloMantra is allowed for a slot
// ruoloMantra can be 'M/C', 'T/A', 'DD' etc — slot.ruoli is an array of simple strings
export function isCompatibile(ruoloMantra, slotRuoli) {
  if (!ruoloMantra) return false;
  const ruoliGiocatore = ruoloMantra.split('/').map((r) => r.trim());
  return slotRuoli.some((sr) => ruoliGiocatore.includes(sr));
}
```

- [ ] **Step 2: Remove moduli from mockData.js**

In `src/data/mockData.js`, find and remove the line:
```js
export const moduli = ['4-3-3', '3-4-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'];
```

- [ ] **Step 3: Commit**

```bash
git add src/data/moduli.js src/data/mockData.js
git commit -m "feat: add moduli.js with 15 formations; remove from mockData"
```

---

### Task 6: FormationSlot and PlayerToken components

**Files:**
- Create: `src/components/formation/FormationSlot.jsx`
- Create: `src/components/formation/PlayerToken.jsx`

- [ ] **Step 1: Create FormationSlot.jsx**

```jsx
import { useDroppable } from '@dnd-kit/core';
import { isCompatibile } from '../../data/moduli';

const RUOLO_COLORS = {
  Por: '#F59E0B', DD: '#3B82F6', DS: '#3B82F6', DC: '#3B82F6',
  'M/C': '#22C55E', M: '#22C55E', C: '#22C55E',
  'T/A': '#06B6D4', W: '#06B6D4', A: '#06B6D4',
  PC: '#EF4444',
};

function getColor(ruoloMantra) {
  if (!ruoloMantra) return '#64748B';
  const primary = ruoloMantra.split('/')[0].trim();
  return RUOLO_COLORS[primary] || RUOLO_COLORS[ruoloMantra] || '#64748B';
}

export default function FormationSlot({ slotId, slot, giocatore, isSelected, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  const incompatibile = giocatore && !isCompatibile(giocatore.ruoloMantra, slot.ruoli);
  const borderColor = incompatibile
    ? '#EF4444'
    : isOver
    ? '#F59E0B'
    : isSelected
    ? '#F59E0B'
    : 'transparent';

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        cursor: 'pointer',
        minWidth: '44px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: giocatore ? getColor(giocatore.ruoloMantra) : '#1E1E2E',
          border: `2px solid ${borderColor || (giocatore ? '#fff' : '#334155')}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: giocatore ? `0 2px 8px ${getColor(giocatore.ruoloMantra)}66` : 'none',
          transition: 'border-color 0.15s',
          position: 'relative',
        }}
      >
        {giocatore ? giocatore.ruoloMantra?.split('/')[0] : slot.ruoli[0]}
        {giocatore?.infortunato && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', background: '#EF4444', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</span>
        )}
        {giocatore?.diffidato && !giocatore?.infortunato && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', background: '#F59E0B', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
        )}
      </div>
      {giocatore ? (
        <>
          <span style={{ fontSize: '8px', color: '#fff', fontWeight: 'bold', textShadow: '0 1px 3px #000', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {giocatore.cognome || giocatore.nome}
          </span>
          <span style={{ fontSize: '7px', color: '#F59E0B' }}>{giocatore.votoMedia?.toFixed(1)}</span>
        </>
      ) : (
        <span style={{ fontSize: '7px', color: '#475569' }}>{slot.ruoli[0]}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create PlayerToken.jsx**

```jsx
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const RUOLO_COLORS = {
  Por: '#F59E0B', DD: '#3B82F6', DS: '#3B82F6', DC: '#3B82F6',
  'M/C': '#22C55E', M: '#22C55E', C: '#22C55E',
  'T/A': '#06B6D4', W: '#06B6D4', A: '#06B6D4',
  PC: '#EF4444',
};

export default function PlayerToken({ giocatore, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${giocatore.id}`,
    data: { giocatoreId: giocatore.id },
    disabled,
  });

  const primary = giocatore.ruoloMantra?.split('/')[0].trim();
  const color = RUOLO_COLORS[primary] || '#64748B';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: '#1E1E2E',
        borderRadius: '6px',
        padding: '6px 8px',
        cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : giocatore.infortunato ? 0.5 : 1,
        border: '1px solid transparent',
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {giocatore.cognome || giocatore.nome}
        </div>
        <div style={{ fontSize: '9px', color: '#64748B' }}>{giocatore.squadra}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontSize: '8px', color, background: `${color}22`, borderRadius: '3px', padding: '1px 4px' }}>
          {giocatore.ruoloMantra}
        </span>
        <span style={{ fontSize: '9px', color: '#F59E0B' }}>{giocatore.votoMedia?.toFixed(1)}</span>
        {giocatore.infortunato && <span style={{ fontSize: '9px', color: '#EF4444' }}>✕</span>}
        {giocatore.diffidato && !giocatore.infortunato && <span style={{ fontSize: '9px', color: '#F59E0B' }}>!</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/formation/FormationSlot.jsx src/components/formation/PlayerToken.jsx
git commit -m "feat: add FormationSlot and PlayerToken components with dnd-kit"
```

---

### Task 7: PlayerList component

**Files:**
- Create: `src/components/formation/PlayerList.jsx`

- [ ] **Step 1: Create PlayerList.jsx**

```jsx
import { useState } from 'react';
import PlayerToken from './PlayerToken';

export default function PlayerList({ rosa, titolariIds, onPlayerClick, highlightedIds }) {
  const [tab, setTab] = useState('rosa'); // 'rosa' | 'panchina'
  const [search, setSearch] = useState('');

  const nonTitolari = rosa.filter((g) => !titolariIds.includes(g.id));
  const titolari = rosa.filter((g) => titolariIds.includes(g.id));
  const displayed = tab === 'rosa' ? nonTitolari : titolari;

  const filtered = displayed.filter((g) => {
    const q = search.toLowerCase();
    return !q || g.nome?.toLowerCase().includes(q) || g.cognome?.toLowerCase().includes(q) || g.squadra?.toLowerCase().includes(q);
  });

  return (
    <div style={{ width: '160px', background: '#0E0E18', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ffffff10' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ffffff10' }}>
        {['rosa', 'panchina'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 4px', fontSize: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: tab === t ? '#F59E0B' : '#64748B',
              borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent',
            }}
          >
            {t === 'rosa' ? `Rosa (${nonTitolari.length})` : `Panchina (${titolari.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '6px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cerca..."
          style={{ width: '100%', background: '#1E1E2E', border: '1px solid #ffffff15', borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: '#94A3B8', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Player list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '10px', paddingTop: '16px' }}>
            {search ? 'Nessun risultato' : 'Nessun giocatore'}
          </div>
        )}
        {filtered.map((g) => (
          <div
            key={g.id}
            onClick={() => onPlayerClick?.(g.id)}
            style={{
              outline: highlightedIds?.includes(g.id) ? '1px solid #F59E0B' : 'none',
              borderRadius: '6px',
            }}
          >
            <PlayerToken giocatore={g} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/formation/PlayerList.jsx
git commit -m "feat: add PlayerList component with tabs and search"
```

---

### Task 8: FormationEditor main component

**Files:**
- Create: `src/components/formation/FormationEditor.jsx`

- [ ] **Step 1: Create FormationEditor.jsx**

```jsx
import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { MODULI, MODULI_LIST, isCompatibile } from '../../data/moduli';
import FormationSlot from './FormationSlot';
import PlayerToken from './PlayerToken';
import PlayerList from './PlayerList';

export default function FormationEditor({ rosa, modulo, titolariIds, onModuloChange, onTitolariChange, puntoAtteso }) {
  const [activeGiocatoreId, setActiveGiocatoreId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [highlightedIds, setHighlightedIds] = useState([]);

  const moduloDef = MODULI[modulo] || MODULI['4-3-3'];
  const slots = moduloDef.slots;

  // Map: slotIndex → giocatoreId
  const slotMap = Object.fromEntries(
    titolariIds.map((gId, idx) => [idx, gId]).filter(([, gId]) => gId != null)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function getGiocatoreBySlotIndex(idx) {
    return rosa.find((g) => g.id === slotMap[idx]) || null;
  }

  function handleDragStart({ active }) {
    setActiveGiocatoreId(active.data.current?.giocatoreId ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveGiocatoreId(null);
    if (!over) return;

    const draggedId = active.data.current?.giocatoreId;
    const targetSlotIdx = parseInt(over.id.replace('slot-', ''), 10);
    if (isNaN(targetSlotIdx) || draggedId == null) return;

    const newIds = [...titolariIds];
    const currentSlotIdx = newIds.indexOf(draggedId);
    const occupantId = newIds[targetSlotIdx];

    if (currentSlotIdx >= 0) {
      // Drag from field slot: swap
      newIds[targetSlotIdx] = draggedId;
      newIds[currentSlotIdx] = occupantId ?? null;
    } else {
      // Drag from roster list: place, kick existing to bench if any
      newIds[targetSlotIdx] = draggedId;
    }
    onTitolariChange(newIds.filter((id) => id != null));
  }

  function handleSlotClick(slotIdx) {
    const slot = slots[slotIdx];
    if (slotMap[slotIdx]) {
      // Deselect
      setSelectedSlotId(null);
      setHighlightedIds([]);
    } else {
      setSelectedSlotId(slotIdx);
      // Highlight compatible players not yet in starting XI
      const compatible = rosa
        .filter((g) => !titolariIds.includes(g.id) && isCompatibile(g.ruoloMantra, slot.ruoli))
        .map((g) => g.id);
      setHighlightedIds(compatible);
    }
  }

  function handlePlayerListClick(gId) {
    if (selectedSlotId == null) return;
    const newIds = [...titolariIds];
    newIds[selectedSlotId] = gId;
    onTitolariChange(newIds);
    setSelectedSlotId(null);
    setHighlightedIds([]);
  }

  // Group slots by row
  const rows = slots.reduce((acc, slot, idx) => {
    (acc[slot.row] = acc[slot.row] || []).push({ slot, idx });
    return acc;
  }, {});

  const activeGiocatore = rosa.find((g) => g.id === activeGiocatoreId) || null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0A12' }}>

        {/* Toolbar */}
        <div style={{ background: '#12121A', borderBottom: '1px solid #ffffff10', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={modulo}
            onChange={(e) => onModuloChange(e.target.value)}
            style={{ background: '#1E1E2E', border: '1px solid #F59E0B55', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', color: '#F59E0B', cursor: 'pointer', outline: 'none' }}
          >
            {MODULI_LIST.map((m) => (
              <option key={m} value={m}>{MODULI[m].label}</option>
            ))}
          </select>
          <div style={{ background: '#1E1E2E', borderRadius: '6px', padding: '5px 10px', fontSize: '10px', color: '#94A3B8' }}>
            Punteggio atteso: <span style={{ color: '#22C55E', fontWeight: 'bold' }}>{puntoAtteso?.toFixed(1) ?? '—'}</span>
          </div>
        </div>

        {/* Field + Lateral panel */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Field */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(180deg, #0F3320 0%, #155228 30%, #1A6030 50%, #155228 70%, #0F3320 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '16px 8px',
            position: 'relative',
            overflowY: 'auto',
          }}>
            {/* Center line */}
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '1px', background: '#ffffff15', pointerEvents: 'none' }} />

            {Object.keys(rows).sort((a, b) => b - a).map((rowKey) => (
              <div key={rowKey} style={{ display: 'flex', gap: '16px', alignItems: 'center', zIndex: 1 }}>
                {rows[rowKey].map(({ slot, idx }) => (
                  <FormationSlot
                    key={slot.id}
                    slotId={`slot-${idx}`}
                    slot={slot}
                    giocatore={getGiocatoreBySlotIndex(idx)}
                    isSelected={selectedSlotId === idx}
                    onClick={() => handleSlotClick(idx)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Lateral panel */}
          <PlayerList
            rosa={rosa}
            titolariIds={titolariIds}
            onPlayerClick={handlePlayerListClick}
            highlightedIds={highlightedIds}
          />
        </div>
      </div>

      <DragOverlay>
        {activeGiocatore ? <PlayerToken giocatore={activeGiocatore} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/formation/FormationEditor.jsx
git commit -m "feat: add FormationEditor with dnd-kit drag and drop"
```

---

### Task 9: Refactor Schieramento.jsx

**Files:**
- Modify: `src/pages/Schieramento.jsx`

- [ ] **Step 1: Replace Schieramento.jsx**

The new version is a slim wrapper. Keep the AI sidebar (ottimizza schieramento) intact — only replace the pitch area with `<FormationEditor />`.

```jsx
import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import FormationEditor from '../components/formation/FormationEditor';
import { analizzaSchieramento } from '../lib/claudeApi';
import { MODULI } from '../data/moduli';

export default function Schieramento() {
  const rosa = useAppStore((s) => s.rosa);
  const modulo = useAppStore((s) => s.modulo);
  const setModulo = useAppStore((s) => s.setModulo);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const setTitolariIds = useAppStore((s) => s.setTitolariIds);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisultato, setAiRisultato] = useState('');
  const [aiError, setAiError] = useState('');

  const titolari = rosa.filter((g) => titolariIds.includes(g.id));
  const puntoAtteso = titolari.reduce((sum, g) => sum + (g.votoMedia || 0), 0);

  async function handleOttimizza() {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const moduloDef = MODULI[modulo];
      const schieramentoData = {
        modulo,
        titolari: titolari.map((g, i) => ({
          nome: `${g.nome} ${g.cognome}`,
          ruolo: g.ruoloMantra,
          slot: moduloDef?.slots[i]?.id,
          media: g.votoMedia,
          infortunato: g.infortunato,
          diffidato: g.diffidato,
        })),
      };
      const risultato = await analizzaSchieramento(schieramentoData, rosa, giornataCorrente);
      setAiRisultato(risultato);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Formation Editor — takes remaining width */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <FormationEditor
          rosa={rosa}
          modulo={modulo}
          titolariIds={titolariIds}
          onModuloChange={setModulo}
          onTitolariChange={setTitolariIds}
          puntoAtteso={puntoAtteso}
        />
      </div>

      {/* AI Sidebar */}
      <div style={{ width: '280px', background: '#0E0E18', borderLeft: '1px solid #ffffff10', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        <h3 style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>⚡ Analisi AI</h3>
        <button
          onClick={handleOttimizza}
          disabled={aiLoading}
          className="btn-ai"
          style={{ width: '100%' }}
        >
          {aiLoading ? '⏳ Analisi in corso...' : '⚡ Ottimizza Schieramento'}
        </button>
        {aiError && <div style={{ color: '#EF4444', fontSize: '11px' }}>{aiError}</div>}
        {aiRisultato && (
          <div style={{ background: '#1A1200', border: '1px solid #F59E0B33', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#E2E8F0', lineHeight: '1.6' }}>
            {aiRisultato}
          </div>
        )}

        {/* Legenda */}
        <div style={{ marginTop: 'auto', fontSize: '10px', color: '#64748B' }}>
          <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#94A3B8' }}>Legenda ruoli</div>
          {[['Por', '#F59E0B'], ['DC/DD/DS', '#3B82F6'], ['M/C', '#22C55E'], ['T/A/W', '#06B6D4'], ['PC', '#EF4444']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

```bash
npm run dev
```
Navigate to `/schieramento`. Verify:
- Dropdown shows all 15 moduli
- Players can be dragged from lateral panel to field slots
- Click a slot, compatible players are highlighted in the list

- [ ] **Step 3: Commit**

```bash
git add src/pages/Schieramento.jsx
git commit -m "feat: refactor Schieramento to use FormationEditor"
```

---

### Task 10: Sidebar GOLD badge

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Read current Sidebar.jsx**

```bash
cat src/components/layout/Sidebar.jsx
```

- [ ] **Step 2: Add GOLD badge next to "Analisi AI"**

Find the nav item for "Analisi AI" (route `/ai-analisi`). After the label text, add:
```jsx
<span style={{
  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
  color: '#000',
  fontSize: '8px',
  fontWeight: '900',
  padding: '2px 5px',
  borderRadius: '4px',
  letterSpacing: '0.5px',
  marginLeft: '4px',
}}>
  GOLD
</span>
```

This badge is always visible to all users (serves as promotion).

- [ ] **Step 3: Verify in browser**

Navigate to any page and confirm "Analisi AI" in the sidebar shows the GOLD badge.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: add GOLD badge to Analisi AI in Sidebar"
```

---

### Task 11: Update claudeApi.js — reroute chatClaude

**Files:**
- Modify: `src/lib/claudeApi.js`

- [ ] **Step 0: Read current claudeApi.js to understand structure**

```bash
cat src/lib/claudeApi.js
```
Note the exact content of `callApi()`, `chatClaude()`, and the top-level `import useAppStore` line.

- [ ] **Step 1: Apply three targeted changes to claudeApi.js**

**Change A** — Remove the top-level import (line 1):
```js
// DELETE this line:
import useAppStore from '../store/useAppStore';
```

**Change B** — Inside `callApi()`, find and remove the `decrementaCrediti` call:
```js
// DELETE this line (it's right before the return):
useAppStore.getState().decrementaCrediti();
```

**Change C** — Replace the entire `chatClaude` export function (the one that calls `callApi`) with:
```js
// chatClaude routes to backend /api/ai/chat (Anthropic SDK, credit-gated)
export async function chatClaude({ messages, systemPrompt, maxTokens = 600 }) {
  const { default: useAppStore } = await import('../store/useAppStore.js');
  const store = useAppStore.getState();
  const { user, setAiCrediti, setResetAt } = store;

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
```

Note: `useAppStore` is imported dynamically inside `chatClaude` to avoid a circular dependency (claudeApi → store → claudeApi). All other functions (`callClaude`, `analizzaSchieramento`, etc.) use `callApi` and call Groq directly — they are **not changed**.

- [ ] **Step 2: Verify callClaude (Groq) still works**

The `callApi` function that Groq functions use must still have the Groq fetch logic intact. Confirm `callApi` has NOT been changed except for the removed `decrementaCrediti()` call.

- [ ] **Step 3: Verify other Groq functions still work**

In browser, navigate to `/schieramento` and click "Ottimizza Schieramento". Should still call Groq and return a result.

- [ ] **Step 4: Commit**

```bash
git add src/lib/claudeApi.js
git commit -m "feat: reroute chatClaude to backend /api/ai/chat with Anthropic SDK"
```

---

### Task 12: Update AIAnalisi.jsx with credits UI

**Files:**
- Modify: `src/pages/AIAnalisi.jsx`

- [ ] **Step 1: Add credits state from store**

In `AIAnalisi.jsx`, add these store selectors near the top of the component:
```js
const aiCrediti = useAppStore((s) => s.aiCrediti);
const resetAt = useAppStore((s) => s.resetAt);
const userPlan = useAppStore((s) => s.user.plan);
const isGold = userPlan === 'gold';
```

- [ ] **Step 2: Add credits header component**

Add above the chat input area:
```jsx
{/* Credits header — only for non-Gold */}
{!isGold && (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#12121A', borderBottom: '1px solid #ffffff08' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < aiCrediti ? '#F59E0B' : '#ffffff20', border: i >= aiCrediti ? '1px solid #F59E0B44' : 'none' }} />
        ))}
      </div>
      <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 'bold' }}>{aiCrediti}/3 crediti</span>
    </div>
    {resetAt && (
      <span style={{ fontSize: '9px', color: '#475569' }}>
        🔄 Reset {new Date(resetAt).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })} 20:45
      </span>
    )}
  </div>
)}
{isGold && (
  <div style={{ padding: '6px 12px', background: 'linear-gradient(90deg, #1A1200, #12121A)', borderBottom: '1px solid #F59E0B22', display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#000', fontSize: '8px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>✦ GOLD</span>
    <span style={{ fontSize: '10px', color: '#F59E0B44' }}>Accesso illimitato</span>
  </div>
)}
```

- [ ] **Step 0: Read current AIAnalisi.jsx to understand input area structure**

```bash
cat src/pages/AIAnalisi.jsx
```
Locate the "Bottom bar" `<div>` that contains the prompt rapidi buttons and the input+send area (around line 226).

- [ ] **Step 3: Replace the bottom bar div with a conditional**

Find this exact block in `AIAnalisi.jsx` (the bottom bar that starts with the prompt rapidi):
```jsx
{/* Bottom bar: prompt rapidi + input */}
<div className="glass-elevated" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-glass)' }}>
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
    {PROMPT_RAPIDI.map((p) => ( ... ))}
  </div>
  <div style={{ display: 'flex', gap: 10 }}>
    <input ... disabled={loading || aiCrediti === 0} ... />
    <button ... disabled={loading || !input.trim() || aiCrediti === 0}>Invia</button>
  </div>
</div>
```

Replace it with:
```jsx
{aiCrediti === 0 && !isGold ? (
  /* Lock screen when credits are exhausted */
  <div className="glass-elevated" style={{ padding: '24px 16px', textAlign: 'center', borderTop: '1px solid var(--border-glass)' }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>Crediti AI esauriti</div>
    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
      {resetAt
        ? `Reset: ${new Date(resetAt).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle 20:45`
        : 'Reset automatico a fine giornata'}
    </div>
  </div>
) : (
  /* Normal input bar */
  <div className="glass-elevated" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-glass)' }}>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
      {PROMPT_RAPIDI.map((p) => (
        <button
          key={p.label}
          onClick={() => invia(p.label)}
          disabled={loading}
          style={{
            background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 20, padding: '4px 12px', fontSize: 11,
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(0,212,255,0.14)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; }}
        >
          {p.icon} {p.label}
        </button>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <input
        className="input-field"
        placeholder="Fai una domanda sulla tua rosa..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && invia()}
        disabled={loading}
        style={{ flex: 1 }}
      />
      <button
        className="btn-primary"
        onClick={() => invia()}
        disabled={loading || !input.trim()}
        style={{ flexShrink: 0 }}
      >
        Invia
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 4: Handle NO_CREDITS error from chatClaude**

In the message send handler, add:
```js
} catch (err) {
  if (err.message === 'NO_CREDITS') {
    // Store already updated by chatClaude — UI will re-render with lock screen
    return;
  }
  // ... existing error handling
}
```

- [ ] **Step 5: Test in browser**

1. Login as a free user
2. Navigate to `/ai-analisi`
3. Verify credits dots show correctly (e.g. ●●● = 3 credits)
4. Send a message — credits should update to ●●○ after response
5. After 3 messages — lock screen should appear

- [ ] **Step 6: Commit**

```bash
git add src/pages/AIAnalisi.jsx
git commit -m "feat: add Gold badge, credits display and lock screen to AIAnalisi"
```

---

### Task 13: End-to-end verification

- [ ] **Step 1: Start dev server with backend**

```bash
npm run dev &    # Vite frontend on :5173
node server.js   # Express backend on :3000
```

Or if using Vite proxy (check `vite.config.js` — it should proxy `/auth` and `/api` to `:3000`).

- [ ] **Step 2: Verify proxy config in vite.config.js**

Ensure `vite.config.js` has:
```js
server: {
  proxy: {
    '/auth': 'http://localhost:3000',
    '/api': 'http://localhost:3000',
  }
}
```
If not present, add it.

- [ ] **Step 3: Full flow test**

1. Register new user → lands on Dashboard
2. Navigate to `/schieramento` → drag player to field slot → works
3. Change modulo to `4-2-3-1` → layout updates to 5 rows
4. Navigate to `/ai-analisi` → see credits dots
5. Send message → credits decrease, AI responds with Claude
6. Sidebar shows GOLD badge

- [ ] **Step 4: Final commit**

```bash
git add vite.config.js
git commit -m "chore: verify proxy config for auth and api routes"
```
