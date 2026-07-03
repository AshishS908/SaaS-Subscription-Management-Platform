const userModel = require('../models/user.model');
const subscriptionModel = require('../models/subscription.model');

async function listUsers(req, res) {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  res.json({ users: await userModel.listUsers({ limit, offset }) });
}

async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  res.json({ user: await userModel.updateRole(req.params.id, role) });
}

async function listSubscriptions(req, res) {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  res.json({ subscriptions: await subscriptionModel.listAll({ limit, offset }) });
}

module.exports = { listUsers, updateUserRole, listSubscriptions };
