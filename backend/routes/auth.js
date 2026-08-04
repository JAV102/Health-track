// =============================================================
// routes/auth.js — account creation and login.
// Mounted at /api/auth, so the paths below become:
//   POST /api/auth/signup
//   POST /api/auth/login
// These are the only two routes with no login requirement — you
// obviously cannot be logged in yet when you are logging in.
// =============================================================

const express = require('express');
const bcrypt = require('bcryptjs');     // hashes passwords so we never store them as plain text
const jwt = require('jsonwebtoken');    // creates the login token the frontend keeps
const pool = require('../config/db');

const router = express.Router();

// -------------------------------------------------------------
// POST /api/auth/signup — create a new account.
// Steps: validate input → reject duplicate usernames → hash the
// password → insert the user → hand back a token so the new user
// is logged in immediately without a second request.
// -------------------------------------------------------------
router.post('/signup', async (req, res) => {
  const { username, password } = req.body || {};

  // Never trust the frontend's own validation — check again here.
  if (!username || !username.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Usernames must be unique (the database enforces it too, but this
    // gives the user a friendly message instead of a raw SQL error).
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    // Hash with 10 "salt rounds". The result is one-way: even we cannot
    // read the original password back out of the database.
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username.trim(), hashed, 'user'] // every signup is a normal 'user', never an admin
    );

    // result.insertId is the auto-increment id MySQL just assigned.
    const user = { id: result.insertId, username: username.trim(), role: 'user', calorie_goal: null };

    // The token is signed with JWT_SECRET and expires after 7 days.
    // The user object gets baked into it, which is how the frontend
    // knows who is logged in on later page loads.
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user }); // 201 = "created"
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating your account.' });
  }
});

// -------------------------------------------------------------
// POST /api/auth/login — check credentials and issue a token.
// Steps: find the user → compare the password against the stored
// hash → return the same {token, user} shape as signup.
// -------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      // Deliberately vague: saying "no such user" would let an attacker
      // discover which usernames exist on the site.
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const dbUser = rows[0];

    // bcrypt.compare re-hashes what was typed and checks it against the
    // stored hash — the plain password is never compared directly.
    const match = await bcrypt.compare(password, dbUser.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    // Build the public version of the user — note the password hash is
    // deliberately left out so it never reaches the browser.
    const user = {
      id: dbUser.id,
      username: dbUser.username,
      role: dbUser.role,               // 'user' or 'admin' — decides which pages they see
      calorie_goal: dbUser.calorie_goal,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong logging in.' });
  }
});

module.exports = router;