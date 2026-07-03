const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { listInvoices, createPortalSession } = require('../controllers/billing.controller');
router.get('/invoices', authenticate, listInvoices);
router.post('/portal', authenticate, createPortalSession);
module.exports = router;