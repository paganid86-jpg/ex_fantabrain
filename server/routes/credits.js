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
