-- =============================================================
-- HealthTrack — full database dump for phpMyAdmin import
-- Creates the database, all tables, and sample demo data so you
-- can see the app working immediately (no need to sign up by hand).
--
-- HOW TO IMPORT IN phpMyAdmin:
--   1. Open phpMyAdmin
--   2. Click "Import" in the top menu (no need to create the
--      database first — this file creates it for you)
--   3. Choose this file, then click "Go"
-- =============================================================

CREATE DATABASE IF NOT EXISTS healthtrack;
USE healthtrack;

-- ---------------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  calorie_goal INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------
-- Table: entries (meals / exercise / activity logs)
-- ---------------------------------------------------------------
CREATE TABLE entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('Meal', 'Exercise', 'Activity') NOT NULL,
  name VARCHAR(255) NOT NULL,
  value INT NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- Table: notes (admin comments about a user)
-- ---------------------------------------------------------------
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  author VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- Table: questions (Contact page Q&A)
-- ---------------------------------------------------------------
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT DEFAULT NULL,
  answered_by VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- Sample data
-- Passwords below are real bcrypt hashes (cost factor 10), the
-- same format bcryptjs uses, so these accounts log in normally
-- through the app.
-- =============================================================

-- Admin account   -> username: admin     password: admin123
-- Demo user 1     -> username: mohammad  password: test123
-- Demo user 2     -> username: sara      password: test123
INSERT INTO users (username, password, role, calorie_goal) VALUES
  ('admin',    '$2b$10$GoA9wcz4K8jZUZgjf7P.4eA5rmn5h16sncHAWAYtfKwNrmbcUQ74K', 'admin', NULL),
  ('mohammad', '$2b$10$T2kB.UBpDF.yMneIsT6UjeUt7l1OPHb39N6Gtd457szisYrTz0aSi', 'user',  1800),
  ('sara',     '$2b$10$QI5UogvoyrxqGWJDipAyjeyTn0yCQ2o.1h1slF4JQM6HwuVmhRJi2', 'user',  1600);

-- Sample entries for mohammad (user_id = 2) and sara (user_id = 3)
INSERT INTO entries (user_id, type, name, value, unit) VALUES
  (2, 'Meal',     'Grilled chicken salad', 450, 'kcal'),
  (2, 'Meal',     'Oatmeal with fruit',    320, 'kcal'),
  (2, 'Exercise', 'Morning run',           30,  'min'),
  (2, 'Activity', 'Daily steps',           6500,'steps'),
  (3, 'Meal',     'Veggie stir fry',       500, 'kcal'),
  (3, 'Exercise', 'Yoga session',          45,  'min'),
  (3, 'Activity', 'Water intake',          6,   'steps');

-- Sample admin note about mohammad
INSERT INTO notes (user_id, author, text) VALUES
  (2, 'admin', 'Great progress this week! Keep up the morning runs.');

-- Sample question from mohammad, already answered by admin
INSERT INTO questions (user_id, username, question, answer, answered_by) VALUES
  (2, 'mohammad', 'How many calories should I eat on rest days?',
      'Aim for about 200-300 kcal less than your training days, around 1500-1600 kcal.',
      'admin');

-- Sample unanswered question from sara
INSERT INTO questions (user_id, username, question) VALUES
  (3, 'sara', 'Is 45 minutes of yoga enough for a full workout?');
