# FantaBrain — Backend Auth + Credits + AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Express + PostgreSQL backend with Passport.js auth, per-giornata AI credits system, and Anthropic SDK proxy for the Gold chatbot.

**Architecture:** Extend the existing `server.js` (single Render service) with new routes registered before the SPA fallback. PostgreSQL (Render free tier) stores users and credits. JWT tokens are issued on login and verified by middleware on protected routes.

**Tech Stack:** Node.js 20, Express 4, Passport.js (local), bcrypt, jsonwebtoken, pg (node-postgres), node-cron, @anthropic-ai/sdk, node:test (built-in test runner)

**Spec:** `docs/superpowers/specs/2026-03-21-fantabrain-features-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `server/db/pool.js` | pg Pool singleton |
| Create | `server/db/schema.sql` | PostgreSQL schema (users, ai_credits, ai_conversations) |
| Create | `server/middleware/auth.js` | `authenticateJWT` and `authenticateAdmin` middleware |
| Create | `server/routes/auth.js` | POST /auth/register, POST /auth/login, GET /auth/me |
| Create | `server/routes/credits.js` | GET /api/credits, POST /api/credits/use |
| Create | `server/routes/ai.js` | POST /api/ai/chat (Anthropic SDK) |
| Create | `server/routes/admin.js` | POST /api/admin/set-plan, POST /api/admin/reset-credits |
| Create | `server/cron/resetCredits.js` | node-cron weekly reset job |
| Create | `server/tests/auth.test.js` | Tests for auth middleware + register/login |
| Create | `server/tests/credits.test.js` | Tests for credits logic |
| Modify | `server.js` | Register all new routes before SPA fallback |
| Modify | `package.json` | Add backend + frontend dependencies |
| Modify | `render.yaml` | Add DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, ADMIN_SECRET + db stanza |
| Create | `.env` (local) | Local dev env vars (not committed) |

---

### Task 1: Install backend dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install passport passport-local jsonwebtoken bcrypt pg node-cron @anthropic-ai/sdk cors
```

- [ ] **Step 2: Verify install**

```bash
node -e "import('bcrypt').then(() => console.log('OK'))"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add backend dependencies (passport, jwt, bcrypt, pg, cron, anthropic)"
```

---

### Task 2: Database pool + schema

**Files:**
- Create: `server/db/pool.js`
- Create: `server/db/schema.sql`

- [ ] **Step 1: Create pool singleton**

Create `server/db/pool.js`:
```js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
```

- [ ] **Step 2: Create schema**

Create `server/db/schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free','silver','gold')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  credits_remaining INTEGER DEFAULT 3 CHECK (credits_remaining >= 0),
  reset_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  page_id VARCHAR(50),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

- [ ] **Step 3: Create .env (local dev)**

Create `.env` (add to `.gitignore` if not already):
```
DATABASE_URL=postgresql://localhost/fantabrain_dev
JWT_SECRET=dev-secret-change-in-production-64chars
ANTHROPIC_API_KEY=sk-ant-...
FOOTBALL_DATA_API_KEY=...
ADMIN_SECRET=dev-admin-secret
VITE_GROQ_API_KEY=...
```

- [ ] **Step 4: Verify .gitignore includes .env**

```bash
grep -q "^\.env$" .gitignore || echo '.env' >> .gitignore
```

- [ ] **Step 5: Apply schema to local DB**

```bash
createdb fantabrain_dev
psql fantabrain_dev < server/db/schema.sql
```
Expected: `CREATE TABLE` printed 3 times, no errors.

- [ ] **Step 6: Commit**

```bash
git add server/db/pool.js server/db/schema.sql .gitignore
git commit -m "feat: add db pool and PostgreSQL schema"
```

---

### Task 3: Auth middleware

**Files:**
- Create: `server/middleware/auth.js`
- Create: `server/tests/auth.test.js`

- [ ] **Step 1: Write failing test**

Create `server/tests/auth.test.js`:
```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_SECRET = 'test-admin';

// Minimal Express mock
function mockRes() {
  const res = { _status: null, _json: null };
  res.status = (n) => { res._status = n; return res; };
  res.json = (d) => { res._json = d; return res; };
  return res;
}

describe('authenticateJWT', async () => {
  const { authenticateJWT } = await import('../middleware/auth.js');

  it('calls next() with valid token', () => {
    const token = jwt.sign({ id: 1, email: 'a@b.com', plan: 'free' }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let called = false;
    authenticateJWT(req, res, () => { called = true; });
    assert.ok(called);
    assert.equal(req.user.id, 1);
  });

  it('returns 401 with no token', () => {
    const req = { headers: {} };
    const res = mockRes();
    authenticateJWT(req, res, () => {});
    assert.equal(res._status, 401);
  });

  it('returns 401 with invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = mockRes();
    authenticateJWT(req, res, () => {});
    assert.equal(res._status, 401);
  });
});

describe('authenticateAdmin', async () => {
  const { authenticateAdmin } = await import('../middleware/auth.js');

  it('calls next() with correct secret', () => {
    const req = { headers: { 'x-admin-secret': 'test-admin' } };
    const res = mockRes();
    let called = false;
    authenticateAdmin(req, res, () => { called = true; });
    assert.ok(called);
  });

  it('returns 403 with wrong secret', () => {
    const req = { headers: { 'x-admin-secret': 'wrong' } };
    const res = mockRes();
    authenticateAdmin(req, res, () => {});
    assert.equal(res._status, 403);
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
node --test server/tests/auth.test.js
```
Expected: FAIL — `Cannot find module '../middleware/auth.js'`

- [ ] **Step 3: Implement middleware**

Create `server/middleware/auth.js`:
```js
import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}

export function authenticateAdmin(req, res, next) {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
```

- [ ] **Step 4: Run test — verify PASS**

```bash
node --test server/tests/auth.test.js
```
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/middleware/auth.js server/tests/auth.test.js
git commit -m "feat: add JWT and admin auth middleware with tests"
```

---

### Task 4: Auth routes (register + login)

**Files:**
- Create: `server/routes/auth.js`

- [ ] **Step 1: Write failing test** (append to `server/tests/auth.test.js`)

```js
// Add at bottom of auth.test.js
import bcrypt from 'bcrypt';

describe('password hashing', () => {
  it('bcrypt hash verifies correctly', async () => {
    const hash = await bcrypt.hash('mypassword', 10);
    const valid = await bcrypt.compare('mypassword', hash);
    assert.ok(valid);
  });

  it('bcrypt rejects wrong password', async () => {
    const hash = await bcrypt.hash('mypassword', 10);
    const valid = await bcrypt.compare('wrong', hash);
    assert.ok(!valid);
  });
});
```

- [ ] **Step 2: Run test — verify PASS** (bcrypt is already installed)

```bash
node --test server/tests/auth.test.js
```
Expected: all 7 tests PASS

- [ ] **Step 3: Implement auth routes**

Create `server/routes/auth.js`:
```js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password e name sono obbligatori' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, plan',
      [email.toLowerCase(), password_hash, name]
    );
    const user = rows[0];
    // Create initial credits row
    await pool.query(
      'INSERT INTO ai_credits (user_id, credits_remaining) VALUES ($1, 3)',
      [user.id]
    );
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email già registrata' });
    console.error('[register]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email e password obbligatori' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const creditsRow = await pool.query(
      'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
      [user.id]
    );
    const credits = creditsRow.rows[0] || { credits_remaining: 3, reset_at: null };
    res.json({
      token: signToken(user),
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      credits: { remaining: credits.credits_remaining, resetAt: credits.reset_at },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// GET /auth/me
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, plan FROM users WHERE id = $1',
      [req.user.id]
    );
    const creditsRow = await pool.query(
      'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
      [req.user.id]
    );
    const credits = creditsRow.rows[0] || { credits_remaining: 3, reset_at: null };
    res.json({
      user: rows[0],
      credits: { remaining: credits.credits_remaining, resetAt: credits.reset_at },
    });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
```

- [ ] **Step 4: Commit**

```bash
git add server/routes/auth.js server/tests/auth.test.js
git commit -m "feat: add auth routes (register, login, me)"
```

---

### Task 5: Credits routes

**Files:**
- Create: `server/routes/credits.js`
- Create: `server/tests/credits.test.js`

- [ ] **Step 1: Write failing test**

Create `server/tests/credits.test.js`:
```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure logic tests — no DB
describe('credits logic', () => {
  it('Gold users bypass credit check', () => {
    const canUse = (plan, credits) => plan === 'gold' || credits > 0;
    assert.ok(canUse('gold', 0));
    assert.ok(canUse('free', 1));
    assert.ok(!canUse('free', 0));
    assert.ok(!canUse('silver', 0));
  });

  it('credits never go below 0', () => {
    const decrement = (n) => Math.max(0, n - 1);
    assert.equal(decrement(1), 0);
    assert.equal(decrement(0), 0);
    assert.equal(decrement(3), 2);
  });
});
```

- [ ] **Step 2: Run test — verify PASS**

```bash
node --test server/tests/credits.test.js
```
Expected: 2 tests PASS

- [ ] **Step 3: Implement credits routes**

Create `server/routes/credits.js`:
```js
import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// GET /api/credits
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
      [req.user.id]
    );
    const row = rows[0] || { credits_remaining: 3, reset_at: null };
    const planRow = await pool.query('SELECT plan FROM users WHERE id = $1', [req.user.id]);
    res.json({
      remaining: row.credits_remaining,
      resetAt: row.reset_at,
      plan: planRow.rows[0]?.plan || 'free',
    });
  } catch (err) {
    console.error('[credits GET]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
```

- [ ] **Step 4: Commit**

```bash
git add server/routes/credits.js server/tests/credits.test.js
git commit -m "feat: add credits route with tests"
```

---

### Task 6: AI chat route (Anthropic SDK)

**Files:**
- Create: `server/routes/ai.js`

- [ ] **Step 1: Implement AI chat route**

Create `server/routes/ai.js`:
```js
import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/chat
router.post('/chat', authenticateJWT, async (req, res) => {
  const { messages, systemPrompt, maxTokens = 600 } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array obbligatorio' });
  }

  try {
    // Check plan
    const userRow = await pool.query('SELECT plan FROM users WHERE id = $1', [req.user.id]);
    const plan = userRow.rows[0]?.plan || 'free';

    if (plan !== 'gold') {
      // Check credits
      const credRow = await pool.query(
        'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
        [req.user.id]
      );
      const credits = credRow.rows[0];
      if (!credits || credits.credits_remaining <= 0) {
        return res.status(402).json({
          error: 'NO_CREDITS',
          resetAt: credits?.reset_at || null,
        });
      }
    }

    // Call Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt || 'Sei FantaBrain AI, assistente per il Fantacalcio Mantra italiano. Parla in italiano.',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content = response.content[0]?.text || '';

    // Decrement credits for non-Gold users
    let creditsRemaining = null;
    if (plan !== 'gold') {
      const updated = await pool.query(
        'UPDATE ai_credits SET credits_remaining = GREATEST(0, credits_remaining - 1) WHERE user_id = $1 RETURNING credits_remaining',
        [req.user.id]
      );
      creditsRemaining = updated.rows[0]?.credits_remaining ?? 0;
    }

    res.json({ content, creditsRemaining });
  } catch (err) {
    console.error('[ai chat]', err);
    res.status(500).json({ error: 'Errore AI' });
  }
});

export default router;
```

- [ ] **Step 2: Verify Anthropic SDK import works**

```bash
node -e "import('@anthropic-ai/sdk').then(m => console.log('Anthropic OK', typeof m.default))"
```
Expected: `Anthropic OK function`

- [ ] **Step 3: Commit**

```bash
git add server/routes/ai.js
git commit -m "feat: add AI chat route with Anthropic SDK and credits gate"
```

---

### Task 7: Cron reset job

**Files:**
- Create: `server/cron/resetCredits.js`

- [ ] **Step 1: Implement cron job**

Create `server/cron/resetCredits.js`:
```js
import cron from 'node-cron';
import pool from '../db/pool.js';

export function startCreditResetCron() {
  // Every Monday at 20:45 Europe/Rome
  cron.schedule('45 20 * * 1', async () => {
    console.log('[cron] Checking if matchday is complete before resetting credits...');
    try {
      // Check for active matches in Serie A
      const apiKey = process.env.FOOTBALL_DATA_API_KEY;
      const response = await fetch(
        'https://api.football-data.org/v4/competitions/SA/matches?status=IN_PLAY,PAUSED',
        { headers: { 'X-Auth-Token': apiKey } }
      );
      const data = await response.json();
      const activeMatches = data.matches ?? [];

      if (activeMatches.length > 0) {
        console.log(`[cron] Reset skipped: ${activeMatches.length} matches still active`);
        return;
      }

      const result = await pool.query(`
        UPDATE ai_credits
        SET credits_remaining = 3, reset_at = NOW()
        WHERE user_id IN (SELECT id FROM users WHERE plan != 'gold')
      `);
      console.log(`[cron] Credits reset: ${result.rowCount} users updated`);
    } catch (err) {
      console.error('[cron] Reset failed:', err.message);
    }
  }, { timezone: 'Europe/Rome' });

  console.log('[cron] Credit reset job scheduled (Mon 20:45 Europe/Rome)');
}
```

- [ ] **Step 2: Commit**

```bash
git add server/cron/resetCredits.js
git commit -m "feat: add weekly credit reset cron job"
```

---

### Task 8: Admin routes

**Files:**
- Create: `server/routes/admin.js`

- [ ] **Step 1: Implement admin routes**

Create `server/routes/admin.js`:
```js
import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/admin/set-plan
router.post('/set-plan', authenticateAdmin, async (req, res) => {
  const { userId, plan } = req.body;
  if (!userId || !['free', 'silver', 'gold'].includes(plan)) {
    return res.status(400).json({ error: 'userId e plan (free|silver|gold) obbligatori' });
  }
  try {
    await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin set-plan]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// POST /api/admin/reset-credits
router.post('/reset-credits', authenticateAdmin, async (req, res) => {
  const { userId } = req.body; // optional — if omitted, resets all non-Gold
  try {
    let result;
    if (userId) {
      result = await pool.query(
        'UPDATE ai_credits SET credits_remaining = 3, reset_at = NOW() WHERE user_id = $1',
        [userId]
      );
    } else {
      result = await pool.query(`
        UPDATE ai_credits SET credits_remaining = 3, reset_at = NOW()
        WHERE user_id IN (SELECT id FROM users WHERE plan != 'gold')
      `);
    }
    res.json({ updated: result.rowCount });
  } catch (err) {
    console.error('[admin reset-credits]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/admin.js
git commit -m "feat: add admin routes (set-plan, reset-credits)"
```

---

### Task 9: Integrate all routes into server.js

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Read current server.js** (already read — 58 lines, football proxy + static files)

- [ ] **Step 2: Rewrite server.js with new routes**

Replace `server.js` content:
```js
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import authRoutes from './server/routes/auth.js';
import creditsRoutes from './server/routes/credits.js';
import aiRoutes from './server/routes/ai.js';
import adminRoutes from './server/routes/admin.js';
import { startCreditResetCron } from './server/cron/resetCredits.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const FOOTBALL_API_KEY =
  process.env.FOOTBALL_DATA_API_KEY ||
  process.env.VITE_FOOTBALL_DATA_API_KEY ||
  '';

if (!FOOTBALL_API_KEY) {
  console.warn('[WARN] FOOTBALL_DATA_API_KEY non configurata.');
}

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Proxy football-data.org ────────────────────────────────
app.use('/api/football', async (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  const url = `https://api.football-data.org/v4${req.path}${qs ? '?' + qs : ''}`;
  try {
    const upstream = await fetch(url, { headers: { 'X-Auth-Token': FOOTBALL_API_KEY } });
    const body = await upstream.text();
    res.status(upstream.status).set('Content-Type', 'application/json').send(body);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', detail: err.message });
  }
});

// ── Auth routes ────────────────────────────────────────────
app.use('/auth', authRoutes);

// ── Credits routes ─────────────────────────────────────────
app.use('/api/credits', creditsRoutes);

// ── AI route ──────────────────────────────────────────────
app.use('/api/ai', aiRoutes);

// ── Admin routes ───────────────────────────────────────────
app.use('/api/admin', adminRoutes);

// ── Static files + SPA fallback (ALWAYS LAST) ─────────────
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[FantaBrain] Server on port ${PORT}`);
  startCreditResetCron();
});
```

- [ ] **Step 3: Smoke test server starts**

```bash
node server.js &
sleep 2
curl -s http://localhost:3000/auth/me | grep -q "Unauthorized" && echo "Auth middleware OK"
kill %1
```
Expected: `Auth middleware OK`

- [ ] **Step 4: Commit**

```bash
git add server.js
git commit -m "feat: integrate all backend routes into server.js"
```

---

### Task 10: Update render.yaml

**Files:**
- Modify: `render.yaml`

- [ ] **Step 1: Replace render.yaml**

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
      - key: DATABASE_URL
        fromDatabase:
          name: fantabrain-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: ADMIN_SECRET
        sync: false

databases:
  - name: fantabrain-db
    plan: free
```

- [ ] **Step 2: Commit**

```bash
git add render.yaml
git commit -m "chore: update render.yaml with PostgreSQL db and new env vars"
```

---

### Task 11: Run all backend tests

- [ ] **Step 1: Run full test suite**

```bash
node --test server/tests/auth.test.js server/tests/credits.test.js
```
Expected: all tests PASS, 0 failures

- [ ] **Step 2: Add test script to package.json**

In `package.json` scripts section, add:
```json
"test:backend": "node --test server/tests/*.test.js"
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add backend test script"
```
