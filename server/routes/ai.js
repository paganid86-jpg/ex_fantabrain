import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/chat
router.post('/chat', authenticateJWT, async (req, res) => {
  const { messages, systemPrompt, maxTokens = 600 } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array obbligatorio' });
  }

  try {
    // Check plan
    const userRow = await pool.query('SELECT plan FROM users WHERE id = $1', [req.user.id]);
    const plan = userRow.rows[0]?.plan || 'free';

    if (plan !== 'gold') {
      // Check credits
      const credRow = await pool.query(
        'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
        [req.user.id]
      );
      const credits = credRow.rows[0];
      if (!credits || credits.credits_remaining <= 0) {
        return res.status(402).json({
          error: 'NO_CREDITS',
          resetAt: credits?.reset_at || null,
        });
      }
    }

    // Call Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt || 'Sei FantaBrain AI, assistente per il Fantacalcio Mantra italiano. Parla in italiano.',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content = response.content[0]?.text || '';

    // Decrement credits for non-Gold users
    let creditsRemaining = null;
    if (plan !== 'gold') {
      const updated = await pool.query(
        'UPDATE ai_credits SET credits_remaining = GREATEST(0, credits_remaining - 1) WHERE user_id = $1 RETURNING credits_remaining',
        [req.user.id]
      );
      creditsRemaining = updated.rows[0]?.credits_remaining ?? 0;
    }

    res.json({ content, creditsRemaining });
  } catch (err) {
    console.error('[ai chat]', err);
    res.status(500).json({ error: 'Errore AI' });
  }
});

export default router;
