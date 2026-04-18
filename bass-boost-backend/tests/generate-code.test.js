import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { randomFillSync } from 'node:crypto';
import { makeHandler } from '../api/generate-code.js';
import { createKv } from './helpers/mock-kv.js';
import { makeReq, makeRes } from './helpers/mock-req-res.js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const noRateLimit = async () => false;

describe('randomHex via randomFillSync', () => {
  test('produces only uppercase alphanumeric characters', () => {
    const buf = new Uint8Array(1000);
    randomFillSync(buf);
    for (let i = 0; i < 1000; i++) {
      const ch = CHARS[buf[i] % CHARS.length];
      assert.match(ch, /^[A-Z0-9]$/);
    }
  });

  test('no collisions in 1000 4-char samples', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) {
      const buf = new Uint8Array(4);
      randomFillSync(buf);
      let s = '';
      for (let j = 0; j < 4; j++) s += CHARS[buf[j] % CHARS.length];
      seen.add(s);
    }
    // With 36^4 = ~1.7M possibilities, 1000 samples should be highly unique
    assert.ok(seen.size > 900, `Too many collisions: only ${seen.size} unique values`);
  });
});

describe('generate-code handler', () => {
  test('rejects missing device_id', async () => {
    const kv = createKv();
    const handler = makeHandler(kv, noRateLimit);
    const req = makeReq({ method: 'POST', body: { source: 'test' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.ok, false);
    assert.equal(res._body.reason, 'invalid_device_id');
  });

  test('rejects device_id that is too short', async () => {
    const kv = createKv();
    const handler = makeHandler(kv, noRateLimit);
    const req = makeReq({ method: 'POST', body: { device_id: 'short' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_device_id');
  });

  test('rejects device_id with invalid characters', async () => {
    const kv = createKv();
    const handler = makeHandler(kv, noRateLimit);
    const req = makeReq({ method: 'POST', body: { device_id: 'invalid device id!' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_device_id');
  });

  test('returns a valid BAS-XXXX-XXXX code', async () => {
    const kv = createKv();
    const handler = makeHandler(kv, noRateLimit);
    const req = makeReq({ method: 'POST', body: { device_id: 'valid-device-id-12345' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.ok, true);
    assert.match(res._body.code, /^BAS-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  test('stores pending status in kv', async () => {
    const kv = createKv();
    const handler = makeHandler(kv, noRateLimit);
    const deviceId = 'test-device-uuid-9876';
    const req = makeReq({ method: 'POST', body: { device_id: deviceId } });
    const res = makeRes();
    await handler(req, res);
    const code = res._body.code;
    const stored = kv._store.get(`code:${code}`);
    assert.ok(stored, 'Expected code to be stored in kv');
    const data = JSON.parse(stored);
    assert.equal(data.status, 'pending');
    assert.equal(data.device_id, deviceId);
  });
});
