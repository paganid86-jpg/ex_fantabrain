import cron from 'node-cron';
import pool from '../db/pool.js';

export function startCreditResetCron() {
  // Every Monday at 20:45 Europe/Rome
  cron.schedule('45 20 * * 1', async () => {
    console.log('[cron] Checking if matchday is complete before resetting credits...');
    try {
      // Check for active matches in Serie A
      const apiKey = process.env.FOOTBALL_DATA_API_KEY;
      const response = await fetch(
        'https://api.football-data.org/v4/competitions/SA/matches?status=IN_PLAY,PAUSED',
        { headers: { 'X-Auth-Token': apiKey } }
      );
      const data = await response.json();
      const activeMatches = data.matches ?? [];

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
