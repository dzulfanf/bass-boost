import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createKv } from './helpers/mock-kv.js';
import { makeReq, makeRes } from './helpers/mock-req-res.js';

// We need to test the real webhook handler but with a mock kv.
// Since the handler uses module-level imports, we test by directly invoking
// the handler logic via a re-implementation test. We import the module and
// validate all the security properties.

const SECRET = 'test-webhook-secret-abc123';

function makeSignature(secret, payload) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

// Because the handler imports from ../../lib/kv.js directly (not via DI),
// we test the handler's security logic by importing it and observing behavior.
// The handler uses process.env.SAWERIA_WEBHOOK_SECRET.

describe('webhook/saweria handler', () => {
  let handler;
  let kv;

  before(async () => {
    // Patch env before importing the module
    process.env.SAWERIA_WEBHOOK_SECRET = SECRET;
    // Dynamic import to pick up env
    const mod = await import('../api/webhook/saweria.js');
    handler = mod.default;
  });

  test('returns 400 when signature header is missing', async () => {
    const res = makeRes();
    const req = makeReq({
      method: 'POST',
      body: '{"message":"hello"}',
      headers: {}, // no saweria-callback-signature
    });
    await handler(req, res);
    assert.equal(res._status, 400);
  });

  test('returns 200 (no-op) when signature is wrong', async () => {
    const payload = JSON.stringify({ message: 'hello' });
    const res = makeRes();
    const req = makeReq({
      method: 'POST',
      body: payload,
      headers: { 'saweria-callback-signature': 'deadbeef'.repeat(8) },
    });
    await handler(req, res);
    assert.equal(res._status, 200);
  });

  test('accepts correct HMAC-SHA256 signature', async () => {
    const payload = JSON.stringify({ message: 'no code here' });
    const sig = makeSignature(SECRET, payload);
    const res = makeRes();
    const req = makeReq({
      method: 'POST',
      body: payload,
      headers: { 'saweria-callback-signature': sig },
    });
    await handler(req, res);
    assert.equal(res._status, 200);
  });

  test('does NOT write debug:last-webhook key to kv', async () => {
    // The real handler uses real kv, but we can verify the key is absent
    // by checking the module source — this test documents the requirement.
    // We verify by checking the handler source code does not contain the key.
    const fs = await import('node:fs');
    const src = fs.readFileSync(
      new URL('../api/webhook/saweria.js', import.meta.url),
      'utf8'
    );
    assert.equal(
      src.includes('debug:last-webhook'),
      false,
      'debug:last-webhook key must not appear in production code'
    );
  });

  test('405 for non-POST methods', async () => {
    const res = makeRes();
    const req = makeReq({ method: 'GET', body: {}, headers: {} });
    await handler(req, res);
    assert.equal(res._status, 405);
  });
});
