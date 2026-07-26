import FeatureCard from '../components/FeatureCard.jsx';
import '../styles/style.css';

const featureList = [
  {
    icon: '🍽️',
    title: 'Meal Logging',
    description: 'Track what you eat and log estimated calories for every meal of the day.',
  },
  {
    icon: '🏋️',
    title: 'Exercise Tracking',
    description: 'Record workouts by type and duration to keep your training consistent.',
  },
  {
    icon: '🚶',
    title: 'Daily Activity',
    description: 'Log steps, water intake and other daily habits in one place.',
  },
  {
    icon: '📊',
    title: 'Progress Overview',
    description: 'See totals and summaries update instantly on your dashboard.',
  },
  {
    icon: '💾',
    title: 'Saved Automatically',
    description: 'Your logs are stored on your device, so they are there next time you visit.',
  },
  {
    icon: '📱',
    title: 'Works Anywhere',
    description: 'A fully responsive layout that works on desktop, tablet and mobile.',
  },
];

const Features = () => {
  return (
    <div className="section">
      <h2>Features</h2>
      <p className="subtitle">Everything you need to stay on top of your wellness routine.</p>
      <div className="cardcontainer">
        {featureList.map((feature, i) => (
          <FeatureCard
            key={i}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Features;
