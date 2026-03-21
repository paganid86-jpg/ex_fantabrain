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
