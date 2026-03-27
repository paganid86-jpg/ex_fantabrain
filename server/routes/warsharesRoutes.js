// server/routes/warsharesRoutes.js
import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// POST /api/ai/warroom-share — create shareable link (JWT required)
router.post('/', authenticateJWT, async (req, res, next) => {
  const { analysisText, matchContext } = req.body;

  if (!analysisText || typeof analysisText !== 'string' || !analysisText.trim()) {
    return res.status(400).json({ error: 'analysisText obbligatorio' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO warroom_shares (analysis_text, match_context)
       VALUES ($1, $2)
       RETURNING id, expires_at`,
      [analysisText.slice(0, 20000), matchContext ?? null]
    );

    const { id, expires_at } = result.rows[0];
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${baseUrl}/#/warroom/${id}`;

    res.status(201).json({ id, url, expiresAt: expires_at });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/warroom-share/:id — read shared analysis (no auth required)
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    return res.status(404).json({ error: 'Analisi non trovata' });
  }

  try {
    const result = await pool.query(
      'SELECT analysis_text, match_context, expires_at FROM warroom_shares WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analisi non trovata' });
    }

    const row = result.rows[0];
    if (new Date(row.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Link scaduto', expiresAt: row.expires_at });
    }

    res.json({
      analysisText: row.analysis_text,
      matchContext:  row.match_context,
      expiresAt:     row.expires_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
