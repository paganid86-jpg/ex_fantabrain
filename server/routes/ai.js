import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../db/pool.js';
import { authenticateJWT } from '../middleware/auth.js';
import { sendMetric } from '../middleware/cloudwatch.js';
import {
  AI_ORBITAL_ACTION_COSTS,
  buildOrbitalActionRequest,
  parseOrbitalActionResponse,
} from '../lib/orbitalActions.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function getUserPlan(userId) {
  const userRow = await pool.query('SELECT plan FROM users WHERE id = $1', [userId]);
  return userRow.rows[0]?.plan || 'free';
}

async function assertAiCredits(userId, plan, cost = 1) {
  if (plan === 'gold') return;

  const credRow = await pool.query(
    'SELECT credits_remaining, reset_at FROM ai_credits WHERE user_id = $1',
    [userId]
  );
  const credits = credRow.rows[0];
  if (!credits || credits.credits_remaining < cost) {
    const error = new Error('NO_CREDITS');
    error.status = 402;
    error.resetAt = credits?.reset_at || null;
    throw error;
  }
}

async function decrementAiCredits(userId, plan, cost = 1) {
  if (plan === 'gold') return null;

  const updated = await pool.query(
    'UPDATE ai_credits SET credits_remaining = GREATEST(0, credits_remaining - $2) WHERE user_id = $1 RETURNING credits_remaining',
    [userId, cost]
  );
  return updated.rows[0]?.credits_remaining ?? 0;
}

async function callGroqChat({ systemPrompt, userMessage, maxTokens }) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    const error = new Error('GROQ_API_KEY non configurata sul server');
    error.status = 500;
    throw error;
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt || 'Sei FantaBrain AI, assistente per il Fantacalcio Mantra italiano. Parla in italiano.' },
        { role: 'user', content: String(userMessage).slice(0, 8000) },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq errore ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

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
    const plan = await getUserPlan(req.user.id);

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
    const apiStart = Date.now();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: safeMaxTokens,
      system: systemPrompt || 'Sei FantaBrain AI, assistente per il Fantacalcio Mantra italiano. Parla in italiano.',
      messages: sanitized,
    });
    const apiLatency = Date.now() - apiStart;

    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    const estimatedCost = (inputTokens * 0.000003) + (outputTokens * 0.000015);

    sendMetric('AnthropicAPILatency', apiLatency, 'Milliseconds');
    sendMetric('AnthropicAPICall', 1, 'Count');
    sendMetric('AnthropicEstimatedCostUSD', estimatedCost, 'None');

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

// POST /api/ai/orbital-action - azioni AI riusabili per Radial Orbital Timeline
router.post('/orbital-action', authenticateJWT, async (req, res, next) => {
  const { action, payload = {} } = req.body;

  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'action obbligatoria' });
  }

  let aiRequest;
  try {
    aiRequest = buildOrbitalActionRequest(action, payload);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const cost = AI_ORBITAL_ACTION_COSTS[action] || 1;

  try {
    const plan = await getUserPlan(req.user.id);
    await assertAiCredits(req.user.id, plan, cost);

    const apiStart = Date.now();
    const content = await callGroqChat({
      systemPrompt: aiRequest.systemPrompt,
      userMessage: aiRequest.userMessage,
      maxTokens: aiRequest.maxTokens,
    });
    const apiLatency = Date.now() - apiStart;

    sendMetric('GroqOrbitalActionLatency', apiLatency, 'Milliseconds');
    sendMetric('GroqOrbitalActionCall', 1, 'Count');

    const creditsRemaining = await decrementAiCredits(req.user.id, plan, cost);
    const parsed = parseOrbitalActionResponse(action, content);

    res.json({
      ...parsed,
      creditsRemaining,
      cost,
    });
  } catch (err) {
    if (err.status === 402) {
      return res.status(402).json({ error: 'NO_CREDITS', resetAt: err.resetAt || null, cost });
    }
    next(err);
  }
});

// POST /api/ai/groq - chiamate Groq server-side generiche
router.post('/groq', authenticateJWT, async (req, res, next) => {
  const { systemPrompt, userMessage, maxTokens = 500 } = req.body;
  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage obbligatorio' });
  }

  const safeMaxTokens = Math.min(Number(maxTokens) || 500, 1000);

  try {
    const content = await callGroqChat({
      systemPrompt,
      userMessage: String(userMessage).slice(0, 4000),
      maxTokens: safeMaxTokens,
    });
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

export default router;
