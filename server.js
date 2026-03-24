import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import authRoutes from './server/routes/auth.js';
import creditsRoutes from './server/routes/credits.js';
import aiRoutes from './server/routes/ai.js';
import adminRoutes from './server/routes/admin.js';
import { startCreditResetCron } from './server/cron/resetCredits.js';
import { authenticateJWT } from './server/middleware/auth.js';

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
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Troppi tentativi, riprova tra 15 minuti' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.use(express.json());

// ── Proxy football-data.org ────────────────────────────────
app.use('/api/football', authenticateJWT, async (req, res) => {
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
