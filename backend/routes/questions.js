// =============================================================
// routes/questions.js — the Q&A thread between users and the admin.
// Mounted at /api/questions. A user asks from the Contact page, the
// admin answers from the Admin Panel, and the answer appears back on
// the asker's Contact page.
// Note the two different protection levels below: admin routes see
// every question, user routes only ever see their own.
// =============================================================

const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// -------------------------------------------------------------
// GET /api/questions — every question from every user (admin only).
// This is the inbox at the top of the Admin Panel.
// -------------------------------------------------------------
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch questions.' });
  }
});

// -------------------------------------------------------------
// GET /api/questions/mine — only the questions I asked, plus their
// answers. Shown under the form on the Contact page.
// This route must be declared before any '/:id' route, otherwise
// Express would read "mine" as an id.
// -------------------------------------------------------------
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM questions WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch your questions.' });
  }
});

// -------------------------------------------------------------
// POST /api/questions — submit a question from the Contact page.
// The username is stored alongside user_id so the admin can show who
// asked without an extra JOIN. answer stays NULL until an admin replies.
// -------------------------------------------------------------
router.post('/', requireAuth, async (req, res) => {
  const { question } = req.body || {};
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'A question is required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO questions (user_id, username, question) VALUES (?, ?, ?)',
      [req.user.id, req.user.username, question.trim()]
    );
    res.status(201).json({
      id: result.insertId,
      username: req.user.username,
      question: question.trim(),
      answer: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit question.' });
  }
});

// -------------------------------------------------------------
// PATCH /api/questions/:id/answer — the admin replies to a question.
// Fills in the answer + answered_by columns on the existing row; the
// asker then sees it the next time their Contact page loads.
// -------------------------------------------------------------
router.patch('/:id/answer', requireAuth, requireAdmin, async (req, res) => {
  const { answer } = req.body || {};
  if (!answer || !answer.trim()) {
    return res.status(400).json({ error: 'An answer is required.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE questions SET answer = ?, answered_by = ? WHERE id = ?',
      [answer.trim(), req.user.username, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save answer.' });
  }
});

module.exports = router;