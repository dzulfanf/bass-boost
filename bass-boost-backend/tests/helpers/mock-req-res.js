// Minimal req/res stubs for unit-testing Vercel-style serverless handlers

export function makeReq({ method = 'GET', body = {}, query = {}, headers = {} } = {}) {
  return { method, body, query, headers };
}

export function makeRes() {
  const res = {
    _status: 200,
    _body: null,
    _headers: {},

    status(code) {
      this._status = code;
      return this;
    },

    json(body) {
      this._body = body;
      return this;
    },

    setHeader(key, value) {
      this._headers[key] = value;
      return this;
    },

    end() {
      return this;
    },
  };
  return res;
}
