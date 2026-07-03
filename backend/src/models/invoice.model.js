const pool = require('../config/db');
async function createInvoice({ userId, subscriptionId, stripeInvoiceId, amountPaidCents, currency, status, invoicePdf }) {
  const result = await pool.query(
    `INSERT INTO invoices (user_id, subscription_id, stripe_invoice_id, amount_paid_cents, currency, status, invoice_pdf)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (stripe_invoice_id) DO UPDATE SET status = EXCLUDED.status, amount_paid_cents = EXCLUDED.amount_paid_cents
     RETURNING *`,
    [userId, subscriptionId, stripeInvoiceId, amountPaidCents, currency, status, invoicePdf]
  );
  return result.rows[0];
}
async function listByUser(userId) {
  const result = await pool.query('SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}
module.exports = { createInvoice, listByUser };