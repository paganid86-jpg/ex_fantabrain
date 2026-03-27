import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FB-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET /api/waitlist/count
router.get('/count', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM waitlist');
    res.json({ count: parseInt(rows[0].count, 10) });
  } catch (err) {
    next(err);
  }
});

// POST /api/waitlist
router.post('/', async (req, res, next) => {
  const { name, email, lega, referral_code: usedCode } = req.body;

  if (!name || !email || !lega) {
    return res.status(400).json({ error: 'Nome, email e lega sono obbligatori.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida.' });
  }
  const leagueValues = ['classico', 'mantra', 'entrambi'];
  if (!leagueValues.includes(lega)) {
    return res.status(400).json({ error: 'Lega non valida.' });
  }

  try {
    // Generate unique referral code
    let myCode;
    let unique = false;
    while (!unique) {
      myCode = generateReferralCode();
      const { rows } = await pool.query('SELECT id FROM waitlist WHERE my_referral_code = $1', [myCode]);
      if (rows.length === 0) unique = true;
    }

    const { rows } = await pool.query(
      `INSERT INTO waitlist (name, email, lega, my_referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name.trim(), email.toLowerCase().trim(), lega, myCode, usedCode?.trim() || null]
    );

    const position = rows[0].id;
    res.status(201).json({ position, referral_code: myCode });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Questa email è già in lista. Controlla la tua casella!' });
    }
    next(err);
  }
});

export default router;
