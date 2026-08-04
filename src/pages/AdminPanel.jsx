// =============================================================
// pages/AdminPanel.jsx — the admin-only control screen.
// Two sections:
//   1. Questions inbox — read and answer questions from the Contact page
//   2. User list — expand any user to see their totals and entries,
//      set their daily calorie goal, and write notes about them
//
// Every API call here is admin-protected on the backend, so a normal
// user reaching this page would only get "Admin access required." errors.
//
// Props: user — the logged-in admin (only used to greet them by name).
// =============================================================

import { useState, useEffect } from 'react';
import {
  getAllUsers,
  getUserEntries,
  setUserGoal,
  getUserNotes,
  addUserNote,
  getAllQuestions,
  answerQuestion,
} from '../utils/auth';
import '../styles/Admin.css';

// Adds up one user's entries into { calories, minutes, steps }.
// Same logic as the Dashboard totals, but here it runs per user.
const summarize = (entries) =>
  entries.reduce(
    (acc, entry) => {
      if (entry.type === 'Meal') acc.calories += entry.value;
      if (entry.type === 'Exercise') acc.minutes += entry.value;
      if (entry.type === 'Activity') acc.steps += entry.value;
      return acc;
    },
    { calories: 0, minutes: 0, steps: 0 }
  );

const AdminPanel = ({ user }) => {
  const [users, setUsers] = useState([]);          // the list of regular users
  const [questions, setQuestions] = useState([]);  // every submitted question
  const [expanded, setExpanded] = useState(null);  // id of the open user card (null = all closed)
  const [details, setDetails] = useState({}); // { [userId]: { entries, notes } }

  // The three "drafts" objects hold what the admin is currently typing.
  // Because the page shows many users at once, each one is keyed by id —
  // e.g. goalDrafts[3] is the goal being typed for user 3 — so typing in
  // one card never affects another.
  const [goalDrafts, setGoalDrafts] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [error, setError] = useState('');

  // Small reusable loaders, called on mount and again after any change
  // that makes the current data stale.
  const loadUsers = () => getAllUsers().then(setUsers).catch((err) => setError(err.message));
  const loadQuestions = () =>
    getAllQuestions().then(setQuestions).catch((err) => setError(err.message));

  // Load both lists once when the panel opens.
  useEffect(() => {
    loadUsers();
    loadQuestions();
  }, []);

  // Opens or closes a user's card. Their entries and notes are fetched
  // lazily — only the first time the card is opened — so the page does
  // not download everyone's data up front.
  const toggleExpand = async (u) => {
    if (expanded === u.id) {
      setExpanded(null); // clicking the open card closes it
      return;
    }
    setExpanded(u.id);

    if (!details[u.id]) { // not fetched before → fetch now, then cache in `details`
      try {
        // Promise.all runs both requests at the same time instead of
        // waiting for the first to finish before starting the second.
        const [entries, notes] = await Promise.all([getUserEntries(u.id), getUserNotes(u.id)]);
        setDetails({ ...details, [u.id]: { entries, notes } });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Saves the calorie goal typed for this user, then reloads the user
  // list so the "Goal: 1800 kcal/day" line under their name updates.
  const handleSetGoal = async (u) => {
    const value = Number(goalDrafts[u.id]);
    if (!value || value <= 0) return; // ignore empty or nonsense values
    try {
      await setUserGoal(u.id, value);
      setGoalDrafts({ ...goalDrafts, [u.id]: '' }); // clear just this user's box
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Saves a note about this user and shows it immediately at the top of
  // their notes list (no refetch needed — the API returns the saved note).
  const handleAddNote = async (u) => {
    const text = (noteDrafts[u.id] || '').trim();
    if (!text) return;
    try {
      const note = await addUserNote(u.id, text);
      setNoteDrafts({ ...noteDrafts, [u.id]: '' });
      setDetails({
        ...details,
        [u.id]: {
          ...details[u.id],
          // `?.` guards against details[u.id] not existing yet.
          notes: [{ ...note, date: new Date().toLocaleString() }, ...(details[u.id]?.notes || [])],
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Posts the admin's reply to a question, then reloads the inbox so the
  // answer form is replaced by the saved answer.
  const handleAnswer = async (id) => {
    const text = (answerDrafts[id] || '').trim();
    if (!text) return;
    try {
      await answerQuestion(id, text);
      setAnswerDrafts({ ...answerDrafts, [id]: '' });
      loadQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="section admin">
      <h2>Admin Panel</h2>
      <p className="subtitle">
        Logged in as <strong>{user.username}</strong>. Review each user's results, set their
        calorie goal, and leave notes.
      </p>

      {error && <div className="auth-error">{error}</div>}

      {/* SECTION 1 — QUESTIONS INBOX.
          Answered questions show the reply; unanswered ones show a
          textarea and a Send Answer button. */}
      <div className="admin-block admin-questions">
        <h4>❓ Questions from Users</h4>
        {questions.length === 0 ? (
          <p className="empty-state small">No questions have been asked yet.</p>
        ) : (
          <ul className="admin-questions-list">
            {questions.map((q) => (
              <li key={q.id} className="admin-question-card">
                <div className="admin-question-head">
                  <strong>{q.username}</strong>
                  <span className="admin-entry-date">
                    {new Date(q.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="admin-question-text">{q.question}</p>

                {q.answer ? (
                  <p className="question-answer"><strong>Answered:</strong> {q.answer}</p>
                ) : (
                  <div className="admin-inline-form">
                    <textarea
                      rows={2}
                      placeholder="Write an answer..."
                      value={answerDrafts[q.id] || ''}
                      onChange={(e) =>
                        setAnswerDrafts({ ...answerDrafts, [q.id]: e.target.value })
                      }
                    />
                    <button className="btn orange" onClick={() => handleAnswer(q.id)}>
                      Send Answer
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SECTION 2 — USER LIST. One collapsible card per registered user. */}
      {users.length === 0 ? (
        <p className="empty-state">No registered users yet.</p>
      ) : (
        <div className="admin-user-list">
          {users.map((u) => {
            const isOpen = expanded === u.id;
            const userDetails = details[u.id]; // undefined until the card is first opened
            // Totals are only real once the details have loaded.
            const totals = userDetails ? summarize(userDetails.entries) : { calories: 0, minutes: 0, steps: 0 };

            return (
              <div className="admin-user-card" key={u.id}>
                {/* The always-visible header row — click anywhere on it to expand */}
                <div className="admin-user-row" onClick={() => toggleExpand(u)}>
                  <div className="admin-user-name">
                    {/* A simple avatar: the first letter of the username */}
                    <span className="admin-avatar">{u.username.charAt(0).toUpperCase()}</span>
                    <div>
                      <strong>{u.username}</strong>
                      <div className="admin-user-sub">
                        {u.calorie_goal ? `Goal: ${u.calorie_goal} kcal/day` : 'No goal set'}
                      </div>
                    </div>
                  </div>
                  {userDetails && (
                    <div className="admin-user-totals">
                      <span>🍽️ {totals.calories} kcal</span>
                      <span>🏋️ {totals.minutes} min</span>
                      <span>🚶 {totals.steps} steps</span>
                    </div>
                  )}
                  <span className="admin-toggle">{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* The expanded half: goal setter, recent entries, notes */}
                {isOpen && (
                  <div className="admin-user-details">
                    <div className="admin-block">
                      <h4>Set Daily Calorie Goal</h4>
                      <div className="admin-inline-form">
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 1800"
                          value={goalDrafts[u.id] || ''}
                          onChange={(e) =>
                            setGoalDrafts({ ...goalDrafts, [u.id]: e.target.value })
                          }
                        />
                        <button className="btn" onClick={() => handleSetGoal(u)}>
                          Save Goal
                        </button>
                      </div>
                    </div>

                    <div className="admin-block">
                      <h4>Recent Entries</h4>
                      {!userDetails || userDetails.entries.length === 0 ? (
                        <p className="empty-state small">No entries logged yet.</p>
                      ) : (
                        <ul className="admin-entry-list">
                          {/* slice(0, 6) — show only the six most recent */}
                          {userDetails.entries.slice(0, 6).map((entry) => (
                            <li key={entry.id}>
                              <span className="admin-entry-type">{entry.type}</span>
                              {entry.name} — {entry.value} {entry.unit}
                              <span className="admin-entry-date">
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="admin-block">
                      <h4>Notes &amp; Comments</h4>
                      <div className="admin-inline-form">
                        <textarea
                          rows={2}
                          placeholder="Write a note for this user..."
                          value={noteDrafts[u.id] || ''}
                          onChange={(e) =>
                            setNoteDrafts({ ...noteDrafts, [u.id]: e.target.value })
                          }
                        />
                        <button className="btn orange" onClick={() => handleAddNote(u)}>
                          Add Note
                        </button>
                      </div>

                      {userDetails && userDetails.notes.length > 0 && (
                        <ul className="admin-notes-list">
                          {userDetails.notes.map((note) => (
                            <li key={note.id}>
                              <p>{note.text}</p>
                              <span className="admin-note-meta">
                                — {note.author}, {note.date || new Date(note.created_at).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
