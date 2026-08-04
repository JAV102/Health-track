// =============================================================
// utils/auth.js — API client for the HealthTrack backend
// (Node.js + Express + MySQL).
//
// This is the ONLY file in the frontend that talks to the server.
// Every page imports a function from here instead of calling fetch
// itself, so the URL and the login token are handled in one place.
//
// Set REACT_APP_API_URL in a .env file to point at your backend
// (defaults to a local server on port 5000).
// =============================================================

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'healthtrack_token'; // the key the token is saved under in localStorage

// --- Token storage helpers -------------------------------------
// localStorage survives refreshes and closing the tab, which is what
// keeps the user logged in between visits.
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// --- The shared fetch wrapper ----------------------------------
// Every function below goes through this one. It:
//   1. builds the full URL (API_URL + path)
//   2. attaches the login token so the backend knows who is calling
//   3. turns a failed response into a thrown Error carrying the
//      backend's own message, so pages can just catch and display it.
const request = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  // This is the header that middleware/auth.js on the backend reads.
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // .catch(() => ({})) guards against responses with an empty body.
  const data = await res.json().catch(() => ({}));

  // res.ok is false for 4xx/5xx. fetch does NOT throw on those by itself,
  // so we throw here to make errors reach the page's catch block.
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
};

// ---- Auth ----
// Used by: Signup.jsx, Login.jsx, App.js

// Creates the account, saves the returned token, and gives the page
// back the new user so it can switch to the Dashboard.
export const signup = async (username, password) => {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token); // saving the token is what "being logged in" means
  return data.user;
};

// Same as signup, but for an account that already exists.
export const login = async (username, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data.user;
};

// Logging out is purely local: throw the token away and the app can no
// longer prove who you are. (JWTs cannot be "cancelled" on the server.)
export const logout = () => clearToken();

// Reads the currently logged-in user straight out of the saved token,
// no network call needed. Called once by App.js on page load.
//
// A JWT is three base64 parts separated by dots: header.payload.signature.
// We take the middle part and decode it with atob() to read the user data
// that routes/auth.js baked in when the token was created.
// NOTE: this is only for displaying the name/role in the UI — we are not
// verifying the signature here. The backend re-checks it on every request,
// so a user editing their own token cannot actually gain admin access.
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null; // nobody is logged in
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      calorie_goal: payload.calorie_goal,
    };
  } catch {
    return null; // token was missing or malformed — treat as logged out
  }
};

// ---- Entries (Dashboard) ----
// Used by: Dashboard.jsx

// Fetch my own logged meals/workouts/activities.
export const getEntries = () => request('/entries');

// Save one new entry. `entry` is { type, name, value, unit }.
export const addEntry = (entry) =>
  request('/entries', { method: 'POST', body: JSON.stringify(entry) });

// Delete one of my entries by its database id.
export const deleteEntry = (id) => request(`/entries/${id}`, { method: 'DELETE' });

// ---- Admin: users, goals, notes ----
// Used by: AdminPanel.jsx — these all fail with 403 for a normal user.

// The list of all regular users shown in the panel.
export const getAllUsers = () => request('/users');

// One specific user's entries, loaded when the admin expands their card.
export const getUserEntries = (id) => request(`/users/${id}/entries`);

// Set that user's daily calorie target (shows on their Dashboard).
export const setUserGoal = (id, calorieGoal) =>
  request(`/users/${id}/goal`, { method: 'PATCH', body: JSON.stringify({ calorieGoal }) });

// Read the admin notes written about a user.
export const getUserNotes = (id) => request(`/users/${id}/notes`);

// Write a new note about a user.
export const addUserNote = (id, text) =>
  request(`/users/${id}/notes`, { method: 'POST', body: JSON.stringify({ text }) });

// ---- Questions (Contact page) ----
// Used by: Contact.jsx (user side) and AdminPanel.jsx (admin side)

// Admin only: every question ever submitted.
export const getAllQuestions = () => request('/questions');

// User: just the questions I asked, with any answers.
export const getMyQuestions = () => request('/questions/mine');

// User: submit a new question to the admin.
export const askQuestion = (question) =>
  request('/questions', { method: 'POST', body: JSON.stringify({ question }) });

// Admin only: reply to a question by its id.
export const answerQuestion = (id, answer) =>
  request(`/questions/${id}/answer`, { method: 'PATCH', body: JSON.stringify({ answer }) });
