import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// POST /api/ai/chat
router.post('/chat', authenticateJWT, async (req, res, next) => {
  const { messages, systemPrompt, maxTokens = 600 } = req.body;
  const safeMaxTokens = Math.min(Number(maxTokens) || 600, 1000);
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array obbligatorio' });
  }

  try {
    // Read plan fresh from DB (not JWT) — this gate controls a paid API call.
    // A stale JWT plan would let a downgraded user make AI calls for up to 30 days.
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

    // Sanitize messages: solo ruoli validi, max 2000 char per messaggio, max 20 messaggi
    const sanitized = messages
      .filter(m => ['user', 'assistant'].includes(m.role))
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }))
      .slice(0, 20);

    // Call Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: safeMaxTokens,
      system: systemPrompt || 'Sei FantaBrain AI, assistente per il Fantacalcio Mantra italiano. Parla in italiano.',
      messages: sanitized,
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
    next(err);
  }
});

// POST /api/ai/groq — chiamate Groq server-side (schieramento, scouting, war room, ecc.)
router.post('/groq', authenticateJWT, async (req, res, next) => {
  const { systemPrompt, userMessage, maxTokens = 500 } = req.body;
  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage obbligatorio' });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY non configurata sul server' });
  }

  const safeMaxTokens = Math.min(Number(maxTokens) || 500, 1000);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: safeMaxTokens,
        messages: [
          { role: 'system', content: systemPrompt || 'Sei FantaBrain AI, assistente per il Fantacalcio Mantra italiano. Parla in italiano.' },
          { role: 'user', content: String(userMessage).slice(0, 4000) },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq errore ${response.status}: ${errText}`);
    }

    const data = await response.json();
    res.json({ content: data.choices[0].message.content });
  } catch (err) {
    next(err);
  }
});

export default router;
