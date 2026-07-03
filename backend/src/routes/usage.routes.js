const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { recordUsage, getMyUsage, getPlatformUsage } = require('../controllers/usage.controller');
router.post('/', authenticate, recordUsage);
router.get('/me', authenticate, getMyUsage);
router.get('/platform', authenticate, requireRole('admin'), getPlatformUsage);
module.exports = router;