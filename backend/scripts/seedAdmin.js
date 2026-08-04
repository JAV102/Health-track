// =============================================================
// scripts/seedAdmin.js — one-off setup script, run with:
//   npm run seed:admin
// It creates the very first admin account. This cannot live in
// schema.sql because the password has to be hashed by bcrypt in
// JavaScript first, and there is no signup route that can create
// an admin (signup always makes a normal 'user').
// =============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    // Safe to re-run: if an admin already exists we stop instead of
    // creating a duplicate or overwriting the password.
    const [existing] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (existing.length > 0) {
      console.log('An admin account already exists — nothing to do.');
      process.exit(0);
    }

    // The password comes from ADMIN_PASSWORD in .env so the deployed site
    // never ends up with the well-known default. 'admin123' is only the
    // local fallback — never rely on it on a public server.
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('⚠  ADMIN_PASSWORD is not set — falling back to the default "admin123".');
      console.warn('   Set ADMIN_PASSWORD in .env before seeding a public deployment.');
    }

    // Hashed exactly like a signup password, so login works the same way.
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashed, 'admin']
    );

    // The password itself is deliberately not printed here.
    console.log('Admin account created — username: admin');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin account:', err.message);
    process.exit(1);
  }
}

seed();
