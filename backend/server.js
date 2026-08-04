// =============================================================
// server.js — entry point of the HealthTrack backend.
// Starts the Express server, applies the shared middleware, and
// mounts every route group under /api/*.
// =============================================================

// Loads the variables from backend/.env into process.env
// (DB credentials, JWT_SECRET, PORT, CORS_ORIGIN).
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// The four route files, one per feature area of the app.
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');

const app = express();

// CORS: the React frontend runs on a different port than this API, so the
// browser only allows the requests if we explicitly whitelist that origin.
// CORS_ORIGIN accepts one URL or several separated by commas; if it is not
// set at all we fall back to '*' (allow everyone) for easy local testing.
const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : '*';
app.use(cors({ origin: allowedOrigins }));

// Parses incoming JSON request bodies into req.body.
app.use(express.json());

// Health check — visiting the API root confirms the server is alive.
app.get('/', (req, res) => {
  res.json({ status: 'HealthTrack API is running' });
});

// Route groups: every path inside routes/auth.js is served under /api/auth, etc.
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);

// Fallback error handler — catches anything a route did not handle itself
// so the client always gets JSON back instead of an HTML crash page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

// Start listening. PORT comes from .env (5000 locally, set by the host in production).
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HealthTrack API listening on port ${PORT}`);
});