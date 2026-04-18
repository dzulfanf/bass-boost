import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { makeReq, makeRes } from './helpers/mock-req-res.js';

describe('lib/cors', () => {
  let setCors;

  before(async () => {
    process.env.CORS_ORIGIN = 'https://bass-boost-landing.vercel.app,https://other-allowed.example.com';
    const mod = await import('../lib/cors.js');
    setCors = mod.setCors;
  });

  test('sets ACAO header for a listed origin', () => {
    const req = makeReq({ headers: { origin: 'https://bass-boost-landing.vercel.app' } });
    const res = makeRes();
    setCors(req, res);
    assert.equal(
      res._headers['Access-Control-Allow-Origin'],
      'https://bass-boost-landing.vercel.app'
    );
  });

  test('sets Vary: Origin when origin is allowed', () => {
    const req = makeReq({ headers: { origin: 'https://bass-boost-landing.vercel.app' } });
    const res = makeRes();
    setCors(req, res);
    assert.equal(res._headers['Vary'], 'Origin');
  });

  test('does NOT set ACAO for an unlisted origin', () => {
    const req = makeReq({ headers: { origin: 'https://evil.example.com' } });
    const res = makeRes();
    setCors(req, res);
    assert.equal(res._headers['Access-Control-Allow-Origin'], undefined);
  });

  test('never sets * as ACAO', () => {
    // Even when origin is absent
    const req = makeReq({ headers: {} });
    const res = makeRes();
    setCors(req, res);
    assert.notEqual(res._headers['Access-Control-Allow-Origin'], '*');
  });

  test('sets ACAO for second listed origin', () => {
    const req = makeReq({ headers: { origin: 'https://other-allowed.example.com' } });
    const res = makeRes();
    setCors(req, res);
    assert.equal(
      res._headers['Access-Control-Allow-Origin'],
      'https://other-allowed.example.com'
    );
  });
});
