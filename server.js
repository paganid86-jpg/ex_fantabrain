// server.js — Express proxy server per produzione
// Risolve il CORS: le chiamate a football-data.org passano dal server,
// che aggiunge l'API key nell'header X-Auth-Token.
// Serve anche il build React statico e gestisce il fallback SPA.

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Legge la chiave da variabile d'ambiente server-side (senza prefisso VITE_)
const FOOTBALL_API_KEY =
  process.env.FOOTBALL_DATA_API_KEY ||
  process.env.VITE_FOOTBALL_DATA_API_KEY ||
  '';

if (!FOOTBALL_API_KEY) {
  console.warn(
    '[WARN] FOOTBALL_DATA_API_KEY non configurata. I dati Serie A non saranno disponibili.'
  );
}

// === Proxy /api/football/* → https://api.football-data.org/v4/* ===
app.use('/api/football', async (req, res) => {
  const path = req.path; // es. /competitions/SA/standings
  const qs = new URLSearchParams(req.query).toString();
  const url = `https://api.football-data.org/v4${path}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'X-Auth-Token': FOOTBALL_API_KEY },
    });

    const body = await upstream.text();
    res
      .status(upstream.status)
      .set('Content-Type', 'application/json')
      .send(body);
  } catch (err) {
    console.error('[Proxy Error]', err.message);
    res.status(502).json({ error: 'Proxy error', detail: err.message });
  }
});

// === File statici del build React ===
app.use(express.static(join(__dirname, 'dist')));

// === Fallback SPA: tutte le altre rotte restituiscono index.html ===
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[FantaBrain] Server in ascolto su porta ${PORT}`);
});
