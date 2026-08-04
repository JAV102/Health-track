// =============================================================
// routes/users.js — everything the Admin Panel needs.
// Mounted at /api/users. Every route is protected by TWO gates:
// requireAuth (must be logged in) then requireAdmin (must be an
// admin), so a normal user gets 403 Forbidden even if they call
// these URLs directly.
// =============================================================

const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// -------------------------------------------------------------
// GET /api/users — the list of regular users shown in the Admin Panel.
// Admins are excluded (WHERE role = 'user') and the password column is
// deliberately never selected.
// -------------------------------------------------------------
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, calorie_goal FROM users WHERE role = 'user' ORDER BY username"
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch users.' });
  }
});

// -------------------------------------------------------------
// GET /api/users/:id/entries — one user's logs, for the admin.
// Same data as /api/entries, but for whichever user the admin
// expanded in the panel rather than for themselves.
// -------------------------------------------------------------
router.get('/:id/entries', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [entries] = await pool.query(
      'SELECT * FROM entries WHERE user_id = ? ORDER BY id DESC',
      [req.params.id]
    );
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch entries.' });
  }
});

// -------------------------------------------------------------
// PATCH /api/users/:id/goal — set that user's daily calorie target.
// PATCH (rather than PUT) because it updates one field, not the whole row.
// The value then shows up on that user's Dashboard as their goal bar.
// -------------------------------------------------------------
router.patch('/:id/goal', requireAuth, requireAdmin, async (req, res) => {
  const { calorieGoal } = req.body || {};
  if (!calorieGoal || Number(calorieGoal) <= 0) {
    return res.status(400).json({ error: 'A valid calorieGoal is required.' });
  }

  try {
    const [result] = await pool.query('UPDATE users SET calorie_goal = ? WHERE id = ?', [
      Number(calorieGoal),
      req.params.id,
    ]);

    // Nothing updated means there is no user with that id.
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ updated: true, calorieGoal: Number(calorieGoal) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update calorie goal.' });
  }
});

// -------------------------------------------------------------
// GET /api/users/:id/notes — the admin's saved comments about a user.
// -------------------------------------------------------------
router.get('/:id/notes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [notes] = await pool.query(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC',
      [req.params.id]
    );
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch notes.' });
  }
});

// -------------------------------------------------------------
// POST /api/users/:id/notes — write a new note about a user.
// :id is who the note is *about*; the author is taken from the
// admin's own token so it cannot be faked.
// -------------------------------------------------------------
router.post('/:id/notes', requireAuth, requireAdmin, async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text is required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO notes (user_id, author, text) VALUES (?, ?, ?)',
      [req.params.id, req.user.username, text.trim()]
    );
    res.status(201).json({
      id: result.insertId,
      author: req.user.username,
      text: text.trim(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add note.' });
  }
});

module.exports = router;