import { get, set } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';

function randomHex(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

  const { email, device_id } = req.body || {};
  if (!email || !device_id) return res.status(400).json({ ok: false, reason: 'missing_fields' });

  // Idempotent: return existing trial if already started
  const existing = await get(`trial:${email}`);
  if (existing.result) {
    const trial = JSON.parse(existing.result);
    return res.status(200).json({ ok: true, code: trial.code, trialEnd: trial.trialEnd });
  }

  const code = `TRL-${randomHex(4)}-${randomHex(4)}`;
  const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  await Promise.all([
    set(`trial:${email}`, JSON.stringify({ code, device_id, trialEnd, createdAt: now })),
    set(`code:${code}`, JSON.stringify({
      status: 'paid',
      device_id,
      source: 'trial',
      createdAt: now,
      paidAt: now,
    }), 2592000),
  ]);

  return res.status(200).json({ ok: true, code, trialEnd });
}
