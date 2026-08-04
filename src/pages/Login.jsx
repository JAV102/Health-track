// =============================================================
// pages/Login.jsx — the log-in form.
//
// Props:
//   onLoggedIn — called with the user once the backend accepts them;
//                App.js then stores the user and switches page
//   setPage    — used by the "Sign up" link at the bottom
// =============================================================

import { useState } from 'react';
import { login } from '../utils/auth';
import '../styles/Auth.css';

const Login = ({ onLoggedIn, setPage }) => {
  // "Controlled inputs": each field's value lives in state, and every
  // keystroke updates it via onChange. React state is the single source
  // of truth for what is typed in the form.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');     // message shown in the red box
  const [loading, setLoading] = useState(false); // disables the button mid-request

  // Runs when the form is submitted (button click or Enter key).
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default full-page reload
    setError('');       // clear any error from a previous attempt
    setLoading(true);
    try {
      // Calls the backend; the token is saved inside this function.
      const user = await login(username, password);
      onLoggedIn(user); // hand the user up to App.js
    } catch (err) {
      // The message thrown by utils/auth.js, e.g. "Incorrect username or password."
      setError(err.message);
    } finally {
      setLoading(false); // runs whether it succeeded or failed
    }
  };

  return (
    <div className="section auth">
      <h2>Log In</h2>
      <p className="subtitle">Welcome back — log in to see your dashboard.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* `error && ...` means: only render this box if error is not empty */}
        {error && <div className="auth-error">{error}</div>}

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {/* Disabled while the request is in flight, so it cannot be double-clicked */}
        <button type="submit" className="btn orange" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{' '}
        <a onClick={() => setPage('signup')}>Sign up</a>
      </p>
    </div>
  );
};

export default Login;
