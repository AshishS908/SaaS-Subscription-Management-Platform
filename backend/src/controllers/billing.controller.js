const stripe = require('../config/stripe');
const invoiceModel = require('../models/invoice.model');
const userModel = require('../models/user.model');

async function listInvoices(req, res) {
  res.json({ invoices: await invoiceModel.listByUser(req.user.id) });
}

async function createPortalSession(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user.stripe_customer_id) return res.status(400).json({ error: 'No billing account found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard/billing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
}

module.exports = { listInvoices, createPortalSession };
