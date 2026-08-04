// =============================================================
// routes/entries.js — the user's own meal / exercise / activity logs.
// Mounted at /api/entries. Every route here uses requireAuth, and
// every query is filtered by req.user.id, which means a logged-in
// user can only ever see and delete their *own* entries.
// =============================================================

const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// The only three entry types allowed — must match the ENUM in schema.sql.
const VALID_TYPES = ['Meal', 'Exercise', 'Activity'];

// -------------------------------------------------------------
// GET /api/entries — all entries for the logged-in user.
// Powers the list and the totals on the Dashboard page.
// ORDER BY id DESC puts the newest entry first.
// -------------------------------------------------------------
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM entries WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch entries.' });
  }
});

// -------------------------------------------------------------
// POST /api/entries — add one entry for the logged-in user.
// Body: { type, name, value, unit } e.g. Meal / "Pasta" / 600 / kcal.
// Each field is validated before anything touches the database.
// -------------------------------------------------------------
router.post('/', requireAuth, async (req, res) => {
  const { type, name, value, unit } = req.body || {};

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'type must be Meal, Exercise or Activity.' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required.' });
  }
  if (!value || Number(value) <= 0) {
    return res.status(400).json({ error: 'value must be a positive number.' });
  }
  if (!unit) {
    return res.status(400).json({ error: 'unit is required.' });
  }

  try {
    // user_id comes from the verified token, NOT from the request body —
    // that is what stops someone logging entries onto another account.
    const [result] = await pool.query(
      'INSERT INTO entries (user_id, type, name, value, unit) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, name.trim(), Number(value), unit]
    );

    // Send the saved row back so the Dashboard can add it to the list
    // (with its new id) without re-fetching everything.
    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      type,
      name: name.trim(),
      value: Number(value),
      unit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save entry.' });
  }
});

// -------------------------------------------------------------
// DELETE /api/entries/:id — remove one entry.
// The ":id" part of the path arrives as req.params.id.
// -------------------------------------------------------------
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // "AND user_id = ?" is the important half: deleting someone else's
    // entry simply matches no rows instead of succeeding.
    const [result] = await pool.query(
      'DELETE FROM entries WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    // affectedRows === 0 means either the id does not exist or it is not theirs.
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete entry.' });
  }
});

module.exports = router;
