const pool = require('../config/db');

async function upsertByStripeId({ userId, planId, stripeSubscriptionId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd }) {
  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (stripe_subscription_id) DO UPDATE SET
       plan_id = EXCLUDED.plan_id,
       status = EXCLUDED.status,
       current_period_start = EXCLUDED.current_period_start,
       current_period_end = EXCLUDED.current_period_end,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at = NOW()
     RETURNING *`,
    [userId, planId, stripeSubscriptionId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd]
  );
  return result.rows[0];
}

async function findActiveByUser(userId) {
  const result = await pool.query(
    `SELECT s.*, p.name AS plan_name, p.price_cents, p.interval
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.user_id = $1 AND s.status IN ('active','trialing','past_due')
     ORDER BY s.created_at DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0];
}

async function findByStripeId(stripeSubscriptionId) {
  const result = await pool.query('SELECT * FROM subscriptions WHERE stripe_subscription_id = $1', [stripeSubscriptionId]);
  return result.rows[0];
}

async function listAll({ limit = 50, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT s.*, u.email, p.name AS plan_name
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     JOIN plans p ON p.id = s.plan_id
     ORDER BY s.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

module.exports = { upsertByStripeId, findActiveByUser, findByStripeId, listAll };
