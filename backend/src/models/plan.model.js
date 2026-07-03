const pool = require('../config/db');

async function listActivePlans() {
  const result = await pool.query('SELECT * FROM plans WHERE is_active = TRUE ORDER BY price_cents ASC');
  return result.rows;
}

async function listAllPlans() {
  const result = await pool.query('SELECT * FROM plans ORDER BY price_cents ASC');
  return result.rows;
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
  return result.rows[0];
}

async function createPlan({ name, description, stripePriceId, priceCents, currency, interval, features }) {
  const result = await pool.query(
    `INSERT INTO plans (name, description, stripe_price_id, price_cents, currency, interval, features)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, description, stripePriceId, priceCents, currency, interval, JSON.stringify(features || [])]
  );
  return result.rows[0];
}

async function updatePlan(id, fields) {
  const { name, description, priceCents, isActive, features } = fields;
  const result = await pool.query(
    `UPDATE plans SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       price_cents = COALESCE($3, price_cents),
       is_active = COALESCE($4, is_active),
       features = COALESCE($5, features)
     WHERE id = $6 RETURNING *`,
    [name, description, priceCents, isActive, features ? JSON.stringify(features) : null, id]
  );
  return result.rows[0];
}

module.exports = { listActivePlans, listAllPlans, findById, createPlan, updatePlan };
