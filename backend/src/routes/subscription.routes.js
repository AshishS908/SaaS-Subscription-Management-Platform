const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createCheckoutSession, getCurrentSubscription, changePlan, cancelSubscription } = require('../controllers/subscription.controller');
router.post('/checkout', authenticate, createCheckoutSession);
router.get('/current', authenticate, getCurrentSubscription);
router.post('/change-plan', authenticate, changePlan);
router.post('/cancel', authenticate, cancelSubscription);
module.exports = router;