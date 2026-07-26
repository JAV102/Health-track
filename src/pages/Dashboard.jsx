import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const STORAGE_KEY = 'healthtrack_entries';

const emptyForm = { type: 'Meal', name: '', value: '', unit: 'kcal' };

const unitByType = {
  Meal: 'kcal',
  Exercise: 'min',
  Activity: 'steps',
};

const Dashboard = () => {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleTypeChange = (type) => {
    setForm({ ...form, type, unit: unitByType[type] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.value) return;

    const newEntry = {
      id: Date.now(),
      type: form.type,
      name: form.name.trim(),
      value: Number(form.value),
      unit: form.unit,
      date: new Date().toLocaleDateString(),
    };

    setEntries([newEntry, ...entries]);
    setForm({ ...emptyForm, type: form.type, unit: form.unit });
  };

  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const totals = entries.reduce(
    (acc, entry) => {
      if (entry.type === 'Meal') acc.calories += entry.value;
      if (entry.type === 'Exercise') acc.minutes += entry.value;
      if (entry.type === 'Activity') acc.steps += entry.value;
      return acc;
    },
    { calories: 0, minutes: 0, steps: 0 }
  );

  return (
    <div className="section dashboard">
      <h2>Your Dashboard</h2>
      <p className="subtitle">Log a meal, workout or activity and watch your totals update.</p>

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

      <form className="log-form" onSubmit={handleSubmit}>
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
                  <span className="entry-date">{entry.date}</span>
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
