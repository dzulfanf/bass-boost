import { get, set } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

  const { code, device_id } = req.body || {};
  if (!code || !device_id) return res.status(400).json({ ok: false, reason: 'missing_fields' });

  const result = await get(`code:${code}`);
  if (!result.result) return res.status(200).json({ ok: false, reason: 'not_found' });

  const data = JSON.parse(result.result);

  if (data.status === 'pending') return res.status(200).json({ ok: false, reason: 'not_paid' });

  const boundDevice = data.device_id && data.device_id !== 'anonymous' ? data.device_id : null;

  if (data.status === 'redeemed' && boundDevice && boundDevice !== device_id) {
    return res.status(200).json({ ok: false, reason: 'already_redeemed' });
  }

  if (boundDevice && boundDevice !== device_id) {
    return res.status(200).json({ ok: false, reason: 'device_mismatch' });
  }

  const updated = JSON.stringify({ ...data, status: 'redeemed', device_id });
  await set(`code:${code}`, updated, 2592000);

  return res.status(200).json({ ok: true });
}
