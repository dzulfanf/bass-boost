import { set } from '../lib/kv.js';
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

  const { source = 'bassboost', device_id } = req.body || {};
  if (!device_id) return res.status(400).json({ ok: false, reason: 'missing_device_id' });

  const code = `BAS-${randomHex(4)}-${randomHex(4)}`;
  const data = JSON.stringify({
    status: 'pending',
    device_id,
    source,
    createdAt: new Date().toISOString(),
    paidAt: null,
  });

  await set(`code:${code}`, data, 2592000); // 30 days TTL

  return res.status(200).json({ ok: true, code });
}
