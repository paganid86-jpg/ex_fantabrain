import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';

async function startTestServer() {
  const { default: votiRouter } = await import('../routes/voti.js');
  const app = express();
  app.use('/api/voti', votiRouter);
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port, close: () => new Promise((res) => server.close(res)) });
    });
  });
}

async function getJson(port, path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    }).on('error', reject);
  });
}

describe('GET /api/voti/:season/matchday/:n', () => {
  it('200 con la fixture matchday-1', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/2025-26/matchday/1');
    assert.equal(r.status, 200);
    assert.equal(r.body.season, '2025-26');
    assert.equal(r.body.matchday, 1);
    assert.ok(r.body.players);
    await close();
  });

  it('404 se la giornata non esiste', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/2025-26/matchday/99');
    assert.equal(r.status, 404);
    await close();
  });

  it('400 se :n non è un numero', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/2025-26/matchday/abc');
    assert.equal(r.status, 400);
    await close();
  });

  it('400 se :season ha caratteri non sicuri (path traversal)', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/..%2Fetc/matchday/1');
    assert.ok(r.status === 400 || r.status === 404);
    await close();
  });
});
