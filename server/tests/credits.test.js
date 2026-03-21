import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canUseCredits } from '../routes/credits.js';

// Pure logic tests — no DB
describe('credits logic', () => {
  it('Gold users bypass credit check', () => {
    assert.ok(canUseCredits('gold', 0));
    assert.ok(canUseCredits('free', 1));
    assert.ok(!canUseCredits('free', 0));
    assert.ok(!canUseCredits('silver', 0));
  });

  it('credits never go below 0', () => {
    // Specifies the GREATEST(0, n-1) logic used in ai.js POST /api/ai/chat
    const decrement = (n) => Math.max(0, n - 1);
    assert.equal(decrement(1), 0);
    assert.equal(decrement(0), 0);
    assert.equal(decrement(3), 2);
  });
});
