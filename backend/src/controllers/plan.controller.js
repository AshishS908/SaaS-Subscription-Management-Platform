const planModel = require('../models/plan.model');
const stripe = require('../config/stripe');

async function listPlans(req, res) {
  res.json({ plans: await planModel.listActivePlans() });
}

async function listAllPlansAdmin(req, res) {
  res.json({ plans: await planModel.listAllPlans() });
}

async function createPlan(req, res) {
  try {
    const { name, description, priceCents, currency = 'usd', interval, features } = req.body;
    if (!name || !priceCents || !interval) {
      return res.status(400).json({ error: 'name, priceCents and interval are required' });
    }

    const product = await stripe.products.create({ name, description });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceCents,
      currency,
      recurring: { interval },
    });

    const plan = await planModel.createPlan({ name, description, stripePriceId: price.id, priceCents, currency, interval, features });
    res.status(201).json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create plan' });
  }
}

async function updatePlan(req, res) {
  try {
    const plan = await planModel.updatePlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update plan' });
  }
}

module.exports = { listPlans, listAllPlansAdmin, createPlan, updatePlan };
