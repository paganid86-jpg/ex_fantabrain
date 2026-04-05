process.stdout.setEncoding('utf8');

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CloudWatchClient, PutMetricDataCommand, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import dotenv from 'dotenv';

dotenv.config();

const cloudwatchClient = new CloudWatchClient({ region: process.env.AWS_REGION });

const server = new Server(
  { name: 'fantabrain-devops', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_app_health',
      description: 'Snapshot della salute attuale di FantaBrain (ultimi 30 min)',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'push_custom_metric',
      description: 'Invia una metrica custom a CloudWatch per FantaBrain',
      inputSchema: {
        type: 'object',
        properties: {
          metricName: { type: 'string', description: 'Nome della metrica' },
          value: { type: 'number', description: 'Valore numerico' },
          unit: { type: 'string', description: 'Count, Milliseconds, Percent...' }
        },
        required: ['metricName', 'value']
      }
    },
    {
      name: 'get_cost_estimate',
      description: 'Stima i costi Anthropic API delle ultime 24 ore',
      inputSchema: { type: 'object', properties: {} }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_app_health') {
    const endTime = new Date();
    const startTime = new Date(endTime - 30 * 60 * 1000);
    try {
      const command = new GetMetricStatisticsCommand({
        Namespace: 'FantaBrain/Production',
        MetricName: 'ErrorRate',
        StartTime: startTime,
        EndTime: endTime,
        Period: 300,
        Statistics: ['Average', 'Maximum']
      });
      const response = await cloudwatchClient.send(command);
      const datapoints = response.Datapoints || [];
      const status = datapoints.length === 0
        ? 'Nessun dato ancora — CloudWatch iniziera a ricevere dati quando il middleware e attivo'
        : JSON.stringify(datapoints, null, 2);
      return { content: [{ type: 'text', text: `Salute FantaBrain (ultimi 30 min):\n${status}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Errore CloudWatch: ${err.message}` }] };
    }
  }

  if (name === 'push_custom_metric') {
    try {
      const command = new PutMetricDataCommand({
        Namespace: 'FantaBrain/Production',
        MetricData: [{
          MetricName: args.metricName,
          Value: args.value,
          Unit: args.unit || 'Count',
          Timestamp: new Date()
        }]
      });
      await cloudwatchClient.send(command);
      return { content: [{ type: 'text', text: `Metrica inviata: ${args.metricName} = ${args.value}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Errore invio metrica: ${err.message}` }] };
    }
  }

  if (name === 'get_cost_estimate') {
    const endTime = new Date();
    const startTime = new Date(endTime - 24 * 60 * 60 * 1000);
    try {
      const command = new GetMetricStatisticsCommand({
        Namespace: 'FantaBrain/Production',
        MetricName: 'AnthropicEstimatedCostUSD',
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Sum']
      });
      const response = await cloudwatchClient.send(command);
      const total = response.Datapoints.reduce((sum, d) => sum + d.Sum, 0);
      return { content: [{ type: 'text', text: `Costo stimato Anthropic API (24h): $${total.toFixed(4)}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Errore lettura costi: ${err.message}` }] };
    }
  }

  throw new Error(`Tool sconosciuto: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('MCP FantaBrain DevOps Server avviato');
