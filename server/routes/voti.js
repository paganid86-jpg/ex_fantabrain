import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = resolve(__dirname, '..', 'data');

// Whitelist season per prevenire path traversal
const VALID_SEASON_RE = /^[0-9]{4}-[0-9]{2}$/;

const router = express.Router();

router.get('/:season/matchday/:n', async (req, res) => {
  const { season, n } = req.params;

  if (!VALID_SEASON_RE.test(season)) {
    return res.status(400).json({ error: 'invalid season format' });
  }
  const matchday = Number(n);
  if (!Number.isInteger(matchday) || matchday < 1 || matchday > 100) {
    return res.status(400).json({ error: 'invalid matchday' });
  }

  const filePath = join(DATA_ROOT, `voti-${season}`, `matchday-${matchday}.json`);
  const resolved = resolve(filePath);
  if (!resolved.startsWith(DATA_ROOT)) {
    return res.status(400).json({ error: 'path escape' });
  }

  try {
    const content = await readFile(resolved, 'utf8');
    res.set('Cache-Control', 'public, max-age=86400, immutable');
    res.set('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'matchday not found' });
    }
    console.error('[voti] failed to read matchday file', err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
