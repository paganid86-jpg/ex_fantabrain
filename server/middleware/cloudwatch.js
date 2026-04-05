import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const client = new CloudWatchClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const NAMESPACE = 'FantaBrain/Production';

export async function sendMetric(metricName, value, unit = 'Count') {
  try {
    await client.send(new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
      }],
    }));
  } catch (err) {
    console.error('[CloudWatch] sendMetric error:', err.message);
  }
}

export function cloudwatchMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const status = res.statusCode;

    sendMetric('ResponseTime', elapsed, 'Milliseconds');

    if (status >= 500) {
      sendMetric('ErrorRate', 1, 'Count');
    } else if (status < 400) {
      sendMetric('SuccessRate', 1, 'Count');
    }
  });

  next();
}
