import '../styles/style.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="menuItem">
      <div className="menuItem-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
