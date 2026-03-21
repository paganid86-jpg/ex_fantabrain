import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure logic tests — no DB
describe('credits logic', () => {
  it('Gold users bypass credit check', () => {
    const canUse = (plan, credits) => plan === 'gold' || credits > 0;
    assert.ok(canUse('gold', 0));
    assert.ok(canUse('free', 1));
    assert.ok(!canUse('free', 0));
    assert.ok(!canUse('silver', 0));
  });

  it('credits never go below 0', () => {
    const decrement = (n) => Math.max(0, n - 1);
    assert.equal(decrement(1), 0);
    assert.equal(decrement(0), 0);
    assert.equal(decrement(3), 2);
  });
});
