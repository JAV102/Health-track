// =============================================================
// pages/Dashboard.jsx — the main screen for a normal user.
// Four jobs:
//   1. load and list the user's entries
//   2. add a new entry (meal / exercise / activity)
//   3. delete an entry
//   4. add up the totals and compare calories against the admin's goal
//
// Props: user — the logged-in user (its calorie_goal drives the goal bar).
// =============================================================

import { useState, useEffect } from 'react';
import { getEntries, addEntry, deleteEntry } from '../utils/auth';
import '../styles/Dashboard.css';

// The form's starting values, reused every time it is reset after a save.
const emptyForm = { type: 'Meal', name: '', value: '', unit: 'kcal' };

// Each entry type has one fixed unit, so picking a type picks the unit too.
const unitByType = {
  Meal: 'kcal',
  Exercise: 'min',
  Activity: 'steps',
};

const Dashboard = ({ user }) => {
  const [entries, setEntries] = useState([]);   // everything the user has logged
  const [form, setForm] = useState(emptyForm);  // the "add entry" form fields
  const [loading, setLoading] = useState(true); // true until the first fetch finishes
  const [error, setError] = useState('');

  // Runs once when the page opens. The empty [] means "no dependencies,
  // do not run again". .finally() hides the loading message either way.
  useEffect(() => {
    getEntries()
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Meal / Exercise / Activity buttons: switch the type AND its matching unit.
  const handleTypeChange = (type) => {
    setForm({ ...form, type, unit: unitByType[type] });
  };

  // Saves a new entry, then puts it at the top of the list.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.value) return; // ignore an incomplete form

    try {
      const saved = await addEntry({
        type: form.type,
        name: form.name.trim(),
        value: Number(form.value), // the input gives a string, the API wants a number
        unit: form.unit,
      });

      // Add to the front of the list so the newest shows first, without
      // re-fetching the whole list from the server.
      setEntries([{ ...saved, date: new Date().toLocaleDateString() }, ...entries]);

      // Clear the name/value boxes but keep the type the user was using,
      // so logging several meals in a row is quick.
      setForm({ ...emptyForm, type: form.type, unit: form.unit });
    } catch (err) {
      setError(err.message);
    }
  };

  // Deletes on the server first, then removes it from the list on screen.
  const handleDelete = async (id) => {
    try {
      await deleteEntry(id);
      setEntries(entries.filter((entry) => entry.id !== id)); // keep everything except this id
    } catch (err) {
      setError(err.message);
    }
  };

  // Adds up the three totals in a single pass over the entries.
  // reduce() walks the list carrying an accumulator (acc) along; the
  // second argument { calories: 0, ... } is where it starts.
  // Recalculated on every render, so the numbers update the instant an
  // entry is added or deleted.
  const totals = entries.reduce(
    (acc, entry) => {
      if (entry.type === 'Meal') acc.calories += entry.value;
      if (entry.type === 'Exercise') acc.minutes += entry.value;
      if (entry.type === 'Activity') acc.steps += entry.value;
      return acc;
    },
    { calories: 0, minutes: 0, steps: 0 }
  );

  // --- Calorie goal (set by an admin in the Admin Panel) ---
  const goal = user.calorie_goal; // null when no goal has been set yet
  // Percentage for the progress bar's width, capped at 100 so it cannot overflow.
  const goalProgress = goal ? Math.min(100, Math.round((totals.calories / goal) * 100)) : 0;
  const overGoal = goal && totals.calories > goal; // turns the card red

  // Shown while the first fetch is still running.
  if (loading) {
    return (
      <div className="section dashboard">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="section dashboard">
      <h2>Your Dashboard</h2>
      <p className="subtitle">Log a meal, workout or activity and watch your totals update.</p>

      {error && <div className="auth-error">{error}</div>}

      {/* GOAL CARD — the progress bar, or a prompt if no goal is set yet */}
      {goal ? (
        <div className={`goal-card ${overGoal ? 'goal-over' : ''}`}>
          <div className="goal-header">
            <span>🎯 Daily Calorie Goal (set by your admin)</span>
            <span className="goal-numbers">{totals.calories} / {goal} kcal</span>
          </div>
          <div className="goal-bar">
            <div className="goal-bar-fill" style={{ width: `${goalProgress}%` }} />
          </div>
          <p className="goal-status">
            {overGoal
              ? `You're ${totals.calories - goal} kcal over your goal today.`
              : `${goal - totals.calories} kcal remaining to stay within your goal.`}
          </p>
        </div>
      ) : (
        <div className="goal-card goal-empty">
          No calorie goal has been set for you yet. Ask your administrator to set one from the Admin Panel.
        </div>
      )}

      {/* SUMMARY CARDS — the three totals calculated above */}
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-icon">🍽️</span>
          <span className="summary-value">{totals.calories}</span>
          <span className="summary-label">kcal logged</span>
        </div>
        <div className="summary-card">
          <span className="summary-icon">🏋️</span>
          <span className="summary-value">{totals.minutes}</span>
          <span className="summary-label">minutes exercised</span>
        </div>
        <div className="summary-card">
          <span className="summary-icon">🚶</span>
          <span className="summary-value">{totals.steps}</span>
          <span className="summary-label">steps logged</span>
        </div>
      </div>

      {/* ADD ENTRY FORM — type buttons, a name, an amount, and submit */}
      <form className="log-form" onSubmit={handleSubmit}>
        {/* Type toggle built from the keys of unitByType: Meal, Exercise, Activity */}
        <div className="type-toggle">
          {Object.keys(unitByType).map((type) => (
            <button
              type="button"
              key={type}
              className={`type-btn ${form.type === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* The placeholder text changes to suit the selected type */}
        <input
          type="text"
          placeholder={
            form.type === 'Meal'
              ? 'e.g. Grilled chicken salad'
              : form.type === 'Exercise'
              ? 'e.g. Morning run'
              : 'e.g. Water intake'
          }
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="number"
          min="0"
          placeholder={`Amount (${form.unit})`}
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          required
        />

        <button type="submit" className="btn orange">Add Entry</button>
      </form>

      {/* ENTRY LIST — every logged entry, newest first, each with a delete button */}
      <div className="entry-list">
        {entries.length === 0 ? (
          <p className="empty-state">No entries yet. Add your first log above.</p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id} className={`entry entry-${entry.type.toLowerCase()}`}>
                <div className="entry-info">
                  <span className="entry-type">{entry.type}</span>
                  <span className="entry-name">{entry.name}</span>
                  {/* Just-added entries carry `date`; ones loaded from the
                      database carry the `created_at` timestamp instead. */}
                  <span className="entry-date">
                    {entry.date || (entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '')}
                  </span>
                </div>
                <div className="entry-actions">
                  <span className="entry-value">{entry.value} {entry.unit}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Delete ${entry.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
