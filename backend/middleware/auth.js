// =============================================================
// middleware/auth.js — the security gate in front of the routes.
// A "middleware" runs before the route handler: it either calls
// next() to let the request through, or replies with an error and
// stops it there.
// =============================================================

const jwt = require('jsonwebtoken');

// GATE 1 — "are you logged in?"
// Verifies the Authorization: Bearer <token> header and attaches the
// decoded user (id, username, role) to req.user, so every route below
// knows who is making the request without another database lookup.
const requireAuth = (req, res, next) => {
  // The frontend sends the header as: Authorization: Bearer eyJhbGci...
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }

  // Split "Bearer <token>" on the space and keep the token half.
  const token = header.split(' ')[1];
  try {
    // jwt.verify checks the signature against JWT_SECRET *and* the expiry
    // date. It throws if the token was tampered with or has expired.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // all good — continue to the actual route
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
};

// GATE 2 — "are you an admin?"
// Must be used after requireAuth (it relies on req.user being set).
// Blocks non-admins from the admin-only routes.
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
