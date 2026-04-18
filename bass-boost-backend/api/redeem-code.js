import { get, set, setnx, del } from '../lib/kv.js';
import { handleCors } from '../lib/cors.js';

const CODE_RE = /^(BAS|TRL)-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const DEVICE_ID_RE = /^[a-zA-Z0-9\-]{8,128}$/;

export function makeHandler(kv) {
  return async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

    const { code, device_id } = req.body || {};
    if (!code || !CODE_RE.test(code)) {
      return res.status(400).json({ ok: false, reason: 'invalid_code' });
    }
    if (!device_id || typeof device_id !== 'string' || !DEVICE_ID_RE.test(device_id)) {
      return res.status(400).json({ ok: false, reason: 'invalid_device_id' });
    }

    const result = await kv.get(`code:${code}`);
    if (!result.result) return res.status(200).json({ ok: false, reason: 'not_found' });

    let data;
    try {
      data = JSON.parse(result.result);
    } catch {
      return res.status(500).json({ ok: false, reason: 'internal_error' });
    }

    if (data.status === 'pending') return res.status(200).json({ ok: false, reason: 'not_paid' });

    const boundDevice = data.device_id && data.device_id !== 'anonymous' ? data.device_id : null;
    if (data.status === 'redeemed' && boundDevice && boundDevice !== device_id) {
      return res.status(200).json({ ok: false, reason: 'already_redeemed' });
    }
    if (boundDevice && boundDevice !== device_id) {
      return res.status(200).json({ ok: false, reason: 'device_mismatch' });
    }

    // Acquire atomic lock to prevent concurrent redemptions of the same code
    const lockKey = `lock:redeem:${code}`;
    const locked = await kv.setnx(lockKey, '1', 30);
    if (!locked.result) return res.status(409).json({ ok: false, reason: 'conflict' });

    try {
      // Re-read under lock to guard against races
      const fresh = await kv.get(`code:${code}`);
      if (!fresh.result) return res.status(200).json({ ok: false, reason: 'not_found' });

      let freshData;
      try {
        freshData = JSON.parse(fresh.result);
      } catch {
        return res.status(500).json({ ok: false, reason: 'internal_error' });
      }

      if (freshData.status === 'redeemed' && freshData.device_id !== device_id) {
        return res.status(200).json({ ok: false, reason: 'already_redeemed' });
      }

      const updated = JSON.stringify({ ...freshData, status: 'redeemed', device_id });
      await kv.set(`code:${code}`, updated, 2592000);

      return res.status(200).json({ ok: true });
    } finally {
      await kv.del(lockKey).catch(() => {});
    }
  };
}

export default makeHandler({ get, set, setnx, del });
