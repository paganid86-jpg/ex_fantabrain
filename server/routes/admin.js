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
