const stripe = require('../config/stripe');
const planModel = require('../models/plan.model');
const subscriptionModel = require('../models/subscription.model');
const userModel = require('../models/user.model');

async function ensureStripeCustomer(user) {
  if (user.stripe_customer_id) return user.stripe_customer_id;
  const customer = await stripe.customers.create({ email: user.email, metadata: { userId: String(user.id) } });
  await userModel.setStripeCustomerId(user.id, customer.id);
  return customer.id;
}

async function createCheckoutSession(req, res) {
  try {
    const { planId } = req.body;
    const plan = await planModel.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const user = await userModel.findById(req.user.id);
    const customerId = await ensureStripeCustomer(user);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/plans?canceled=true`,
      metadata: { userId: String(user.id), planId: String(plan.id) },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

async function getCurrentSubscription(req, res) {
  res.json({ subscription: (await subscriptionModel.findActiveByUser(req.user.id)) || null });
}

async function changePlan(req, res) {
  try {
    const { planId } = req.body;
    const newPlan = await planModel.findById(planId);
    if (!newPlan) return res.status(404).json({ error: 'Plan not found' });

    const currentSub = await subscriptionModel.findActiveByUser(req.user.id);
    if (!currentSub) return res.status(400).json({ error: 'No active subscription to change' });

    const stripeSub = await stripe.subscriptions.retrieve(currentSub.stripe_subscription_id);
    await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
      items: [{ id: stripeSub.items.data[0].id, price: newPlan.stripe_price_id }],
      proration_behavior: 'create_prorations',
    });

    res.json({ message: 'Plan change requested. Changes will sync via webhook.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change plan' });
  }
}

async function cancelSubscription(req, res) {
  try {
    const currentSub = await subscriptionModel.findActiveByUser(req.user.id);
    if (!currentSub) return res.status(400).json({ error: 'No active subscription' });

    await stripe.subscriptions.update(currentSub.stripe_subscription_id, { cancel_at_period_end: true });
    res.json({ message: 'Subscription will cancel at period end.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

module.exports = { createCheckoutSession, getCurrentSubscription, changePlan, cancelSubscription };
