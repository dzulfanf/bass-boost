// Upstash Redis REST client — no npm, pure fetch
const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(command) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const r = await fetch(`${BASE}/${command.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: controller.signal,
    });
    if (!r.ok) throw new Error(`Upstash error: ${r.status}`);
    return r.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const get = (key) => kv(['GET', key]);

export const set = (key, val, ex) =>
  ex ? kv(['SET', key, val, 'EX', String(ex)]) : kv(['SET', key, val]);

// Atomic set-if-not-exists with TTL. Returns { result: 'OK' } if set, { result: null } if key exists.
export const setnx = (key, val, ex) =>
  kv(['SET', key, val, 'NX', 'EX', String(ex)]);

export const del = (key) => kv(['DEL', key]);
