// backend/src/models/usage.model.js
const pool = require('../config/db');

async function recordUsage({ userId, metric, value = 1 }) {
  const result = await pool.query(
    'INSERT INTO usage_events (user_id, metric, value) VALUES ($1,$2,$3) RETURNING *',
    [userId, metric, value]
  );
  return result.rows[0];
}

async function getUsageSummary(userId, { days = 30 } = {}) {
  const result = await pool.query(
    `SELECT metric, DATE_TRUNC('day', recorded_at) AS day, SUM(value) AS total
     FROM usage_events
     WHERE user_id = $1 AND recorded_at >= NOW() - ($2 || ' days')::INTERVAL
     GROUP BY metric, day ORDER BY day ASC`,
    [userId, days]
  );
  return result.rows;
}

async function getPlatformUsageSummary({ days = 30 } = {}) {
  const result = await pool.query(
    `SELECT metric, DATE_TRUNC('day', recorded_at) AS day, SUM(value) AS total, COUNT(DISTINCT user_id) AS active_users
     FROM usage_events
     WHERE recorded_at >= NOW() - ($1 || ' days')::INTERVAL
     GROUP BY metric, day ORDER BY day ASC`,
    [days]
  );
  return result.rows;
}

module.exports = { recordUsage, getUsageSummary, getPlatformUsageSummary };
