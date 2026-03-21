import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Pure helper: gold users bypass credit gate; free/silver require credits > 0.
// Tradeoff: plan is read from the JWT payload (set at login via jwt.sign({ id, email, plan }, ...)).
// JWT tokens are valid for up to 30 days, so plan changes made via the admin API
// will not take effect for a given user until their next login.
export function canUseCredits(plan, credits) {
  return plan === 'gold' || credits > 0;
}

// GET /api/credits
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
      [req.user.id]
    );
    const row = rows[0] || { credits_remaining: 3, reset_at: null };
    // req.user.plan comes from the JWT payload — no extra DB query needed.
    const plan = req.user.plan || 'free';
    res.json({
      remaining: row.credits_remaining,
      resetAt: row.reset_at,
      plan,
    });
  } catch (err) {
    console.error('[credits GET]', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
