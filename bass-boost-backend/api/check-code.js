import { get } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';

const CODE_RE = /^(BAS|TRL)-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function makeHandler(kv) {
  return async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

    const { code } = req.query || {};
    if (!code || !CODE_RE.test(code)) {
      return res.status(400).json({ ok: false, reason: 'invalid_code' });
    }

    const result = await kv.get(`code:${code}`);
    if (!result.result) return res.status(200).json({ ok: true, found: false, paid: false });

    let data;
    try {
      data = JSON.parse(result.result);
    } catch {
      return res.status(500).json({ ok: false, reason: 'internal_error' });
    }

    return res.status(200).json({
      ok: true,
      found: true,
      paid: data.status === 'paid' || data.status === 'redeemed',
    });
  };
}

export default makeHandler({ get });
