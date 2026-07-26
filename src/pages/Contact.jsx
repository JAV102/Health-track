import { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="section contact">
      <h2>Contact Us</h2>
      <p className="subtitle">Questions, feedback or ideas? Send us a message.</p>

      {submitted ? (
        <div className="success-box">
          <h3>Thanks, {form.name || 'friend'}! 🎉</h3>
          <p>Your message has been received. We'll get back to you soon.</p>
          <button className="btn" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}>
            Send another message
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help?"
              rows={5}
              required
            />
          </label>

          <button type="submit" className="btn orange">Send Message</button>
        </form>
      )}
    </div>
  );
};

export default Contact;
