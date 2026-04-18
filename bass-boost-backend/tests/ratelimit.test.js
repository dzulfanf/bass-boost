import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// We test rate limiting logic using an in-memory mock of the Upstash pipeline,
// by re-implementing the rate limiter with a mock store and verifying the logic.

function createMemoryRateLimiter(limits) {
  const store = new Map();

  return {
    _store: store,

    async isRateLimited(endpoint, ip) {
      const limit = limits[endpoint];
      if (!limit) return false;

      const key = `rl:${endpoint}:${ip}`;
      const current = store.get(key) || 0;
      const next = current + 1;
      store.set(key, next);
      return next > limit;
    },
  };
}

const LIMITS = {
  'generate-code': 10,
  'check-code':    60,
  'redeem-code':   5,
  'start-trial':   3,
};

describe('rate limiter logic', () => {
  test('allows requests under the limit', async () => {
    const rl = createMemoryRateLimiter(LIMITS);
    for (let i = 0; i < 5; i++) {
      const limited = await rl.isRateLimited('redeem-code', '1.2.3.4');
      assert.equal(limited, false, `Request ${i + 1} should not be rate limited`);
    }
  });

  test('blocks at limit + 1', async () => {
    const rl = createMemoryRateLimiter(LIMITS);
    // Exhaust the limit
    for (let i = 0; i < LIMITS['redeem-code']; i++) {
      await rl.isRateLimited('redeem-code', '5.5.5.5');
    }
    // Next request should be blocked
    const limited = await rl.isRateLimited('redeem-code', '5.5.5.5');
    assert.equal(limited, true, 'Request at limit+1 should be rate limited');
  });

  test('different IPs have independent counters', async () => {
    const rl = createMemoryRateLimiter(LIMITS);
    // Exhaust IP A
    for (let i = 0; i < LIMITS['start-trial']; i++) {
      await rl.isRateLimited('start-trial', '10.0.0.1');
    }
    // IP B should still be allowed
    const limited = await rl.isRateLimited('start-trial', '10.0.0.2');
    assert.equal(limited, false, 'Different IP should not be rate limited');
  });

  test('different endpoints have independent counters', async () => {
    const rl = createMemoryRateLimiter(LIMITS);
    // Exhaust generate-code for this IP
    for (let i = 0; i < LIMITS['generate-code']; i++) {
      await rl.isRateLimited('generate-code', '9.9.9.9');
    }
    // check-code should still be allowed for the same IP
    const limited = await rl.isRateLimited('check-code', '9.9.9.9');
    assert.equal(limited, false, 'Different endpoint should have its own counter');
  });

  test('unknown endpoint is never rate limited', async () => {
    const rl = createMemoryRateLimiter(LIMITS);
    for (let i = 0; i < 1000; i++) {
      const limited = await rl.isRateLimited('unknown-endpoint', '1.1.1.1');
      assert.equal(limited, false);
    }
  });
});
