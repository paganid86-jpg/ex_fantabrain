import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_SECRET = 'test-admin';

// Minimal Express mock
function mockRes() {
  const res = { _status: null, _json: null };
  res.status = (n) => { res._status = n; return res; };
  res.json = (d) => { res._json = d; return res; };
  return res;
}

describe('authenticateJWT', async () => {
  const { authenticateJWT } = await import('../middleware/auth.js');

  it('calls next() with valid token', () => {
    const token = jwt.sign({ id: 1, email: 'a@b.com', plan: 'free' }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let called = false;
    authenticateJWT(req, res, () => { called = true; });
    assert.ok(called);
    assert.equal(req.user.id, 1);
  });

  it('returns 401 with no token', () => {
    const req = { headers: {} };
    const res = mockRes();
    let nextCalled = false;
    authenticateJWT(req, res, () => { nextCalled = true; });
    assert.equal(res._status, 401);
    assert.equal(res._json.error, 'Non autorizzato');
    assert.ok(!nextCalled);
  });

  it('returns 401 with invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = mockRes();
    let nextCalled = false;
    authenticateJWT(req, res, () => { nextCalled = true; });
    assert.equal(res._status, 401);
    assert.equal(res._json.error, 'Token non valido o scaduto');
    assert.ok(!nextCalled);
  });

  it('returns 401 with expired token', () => {
    const token = jwt.sign({ id: 1 }, 'test-secret', { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let nextCalled = false;
    authenticateJWT(req, res, () => { nextCalled = true; });
    assert.equal(res._status, 401);
    assert.equal(res._json.error, 'Token non valido o scaduto');
    assert.ok(!nextCalled);
  });
});

describe('authenticateAdmin', async () => {
  const { authenticateAdmin } = await import('../middleware/auth.js');

  it('calls next() with correct secret', () => {
    const req = { headers: { 'x-admin-secret': 'test-admin' } };
    const res = mockRes();
    let called = false;
    authenticateAdmin(req, res, () => { called = true; });
    assert.ok(called);
  });

  it('returns 403 with wrong secret', () => {
    const req = { headers: { 'x-admin-secret': 'wrong' } };
    const res = mockRes();
    let nextCalled = false;
    authenticateAdmin(req, res, () => { nextCalled = true; });
    assert.equal(res._status, 403);
    assert.equal(res._json.error, 'Accesso negato');
    assert.ok(!nextCalled);
  });

  it('returns 403 when ADMIN_SECRET is undefined', () => {
    const saved = process.env.ADMIN_SECRET;
    delete process.env.ADMIN_SECRET;
    const req = { headers: { 'x-admin-secret': '' } };
    const res = mockRes();
    let nextCalled = false;
    authenticateAdmin(req, res, () => { nextCalled = true; });
    assert.equal(res._status, 403);
    assert.equal(res._json.error, 'Accesso negato');
    assert.ok(!nextCalled);
    process.env.ADMIN_SECRET = saved;
  });
});
