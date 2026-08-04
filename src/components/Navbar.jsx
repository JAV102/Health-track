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
        {/* Always visible. The className adds an underline to the open page. */}
        <a className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}> Home </a>
        <a className={page === 'features' ? 'active' : ''} onClick={() => setPage('features')}> Features </a>

        {/* Dashboard: only for logged-in normal users (admins have no entries) */}
        {user && user.role !== 'admin' && (
          <a className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}> Dashboard </a>
        )}

        {/* Admin Panel: replaces Dashboard when an admin is logged in */}
        {user && user.role === 'admin' && (
          <a className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}> Admin Panel </a>
        )}

        {/* About and Contact are hidden from admins — the admin *is* the
            person who answers Contact questions, so those pages are not
            aimed at them. */}
        {(!user || user.role !== 'admin') && (
          <>
            <a className={page === 'about' ? 'active' : ''} onClick={() => setPage('about')}> About </a>
            <a className={page === 'contact' ? 'active' : ''} onClick={() => setPage('contact')}> Contact </a>
          </>
        )}

        {/* Right-hand end: a greeting + Log Out, or the two auth links. */}
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.username}</span>
            <a onClick={onLogout}> Log Out </a>
          </>
        ) : (
          <>
            <a className={page === 'login' ? 'active' : ''} onClick={() => setPage('login')}> Log In </a>
            <a className={page === 'signup' ? 'active' : ''} onClick={() => setPage('signup')}> Sign Up </a>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
