import { randomFillSync } from 'node:crypto';
import { get, set } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';
import { isRateLimited } from '../lib/ratelimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    const ip = (req.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (await rateLimiter('start-trial', ip)) {
      return res.status(429).json({ ok: false, reason: 'rate_limited' });
    }

    const rawEmail = req.body?.email;
    const device_id = req.body?.device_id;

    if (!rawEmail || !device_id) {
      return res.status(400).json({ ok: false, reason: 'missing_fields' });
    }

    const email = String(rawEmail).trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, reason: 'invalid_email' });
    }
    if (typeof device_id !== 'string' || !DEVICE_ID_RE.test(device_id)) {
      return res.status(400).json({ ok: false, reason: 'invalid_device_id' });
    }

    // Idempotent: return existing trial if already started
    const existing = await kv.get(`trial:${email}`);
    if (existing.result) {
      let trial;
      try {
        trial = JSON.parse(existing.result);
      } catch {
        return res.status(500).json({ ok: false, reason: 'internal_error' });
      }
      return res.status(200).json({ ok: true, code: trial.code, trialEnd: trial.trialEnd });
    }

    const code = `TRL-${randomHex(4)}-${randomHex(4)}`;
    const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    await Promise.all([
      kv.set(`trial:${email}`, JSON.stringify({ code, device_id, trialEnd, createdAt: now })),
      kv.set(`code:${code}`, JSON.stringify({
        status: 'paid',
        device_id,
        source: 'trial',
        createdAt: now,
        paidAt: now,
      }), 2592000),
    ]);

    return res.status(200).json({ ok: true, code, trialEnd });
  };
}

export default makeHandler({ get, set });
