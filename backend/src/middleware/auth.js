const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wfu-eats-dev-secret-change-in-prod';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, displayName: payload.displayName };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET);
      req.user = { id: payload.sub, email: payload.email, displayName: payload.displayName };
    } catch { /* ignore */ }
  }
  next();
}

module.exports = { authenticate, optionalAuth, JWT_SECRET };
