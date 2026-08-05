// =============================================================
// pages/Signup.jsx — the create-account form.
// Almost identical to Login.jsx, with one extra field: the password
// has to be typed twice and the two must match.
// A successful signup logs you straight in — no separate login step.
//
// Props: onLoggedIn, setPage (same roles as in Login.jsx).
// =============================================================

import { useState } from 'react';
import { signup } from '../utils/auth';
import '../styles/Auth.css';

const Signup = ({ onLoggedIn, setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(''); // the "repeat password" field
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Checked here in the browser — the backend never sees the confirm field.
    if (password !== confirm) {
      setError('Passwords do not match.');
      return; // stop before making a pointless network request
    }

    setLoading(true);
    try {
      // Creates the account, saves the token, and returns the new user.
      const user = await signup(username, password);
      onLoggedIn(user);
    } catch (err) {
      // e.g. "That username is already taken."
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section auth">
      <h2>Create an Account</h2>
      <p className="subtitle">Sign up to start logging your meals, workouts and activity.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Pick a username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Pick a password"
            required
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
          />
        </label>

        <button type="submit" className="btn orange" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={() => setPage('login')}>Log in</button>
      </p>
    </div>
  );
};

export default Signup;
