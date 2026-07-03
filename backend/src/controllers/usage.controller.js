const usageModel = require('../models/usage.model');

async function recordUsage(req, res) {
  try {
    const { metric, value } = req.body;
    if (!metric) return res.status(400).json({ error: 'metric is required' });
    const event = await usageModel.recordUsage({ userId: req.user.id, metric, value });
    res.status(201).json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record usage' });
  }
}

async function getMyUsage(req, res) {
  const days = parseInt(req.query.days, 10) || 30;
  res.json({ usage: await usageModel.getUsageSummary(req.user.id, { days }) });
}

async function getPlatformUsage(req, res) {
  const days = parseInt(req.query.days, 10) || 30;
  res.json({ usage: await usageModel.getPlatformUsageSummary({ days }) });
}

module.exports = { recordUsage, getMyUsage, getPlatformUsage };
