// =============================================================
// config/db.js — the single MySQL connection used by the whole API.
// Every route file imports this same pool, so the app opens a small
// set of reusable connections instead of one per request.
// =============================================================

// The /promise version lets us use async/await (await pool.query(...))
// instead of callback functions.
const mysql = require('mysql2/promise');

// Hosted MySQL providers (Aiven, Railway, PlanetScale, most cPanel hosts)
// require an encrypted connection and will refuse the handshake without
// one. A local MySQL install normally has no certificate at all, so this
// stays off unless DB_SSL=true is set in the environment.
//
// If your provider uses a self-signed certificate and the connection fails
// with a certificate error, set DB_SSL_REJECT_UNAUTHORIZED=false as well.
// That still encrypts the traffic, it just stops verifying who is on the
// other end — acceptable for a student project, not for real user data.
const ssl =
  process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined;

// A pool keeps up to `connectionLimit` open connections and hands a free
// one to each query. Credentials come from backend/.env.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl,
  waitForConnections: true, // queue queries instead of failing when all 10 are busy
  connectionLimit: 10,
});

module.exports = pool;
