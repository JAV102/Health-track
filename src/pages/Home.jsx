// =============================================================
// pages/Home.jsx — the landing page (the first thing visitors see).
// Purely static content plus two buttons that navigate elsewhere.
//
// Props: setPage — lets the buttons switch pages (comes from App.js).
// =============================================================

import '../styles/Home.css';

const Home = ({ setPage }) => {
  // Note: if nobody is logged in, App.js shows the Login page instead
  // of the Dashboard, so this button doubles as a "get started" link.
  const goToDashboard = () => {
    setPage('dashboard');
  };

  const goToFeatures = () => {
    setPage('features');
  };

  return (
    <div className="home">
      {/* Hero: the headline, the intro text and the two call-to-action buttons */}
      <section className="hero">
        <div className="hero-text">
          <h1>Build habits that stick.</h1>
          <p>
            HealthTrack helps you log your meals, workouts and daily activity
            in one simple dashboard, so you can see your progress at a glance
            and stay consistent.
          </p>
          <div className="hero-actions">
            <button className="btn orange" onClick={goToDashboard}>Go to Dashboard</button>
            <button className="btn" onClick={goToFeatures}>See Features</button>
          </div>
        </div>
        {/* Decorative floating bubbles. aria-hidden keeps screen readers
            from announcing them, since they are illustration, not content. */}
        <div className="hero-visual" aria-hidden="true">
          <div className="stat-bubble bubble-1">🥗 Meals logged</div>
          <div className="stat-bubble bubble-2">🏃 32 min run</div>
          <div className="stat-bubble bubble-3">💧 6/8 cups</div>
        </div>
      </section>

      {/* "Why HealthTrack?" — three selling points under the hero */}
      <section className="section why">
        <h2>Why HealthTrack?</h2>
        <p className="subtitle">A lightweight tracker without the clutter.</p>
        <div className="why-grid">
          <div className="why-item">
            <h3>Simple logging</h3>
            <p>Add meals, workouts and activities in seconds.</p>
          </div>
          <div className="why-item">
            <h3>Clear overview</h3>
            <p>See totals for calories, workouts and water at a glance.</p>
          </div>
          <div className="why-item">
            <h3>Stays with you</h3>
            <p>Your entries are saved on your device automatically.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
