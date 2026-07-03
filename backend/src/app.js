const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { handleStripeWebhook } = require('./webhooks/stripe.webhook');
const authRoutes = require('./routes/auth.routes');
const planRoutes = require('./routes/plan.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const billingRoutes = require('./routes/billing.routes');
const usageRoutes = require('./routes/usage.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Must be registered BEFORE express.json() — Stripe needs the raw body to verify signatures
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
