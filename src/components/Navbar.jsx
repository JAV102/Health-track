// =============================================================
// components/Navbar.jsx — the top navigation bar, always on screen.
// The links it shows change depending on who is logged in:
//   logged out  → Home, Features, About, Contact, Log In, Sign Up
//   normal user → ... plus Dashboard, minus the login links
//   admin       → Home, Features, Admin Panel, Log Out
//
// Props:
//   page      — the currently open page, used to highlight the active link
//   setPage   — changes the page (comes from App.js)
//   user      — the logged-in user, or null
//   onLogout  — logs the user out (comes from App.js)
// =============================================================

import '../styles/NavBar.css';

const NavBar = ({ page, setPage, user, onLogout }) => {
  return (
    <div className="navbar">
      {/* Clicking the logo always goes back Home */}
      <div className="brand" onClick={() => setPage('home')}>
        <span className="brand-icon">🌿</span>
        <span className="brand-name">HealthTrack</span>
      </div>

      <div className="rightSide">
        {/* These are <button>s rather than <a>s because they change React
            state instead of navigating to a URL. A button is focusable with
            Tab and fires on Enter/Space; an <a> without href is neither. */}
        <button type="button" className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}> Home </button>
        <button type="button" className={page === 'features' ? 'active' : ''} onClick={() => setPage('features')}> Features </button>

        {/* Dashboard: only for logged-in normal users (admins have no entries) */}
        {user && user.role !== 'admin' && (
          <button type="button" className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}> Dashboard </button>
        )}

        {/* Admin Panel: replaces Dashboard when an admin is logged in */}
        {user && user.role === 'admin' && (
          <button type="button" className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}> Admin Panel </button>
        )}

        {/* About and Contact are hidden from admins — the admin *is* the
            person who answers Contact questions, so those pages are not
            aimed at them. */}
        {(!user || user.role !== 'admin') && (
          <>
            <button type="button" className={page === 'about' ? 'active' : ''} onClick={() => setPage('about')}> About </button>
            <button type="button" className={page === 'contact' ? 'active' : ''} onClick={() => setPage('contact')}> Contact </button>
          </>
        )}

        {/* Right-hand end: a greeting + Log Out, or the two auth links. */}
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.username}</span>
            <button type="button" onClick={onLogout}> Log Out </button>
          </>
        ) : (
          <>
            <button type="button" className={page === 'login' ? 'active' : ''} onClick={() => setPage('login')}> Log In </button>
            <button type="button" className={page === 'signup' ? 'active' : ''} onClick={() => setPage('signup')}> Sign Up </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
