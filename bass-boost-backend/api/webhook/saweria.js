import { get, set } from '../../lib/kv.js';
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifySignature(secret, payload, signature) {
  const hmac = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.SAWERIA_WEBHOOK_SECRET;
  if (!secret) return res.status(500).end(); // misconfigured — refuse to accept unauthenticated webhooks

  const signature = req.headers['saweria-callback-signature'];
  if (!signature) return res.status(400).end();

  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  if (!verifySignature(secret, raw, signature)) {
    // Always return 200 to avoid Saweria retries, but do nothing
    return res.status(200).end();
  }

  const body = typeof req.body === 'string'
    ? Object.fromEntries(new URLSearchParams(req.body))
    : req.body;

  const message = body?.message || body?.donation_message || body?.notes || body?.note || body?.comment || '';

  const match = message.match(/BAS-[A-Z0-9]{4}-[A-Z0-9]{4}/);
  if (match) {
    const code = match[0];
    const result = await get(`code:${code}`);
    if (result.result) {
      let data;
      try {
        data = JSON.parse(result.result);
      } catch {
        return res.status(200).end();
      }
      if (data.status === 'pending') {
        const updated = JSON.stringify({ ...data, status: 'paid', paidAt: new Date().toISOString() });
        await set(`code:${code}`, updated, 2592000);
      }
    }
  }

  return res.status(200).end();
}
