// =============================================================
// pages/Contact.jsx — where a user asks the admin a question and
// later reads the reply.
//
// You must be logged in: the question is tied to your account so the
// answer can be shown back to you (and so the admin knows who asked).
//
// Props:
//   user    — the logged-in user, or null
//   setPage — used by the "Log In" button shown to logged-out visitors
// =============================================================

import { useState, useEffect } from 'react';
import { askQuestion, getMyQuestions } from '../utils/auth';
import '../styles/Contact.css';

const Contact = ({ user, setPage }) => {
  const [question, setQuestion] = useState('');     // what is typed in the textarea
  const [submitted, setSubmitted] = useState(false); // true = show the thank-you box
  const [myQuestions, setMyQuestions] = useState([]); // my past questions + answers
  const [error, setError] = useState('');

  // Loads my previous questions when the page opens. The [user] dependency
  // means this re-runs if the logged-in user changes.
  useEffect(() => {
    if (user) {
      getMyQuestions().then(setMyQuestions).catch((err) => setError(err.message));
    }
  }, [user]);

  // Sends a new question, then reloads the list so it appears below.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return; // ignore an empty or whitespace-only question

    try {
      await askQuestion(question.trim());
      setSubmitted(true);
      setQuestion(''); // empty the textarea
      // Re-fetch rather than guessing, so we get the real id and timestamp.
      const updated = await getMyQuestions();
      setMyQuestions(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  // Logged-out visitors get a prompt to log in instead of the form.
  if (!user) {
    return (
      <div className="section contact">
        <h2>Contact Us</h2>
        <p className="subtitle">
          Please log in to ask the admin a question — this keeps your question tied to your
          account so you can see the answer later.
        </p>
        <button className="btn orange" onClick={() => setPage('login')}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="section contact">
      <h2>Contact Us</h2>
      <p className="subtitle">
        Logged in as <strong>{user.username}</strong>. Ask a question and an admin will answer it
        here.
      </p>

      {error && <div className="auth-error">{error}</div>}

      {/* After sending, swap the form for a confirmation message */}
      {submitted ? (
        <div className="success-box">
          <h3>Thanks, {user.username}! 🎉</h3>
          <p>Your question has been sent to the admin. Check below for the answer.</p>
          <button className="btn" onClick={() => setSubmitted(false)}>
            Ask another question
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Question
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask the admin?"
              rows={5}
              required
            />
          </label>

          <button type="submit" className="btn orange">Send Question</button>
        </form>
      )}

      {/* My question history — each item shows the admin's answer if one
          has been posted, otherwise a "waiting" note. */}
      {myQuestions.length > 0 && (
        <div className="my-questions">
          <h3>Your Questions</h3>
          <ul className="question-list">
            {myQuestions.map((q) => (
              <li key={q.id} className="question-item">
                <p className="question-text"><strong>Q:</strong> {q.question}</p>
                <span className="question-date">{new Date(q.created_at).toLocaleString()}</span>
                {q.answer ? (
                  <p className="question-answer"><strong>Admin:</strong> {q.answer}</p>
                ) : (
                  <p className="question-pending">Waiting for an answer...</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Contact;
