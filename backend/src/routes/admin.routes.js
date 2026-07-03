const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { listUsers, updateUserRole, listSubscriptions } = require('../controllers/admin.controller');
router.use(authenticate, requireRole('admin'));
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/subscriptions', listSubscriptions);
module.exports = router;