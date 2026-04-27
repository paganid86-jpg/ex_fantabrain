import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, validatePlanUpdateByEmail } from '../routes/admin.js';

describe('admin plan-by-email helpers', () => {
  it('normalizes email before DB lookup', () => {
    assert.equal(normalizeEmail('  AndreaMontini05@Hotmail.com  '), 'andreamontini05@hotmail.com');
  });

  it('accepts valid email and plan payloads', () => {
    assert.deepEqual(
      validatePlanUpdateByEmail({ email: 'paganid86@gmail.com', plan: 'gold' }),
      { ok: true, email: 'paganid86@gmail.com', plan: 'gold' }
    );
  });

  it('rejects invalid email values', () => {
    assert.deepEqual(
      validatePlanUpdateByEmail({ email: '', plan: 'gold' }),
      { ok: false, error: 'email valida e plan (free|silver|gold) obbligatori' }
    );
  });

  it('rejects unsupported plans', () => {
    assert.deepEqual(
      validatePlanUpdateByEmail({ email: 'andreamontini05@hotmail.com', plan: 'platinum' }),
      { ok: false, error: 'email valida e plan (free|silver|gold) obbligatori' }
    );
  });
});

