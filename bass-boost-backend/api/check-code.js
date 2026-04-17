import { get } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

  const { code } = req.query;
  if (!code) return res.status(400).json({ ok: false, reason: 'missing_code' });

  const result = await get(`code:${code}`);
  if (!result.result) return res.status(200).json({ ok: true, found: false, paid: false });

  const data = JSON.parse(result.result);
  return res.status(200).json({ ok: true, found: true, paid: data.status === 'paid' || data.status === 'redeemed', status: data.status });
}
