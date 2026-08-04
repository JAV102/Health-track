// =============================================================
// index.js — the very first file the browser runs.
// It attaches the React app to the <div id="root"> in public/index.html.
// Nothing else happens here; App.js takes over from this point.
// =============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// StrictMode is a development-only helper that warns about unsafe
// patterns. It renders components twice in dev, never in production.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
