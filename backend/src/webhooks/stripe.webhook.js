const stripe = require('../config/stripe');
const planModel = require('../models/plan.model');
const subscriptionModel = require('../models/subscription.model');
const invoiceModel = require('../models/invoice.model');
const pool = require('../config/db');

async function resolveUserIdFromCustomer(stripeCustomerId) {
  const result = await pool.query('SELECT id FROM users WHERE stripe_customer_id = $1', [stripeCustomerId]);
  return result.rows[0]?.id || null;
}

async function syncSubscriptionFromStripe(stripeSubscriptionId, userIdHint) {
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = userIdHint || (await resolveUserIdFromCustomer(sub.customer));
  if (!userId) return console.warn(`Could not resolve user for customer ${sub.customer}`);

  const stripePriceId = sub.items.data[0].price.id;
  const plans = await planModel.listAllPlans();
  const plan = plans.find((p) => p.stripe_price_id === stripePriceId);
  if (!plan) return console.warn(`No local plan found for Stripe price ${stripePriceId}`);

  await subscriptionModel.upsertByStripeId({
    userId,
    planId: plan.id,
    stripeSubscriptionId: sub.id,
    status: sub.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}

async function handleInvoiceEvent(invoice, status) {
  const userId = await resolveUserIdFromCustomer(invoice.customer);
  if (!userId) return;

  let subscriptionRowId = null;
  if (invoice.subscription) {
    const localSub = await subscriptionModel.findByStripeId(invoice.subscription);
    subscriptionRowId = localSub?.id || null;
  }

  await invoiceModel.createInvoice({
    userId,
    subscriptionId: subscriptionRowId,
    stripeInvoiceId: invoice.id,
    amountPaidCents: invoice.amount_paid,
    currency: invoice.currency,
    status,
    invoicePdf: invoice.invoice_pdf,
  });
}

async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          await syncSubscriptionFromStripe(session.subscription, session.metadata?.userId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object;
        const userId = await resolveUserIdFromCustomer(sub.customer);
        if (userId) await syncSubscriptionFromStripe(sub.id, userId);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await pool.query(`UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE stripe_subscription_id = $1`, [sub.id]);
        break;
      }
      case 'invoice.paid':
        await handleInvoiceEvent(event.data.object, 'paid');
        break;
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event.data.object, 'payment_failed');
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

module.exports = { handleStripeWebhook };
