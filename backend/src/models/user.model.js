const pool = require('../config/db');

async function createUser({ email, passwordHash, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
     RETURNING id, email, name, role, created_at`,
    [email, passwordHash, name]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, email, name, role, stripe_customer_id, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function setStripeCustomerId(userId, customerId) {
  await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
}

async function listUsers({ limit = 50, offset = 0 } = {}) {
  const result = await pool.query(
    'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
}

async function updateRole(userId, role) {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
    [role, userId]
  );
  return result.rows[0];
}

module.exports = { createUser, findByEmail, findById, setStripeCustomerId, listUsers, updateRole };
