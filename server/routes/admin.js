import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();
const VALID_PLANS = ['free', 'silver', 'gold'];

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function validatePlanUpdateByEmail(body) {
  const email = normalizeEmail(body?.email);
  const plan = body?.plan;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail || !VALID_PLANS.includes(plan)) {
    return { ok: false, error: 'email valida e plan (free|silver|gold) obbligatori' };
  }

  return { ok: true, email, plan };
}

// POST /api/admin/set-plan
router.post('/set-plan', authenticateAdmin, async (req, res) => {
  const { userId, plan } = req.body;
  if (!Number.isInteger(userId) || userId <= 0 || !VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: 'userId (intero positivo) e plan (free|silver|gold) obbligatori' });
  }
  try {
    await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin set-plan]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// POST /api/admin/set-plan-by-email
router.post('/set-plan-by-email', authenticateAdmin, async (req, res) => {
  const validation = validatePlanUpdateByEmail(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE users SET plan = $1 WHERE LOWER(email) = $2 RETURNING id, email, plan',
      [validation.plan, validation.email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ ok: true, user });
  } catch (err) {
    console.error('[admin set-plan-by-email]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// POST /api/admin/reset-credits
router.post('/reset-credits', authenticateAdmin, async (req, res) => {
  const { userId } = req.body; // optional — if omitted, resets all non-Gold
  try {
    let result;
    if (userId !== undefined && userId !== null) {
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'userId deve essere un intero positivo' });
      }
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
