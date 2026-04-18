import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeHandler } from '../api/check-code.js';
import { createKv } from './helpers/mock-kv.js';
import { makeReq, makeRes } from './helpers/mock-req-res.js';

describe('check-code handler', () => {
  test('rejects missing code', async () => {
    const kv = createKv();
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: {} });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_code');
  });

  test('rejects invalid code format', async () => {
    const kv = createKv();
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'NOTACODE' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_code');
  });

  test('rejects code with wrong prefix', async () => {
    const kv = createKv();
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'XXX-ABCD-1234' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 400);
    assert.equal(res._body.reason, 'invalid_code');
  });

  test('returns found:false for unknown code', async () => {
    const kv = createKv();
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'BAS-AAAA-BBBB' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.ok, true);
    assert.equal(res._body.found, false);
    assert.equal(res._body.paid, false);
  });

  test('returns paid:false for pending code', async () => {
    const kv = createKv();
    await kv.set('code:BAS-PEND-INGX', JSON.stringify({ status: 'pending' }));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'BAS-PEND-INGX' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._body.found, true);
    assert.equal(res._body.paid, false);
  });

  test('returns paid:true for paid status', async () => {
    const kv = createKv();
    await kv.set('code:BAS-PAID-DONE', JSON.stringify({ status: 'paid' }));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'BAS-PAID-DONE' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._body.paid, true);
  });

  test('returns paid:true for redeemed status', async () => {
    const kv = createKv();
    await kv.set('code:TRL-REMD-DONE', JSON.stringify({ status: 'redeemed' }));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'TRL-REMD-DONE' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal(res._body.paid, true);
  });

  test('does not include status field in response', async () => {
    const kv = createKv();
    await kv.set('code:BAS-STAT-LESS', JSON.stringify({ status: 'paid' }));
    const handler = makeHandler(kv);
    const req = makeReq({ method: 'GET', query: { code: 'BAS-STAT-LESS' } });
    const res = makeRes();
    await handler(req, res);
    assert.equal('status' in res._body, false, 'Response must not expose status field');
  });
});
