const crypto = require('node:crypto');

// A caller-supplied correlation id is echoed into every log line, so only
// accept short, plain identifiers and fall back to a generated UUID otherwise.
const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

const requestId = (req, res, next) => {
  const incoming = req.headers['x-request-id'];

  req.id = typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming)
    ? incoming
    : crypto.randomUUID();

  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = requestId;
