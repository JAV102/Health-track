// =============================================================
// pages/About.jsx — static information page about the project.
// No props, no state, no API calls: just text and three value cards.
// =============================================================

import '../styles/About.css';

const About = () => {
  return (
    <div className="section about">
      <h2>About HealthTrack</h2>

      <div className="about-content">
        <p>
          HealthTrack is a personal wellness tracking website that helps
          users log their daily meals, exercise routines and general
          activity. It was built as a course project to demonstrate frontend
          development with React, focusing on clean design, responsive
          layouts and simple, usable interfaces.
        </p>
        <p>
          The goal is simple: give people one place to see what they ate,
          how much they moved, and how consistent they have been, without
          the clutter of a full fitness platform.
        </p>

        <div className="about-values">
          <div className="value-card">
            <h3>Simplicity</h3>
            <p>No unnecessary steps between you and logging your day.</p>
          </div>
          <div className="value-card">
            <h3>Consistency</h3>
            <p>Small daily logs build into meaningful long-term habits.</p>
          </div>
          <div className="value-card">
            <h3>Privacy</h3>
            <p>Your entries stay on your own device.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
