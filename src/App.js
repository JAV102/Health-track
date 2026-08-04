// =============================================================
// App.js — the root component and the "brain" of the frontend.
// It holds the two pieces of state the whole app depends on:
//   page — which screen is currently showing (instead of a router)
//   user — who is logged in (null when nobody is)
// Both are passed down to the child components as props.
// =============================================================

import { useState, useEffect } from 'react';
import './App.css';
import NavBar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Features from './pages/Features.jsx';
import Contact from './pages/Contact.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import { getCurrentUser, logout } from './utils/auth';

function App() {
  const [page, setPage] = useState('home'); // the app starts on the Home page
  const [user, setUser] = useState(null);   // null = logged out

  // Runs once when the app first loads. Reads the saved token from
  // localStorage so a refresh (or reopening the tab) keeps you logged in.
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Called by the Login and Signup pages once the backend confirms them.
  // Admins land on the Admin Panel, everyone else on their Dashboard.
  const handleLoggedIn = (loggedInUser) => {
    setUser(loggedInUser);
    setPage(loggedInUser.role === 'admin' ? 'admin' : 'dashboard');
  };

  // Clears the saved token, forgets the user, and returns to Home.
  const handleLogout = () => {
    logout();
    setUser(null);
    setPage('home');
  };

  // Decides which page component to show, based on the `page` state.
  // This is the app's navigation — it replaces React Router.
  const renderPage = () => {
    // Protected page: logged-out visitors get the Login form instead.
    if (page === 'dashboard') {
      return user ? <Dashboard user={user} /> : <Login onLoggedIn={handleLoggedIn} setPage={setPage} />;
    }
    // Protected page: admins only. (The backend enforces this too — hiding
    // the page here is only for convenience, not security.)
    if (page === 'admin') {
      return user && user.role === 'admin'
        ? <AdminPanel user={user} />
        : <Login onLoggedIn={handleLoggedIn} setPage={setPage} />;
    }
    if (page === 'login') {
      return <Login onLoggedIn={handleLoggedIn} setPage={setPage} />;
    }
    if (page === 'signup') {
      return <Signup onLoggedIn={handleLoggedIn} setPage={setPage} />;
    }
    // Public pages — anyone can open these.
    if (page === 'features') return <Features />;
    if (page === 'about') return <About />;
    if (page === 'contact') return <Contact user={user} setPage={setPage} />;
    return <Home setPage={setPage} />; // fallback: Home
  };

  // The layout: navbar and footer stay on screen, only the middle changes.
  return (
    <div className="App">
      <NavBar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;
