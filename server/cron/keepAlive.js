import cron from 'node-cron';
import { sendMetric } from '../middleware/cloudwatch.js';

export function startKeepAliveCron() {
  const appUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Every 14 minutes — prevents Render free tier sleep (15 min inactivity threshold)
  cron.schedule('*/14 * * * *', async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      let status;
      try {
        const res = await fetch(`${appUrl}/api/health`, { signal: controller.signal });
        status = res.status;
      } finally {
        clearTimeout(timeout);
      }
      await sendMetric('AppHeartbeat', 1, 'Count');
      console.log(`[KeepAlive] ${appUrl}/api/health → ${status}`);
    } catch (err) {
      console.error('[KeepAlive] Ping fallito:', err.message);
      await sendMetric('ErrorRate', 1, 'Count');
    }
  });

  console.log('[FantaBrain] Keep-alive cron avviato (ogni 14 min)');
}
