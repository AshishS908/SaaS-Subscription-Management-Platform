const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { listPlans, listAllPlansAdmin, createPlan, updatePlan } = require('../controllers/plan.controller');

router.get('/', listPlans);
router.get('/admin', authenticate, requireRole('admin'), listAllPlansAdmin);
router.post('/', authenticate, requireRole('admin'), createPlan);
router.patch('/:id', authenticate, requireRole('admin'), updatePlan);

module.exports = router;
