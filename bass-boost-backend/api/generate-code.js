import { randomFillSync } from 'node:crypto';
import { set } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';
import { isRateLimited } from '../lib/ratelimit.js';

const DEVICE_ID_RE = /^[a-zA-Z0-9\-]{8,128}$/;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomHex(len) {
  const buf = new Uint8Array(len);
  randomFillSync(buf);
  let s = '';
  for (let i = 0; i < len; i++) s += CHARS[buf[i] % CHARS.length];
  return s;
}

export function makeHandler(kv, rateLimiter = isRateLimited) {
  return async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (await rateLimiter('generate-code', ip)) {
      return res.status(429).json({ ok: false, reason: 'rate_limited' });
    }

    const { source = 'bassboost', device_id } = req.body || {};
    if (!device_id || typeof device_id !== 'string' || !DEVICE_ID_RE.test(device_id)) {
      return res.status(400).json({ ok: false, reason: 'invalid_device_id' });
    }

    const code = `BAS-${randomHex(4)}-${randomHex(4)}`;
    const data = JSON.stringify({
      status: 'pending',
      device_id,
      source,
      createdAt: new Date().toISOString(),
      paidAt: null,
    });

    await kv.set(`code:${code}`, data, 2592000); // 30 days TTL

    return res.status(200).json({ ok: true, code });
  };
}

export default makeHandler({ set });
