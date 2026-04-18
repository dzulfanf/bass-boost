// Redis-backed rate limiter via Upstash pipeline — no npm
const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const LIMITS = {
  'generate-code': 10,
  'check-code':    60,
  'redeem-code':   5,
  'start-trial':   3,
};

// Returns true if the request should be blocked (rate limited).
// Fails open (returns false) on any Redis/network error.
export async function isRateLimited(endpoint, ip) {
  const limit = LIMITS[endpoint];
  if (!limit) return false;

  const key = `rl:${endpoint}:${ip}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const r = await fetch(`${BASE}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, 60, 'NX'],
      ]),
      signal: controller.signal,
    });
    if (!r.ok) return false;
    const results = await r.json();
    const count = results?.[0]?.result;
    return typeof count === 'number' && count > limit;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
