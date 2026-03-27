import cron from 'node-cron';
import pool from '../db/pool.js';

// Statuses considered "in play" on API-Football
const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT']);

export function startCreditResetCron() {
  // Every Monday at 20:45 Europe/Rome
  cron.schedule('45 20 * * 1', async () => {
    console.log('[cron] Checking if matchday is complete before resetting credits...');
    try {
      const apiKey = process.env.RAPIDAPI_KEY;
      const apiHost = 'api-football-v1.p.rapidapi.com';

      if (!apiKey) {
        console.warn('[cron] RAPIDAPI_KEY not set — skipping credit reset to avoid unsafe state');
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      let response;
      try {
        // Fetch live Serie A fixtures (league 135, season 2025)
        response = await fetch(
          `https://${apiHost}/v3/fixtures?league=135&season=2025&live=all`,
          {
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': apiHost,
            },
            signal: controller.signal,
          }
        );
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        throw new Error(`API-Football returned ${response.status}`);
      }

      const data = await response.json();
      const fixtures = data.response ?? [];
      const activeMatches = fixtures.filter((f) =>
        LIVE_STATUSES.has(f.fixture?.status?.short)
      );

      if (activeMatches.length > 0) {
        console.log(`[cron] Reset skipped: ${activeMatches.length} matches still active`);
        return;
      }

      const result = await pool.query(`
        UPDATE ai_credits
        SET credits_remaining = 3, reset_at = NOW()
        WHERE user_id IN (SELECT id FROM users WHERE plan != 'gold')
      `);
      console.log(`[cron] Credits reset: ${result.rowCount} users updated`);
    } catch (err) {
      console.error('[cron] Reset failed:', err.message);
    }
  }, { timezone: 'Europe/Rome' });

  console.log('[cron] Credit reset job scheduled (Mon 20:45 Europe/Rome)');
}
