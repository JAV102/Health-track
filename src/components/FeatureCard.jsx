// =============================================================
// components/FeatureCard.jsx — one reusable card.
// A "presentational" component: it holds no state and does nothing
// on its own, it just displays whatever props it is given. The
// Features page renders six of these from an array.
//
// Props: icon (emoji), title, description.
// =============================================================

import '../styles/About.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="value-card">
      <div className="value-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
