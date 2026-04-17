import { get, set } from '../../lib/kv.js';
import { createHmac } from 'crypto';

function verifySignature(secret, payload, signature) {
  const hmac = createHmac('sha256', secret).update(payload).digest('hex');
  return hmac === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.SAWERIA_WEBHOOK_SECRET;
  const signature = req.headers['saweria-callback-signature'];

  if (secret && signature) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!verifySignature(secret, raw, signature)) {
      // Always return 200 to avoid Saweria retries, but do nothing
      return res.status(200).end();
    }
  }

  const body = typeof req.body === 'string' ? Object.fromEntries(new URLSearchParams(req.body)) : req.body;

  // Debug: log raw payload to Redis (remove after debugging)
  await set('debug:last-webhook', JSON.stringify({ headers: req.headers, body }), 3600);

  const message = body?.message || body?.donation_message || body?.notes || body?.note || body?.comment || '';

  const match = message.match(/BAS-[A-Z0-9]{4}-[A-Z0-9]{4}/);
  if (match) {
    const code = match[0];
    const result = await get(`code:${code}`);
    if (result.result) {
      const data = JSON.parse(result.result);
      if (data.status === 'pending') {
        const updated = JSON.stringify({ ...data, status: 'paid', paidAt: new Date().toISOString() });
        await set(`code:${code}`, updated, 2592000);
      }
    }
  }

  return res.status(200).end();
}
