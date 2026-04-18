import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeHandler } from '../api/redeem-code.js';
import { createKv } from './helpers/mock-kv.js';
import { makeReq, makeRes } from './helpers/mock-req-res.js';

const VALID_CODE   = 'BAS-ABCD-1234';
const VALID_DEVICE = 'device-uuid-abcdefgh';

function pendingCode(deviceId = VALID_DEVICE) {
  return JSON.stringify({ status: 'pending', device_id: deviceId });
}
function paidCode(deviceId = VALID_DEVICE) {
  return JSON.stringify({ status: 'paid', device_id: deviceId });
}
function redeemedCode(deviceId = VALID_DEVICE) {
  return JSON.stringify({ status: 'redeemed', device_id: deviceId });
}

describe('redeem-code handler', () => {
  test('returns not_paid for pending code', async () => {
    const kv = createKv();
    await kv.set(`code:${VALID_CODE}`, pendingCode());
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._body.ok, false);
    assert.equal(res._body.reason, 'not_paid');
  });

  test('returns already_redeemed when device does not match', async () => {
    const kv = createKv();
    await kv.set(`code:${VALID_CODE}`, redeemedCode('other-device-uuid-9999'));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._body.ok, false);
    assert.equal(res._body.reason, 'already_redeemed');
  });

  test('succeeds for paid code with matching device', async () => {
    const kv = createKv();
    await kv.set(`code:${VALID_CODE}`, paidCode(VALID_DEVICE));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._body.ok, true);
  });

  test('concurrent lock: second request returns 409', async () => {
    const kv = createKv();
    await kv.set(`code:${VALID_CODE}`, paidCode(VALID_DEVICE));
    // Pre-acquire the lock to simulate concurrent request
    await kv.setnx(`lock:redeem:${VALID_CODE}`, '1', 30);

    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 409);
    assert.equal(res._body.reason, 'conflict');
  });

  test('lock is released after successful redemption', async () => {
    const kv = createKv();
    await kv.set(`code:${VALID_CODE}`, paidCode(VALID_DEVICE));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(kv._store.has(`lock:redeem:${VALID_CODE}`), false, 'Lock should be released');
  });

  test('returns 500 on malformed JSON in kv', async () => {
    const kv = createKv();
    await kv.set(`code:${VALID_CODE}`, 'not-valid-json{{{');
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 500);
    assert.equal(res._body.reason, 'internal_error');
  });

  test('rejects invalid code format', async () => {
    const kv = createKv();
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: 'BADCODE', device_id: VALID_DEVICE } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_code');
  });

  test('rejects invalid device_id', async () => {
    const kv = createKv();
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'POST', body: { code: VALID_CODE, device_id: 'bad!' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_device_id');
  });
});
