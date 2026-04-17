// Upstash Redis REST client — no npm, pure fetch
const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(command) {
  const r = await fetch(`${BASE}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return r.json();
}

export const get = (key) => kv(['GET', key]);
export const set = (key, val, ex) =>
  ex ? kv(['SET', key, val, 'EX', String(ex)]) : kv(['SET', key, val]);
