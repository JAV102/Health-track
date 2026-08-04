// =============================================================
// components/Footer.jsx — the static footer shown under every page.
// Takes no props; the only dynamic part is the copyright year.
// =============================================================

import '../styles/Footer.css';

const Footer = () => {
  return (
    <div className="footerdiv">
      <h3>HealthTrack</h3>
      <p>Your daily companion for meals, workouts and wellness goals.</p>
      <p>
        <a href="mailto:support@healthtrack.app">support@healthtrack.app</a> &bull;{' '}
        <a href="tel:+15550199">(555) 019-9000</a>
      </p>
      {/* getFullYear() keeps the year current without editing this file */}
      <p className="fine-print">&copy; {new Date().getFullYear()} HealthTrack. All rights reserved.</p>
    </div>
  );
};

export default Footer;
