// In-memory KV stub — mirrors the lib/kv.js interface for testing

export function createKv() {
  const _store = new Map();

  return {
    _store,

    async get(key) {
      const val = _store.get(key);
      return { result: val !== undefined ? val : null };
    },

    async set(key, val, _ex) {
      _store.set(key, val);
      return { result: 'OK' };
    },

    // Returns { result: 'OK' } if key was set (didn't exist), { result: null } if key already existed.
    async setnx(key, val, _ex) {
      if (_store.has(key)) return { result: null };
      _store.set(key, val);
      return { result: 'OK' };
    },

    async del(key) {
      const existed = _store.has(key);
      _store.delete(key);
      return { result: existed ? 1 : 0 };
    },
  };
}
